/**
 * Vercel Serverless Function: the couple's ONE shared living room save.
 *
 *   GET  /api/home-state                     -> { state, backend }
 *   PUT  /api/home-state  { patch }          -> field-level merge, revision + 1
 *   PUT  /api/home-state  { reset: true }    -> restore defaults, revision + 1
 *
 * Zero external dependencies: standard Node http types + built-in fetch.
 * Persistence is auto-detected in priority order:
 *   1. Upstash Redis / Vercel KV REST  (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN,
 *                                       or KV_REST_API_URL + KV_REST_API_TOKEN)
 *   2. Supabase REST                    (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY / anon key)
 *   3. Unconfigured                     -> { state: null, backend: 'unconfigured' } (HTTP 200)
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  applyHomeStateRequest,
  NO_STORE_HEADERS,
  parseHomeStateRequest,
  sanitizeSharedHomeState,
  SHARED_SAVE_KEY,
  SHARED_SAVE_ROW_ID,
  type SharedHomeState,
} from '../src/game/sharedHomeCore.js';

type Backend = 'upstash' | 'supabase' | 'unconfigured';

/** Opaque version token used for compare-and-set writes. */
interface Stored {
  state: SharedHomeState | null;
  token: string | null;
}

interface Store {
  name: Exclude<Backend, 'unconfigured'>;
  read(): Promise<Stored>;
  /** Writes `next` only if the stored value still matches `prev.token`. Returns false on conflict. */
  write(prev: Stored, next: SharedHomeState): Promise<boolean>;
}

const MAX_BODY_BYTES = 16 * 1024;
const MAX_WRITE_ATTEMPTS = 4;

const env = (name: string): string | undefined => {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
};

const trimSlash = (url: string) => url.replace(/\/+$/, '');

// ---------------------------------------------------------------------------
// Upstash Redis / Vercel KV (REST)
// ---------------------------------------------------------------------------

/** Atomic compare-and-set: only SET when the current value equals ARGV[1] ('' = missing). */
const CAS_SCRIPT = [
  "local cur = redis.call('GET', KEYS[1])",
  "if (cur == false and ARGV[1] == '') or cur == ARGV[1] then",
  "  redis.call('SET', KEYS[1], ARGV[2])",
  '  return 1',
  'end',
  'return 0',
].join('\n');

function upstashStore(): Store | null {
  const url = env('UPSTASH_REDIS_REST_URL') ?? env('KV_REST_API_URL');
  const token = env('UPSTASH_REDIS_REST_TOKEN') ?? env('KV_REST_API_TOKEN');
  if (!url || !token) return null;
  const base = trimSlash(url);

  const command = async (args: string[]): Promise<unknown> => {
    const res = await fetch(base, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
      cache: 'no-store',
    });
    const data = (await res.json().catch(() => null)) as { result?: unknown; error?: string } | null;
    if (!res.ok || !data || data.error) {
      throw new Error(`Upstash ${String(args[0])} failed (${res.status}): ${data?.error ?? 'unknown error'}`);
    }
    return data.result;
  };

  return {
    name: 'upstash',
    async read() {
      const raw = await command(['GET', SHARED_SAVE_KEY]);
      if (typeof raw !== 'string') return { state: null, token: null };
      try {
        return { state: sanitizeSharedHomeState(JSON.parse(raw)), token: raw };
      } catch {
        return { state: null, token: raw };
      }
    },
    async write(prev, next) {
      const json = JSON.stringify(next);
      try {
        const result = await command(['EVAL', CAS_SCRIPT, '1', SHARED_SAVE_KEY, prev.token ?? '', json]);
        return Number(result) === 1;
      } catch (err) {
        // Scripting unavailable on this database: fall back to a plain last-write-wins SET.
        if (err instanceof Error && /EVAL/.test(err.message)) {
          await command(['SET', SHARED_SAVE_KEY, json]);
          return true;
        }
        throw err;
      }
    },
  };
}

// ---------------------------------------------------------------------------
// Supabase (PostgREST) — single fixed row `public.shared_home where id = 'our-home'`
// ---------------------------------------------------------------------------

function supabaseStore(): Store | null {
  const url = env('SUPABASE_URL') ?? env('VITE_SUPABASE_URL');
  const key =
    env('SUPABASE_SERVICE_ROLE_KEY') ?? env('SUPABASE_ANON_KEY') ?? env('VITE_SUPABASE_PUBLISHABLE_KEY');
  if (!url || !key) return null;
  const table = `${trimSlash(url)}/rest/v1/shared_home`;
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  interface Row {
    state: unknown;
    revision: number | string;
    updated_at: string;
  }

  const parseRows = async (res: Response, what: string): Promise<Row[]> => {
    if (res.status === 409) return [];
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Supabase ${what} failed (${res.status}): ${text.slice(0, 200)}`);
    }
    const rows = (await res.json().catch(() => [])) as unknown;
    return Array.isArray(rows) ? (rows as Row[]) : [];
  };

  const rowToState = (row: Row): SharedHomeState =>
    sanitizeSharedHomeState({
      ...(row.state as object),
      revision: Number(row.revision),
      updatedAt: row.updated_at,
    });

  return {
    name: 'supabase',
    async read() {
      const res = await fetch(`${table}?id=eq.${SHARED_SAVE_ROW_ID}&select=state,revision,updated_at`, {
        headers,
        cache: 'no-store',
      });
      const rows = await parseRows(res, 'read');
      const row = rows[0];
      if (!row) return { state: null, token: null };
      return { state: rowToState(row), token: String(row.revision) };
    },
    async write(prev, next) {
      const body = JSON.stringify({
        id: SHARED_SAVE_ROW_ID,
        state: next,
        revision: next.revision,
        updated_at: next.updatedAt,
      });
      if (prev.token === null) {
        // First write ever: plain insert; a 409 means another device won the race.
        const res = await fetch(table, {
          method: 'POST',
          headers: { ...headers, Prefer: 'return=representation' },
          body,
          cache: 'no-store',
        });
        return (await parseRows(res, 'insert')).length > 0;
      }
      // Optimistic concurrency: only update if nobody else bumped the revision meanwhile.
      const res = await fetch(
        `${table}?id=eq.${SHARED_SAVE_ROW_ID}&revision=eq.${encodeURIComponent(prev.token)}`,
        {
          method: 'PATCH',
          headers: { ...headers, Prefer: 'return=representation' },
          body,
          cache: 'no-store',
        },
      );
      return (await parseRows(res, 'update')).length > 0;
    },
  };
}

function detectStore(): Store | null {
  return upstashStore() ?? supabaseStore();
}

// ---------------------------------------------------------------------------
// HTTP plumbing
// ---------------------------------------------------------------------------

function send(
  res: ServerResponse,
  status: number,
  payload: unknown,
  extra: Record<string, string> = {},
): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  for (const [k, v] of Object.entries(NO_STORE_HEADERS)) res.setHeader(k, v);
  for (const [k, v] of Object.entries(extra)) res.setHeader(k, v);
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  // Vercel's Node runtime may already have parsed the body for us.
  const preParsed = (req as IncomingMessage & { body?: unknown }).body;
  if (preParsed !== undefined && preParsed !== null) {
    if (typeof preParsed === 'string') return JSON.parse(preParsed);
    if (preParsed instanceof Uint8Array) return JSON.parse(Buffer.from(preParsed).toString('utf8'));
    return preParsed;
  }
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buf = typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Buffer);
    size += buf.length;
    if (size > MAX_BODY_BYTES) throw new Error('Body too large');
    chunks.push(buf);
  }
  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : null;
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const method = (req.method ?? 'GET').toUpperCase();
  const store = detectStore();

  try {
    if (method === 'GET' || method === 'HEAD') {
      if (!store) return send(res, 200, { state: null, backend: 'unconfigured' satisfies Backend });
      const { state } = await store.read();
      return send(res, 200, { state, backend: store.name });
    }

    if (method === 'PUT' || method === 'POST') {
      let body: unknown;
      try {
        body = await readJsonBody(req);
      } catch {
        return send(res, 400, { error: 'Invalid JSON body' });
      }
      const request = parseHomeStateRequest(body);
      if (request.kind === 'invalid') {
        return send(res, 400, { error: 'Expected { patch } or { reset: true }' });
      }
      if (!store) return send(res, 200, { state: null, backend: 'unconfigured' satisfies Backend });

      for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt += 1) {
        const prev = await store.read();
        const current = prev.state ?? sanitizeSharedHomeState(null);
        const next = applyHomeStateRequest(current, request);
        if (await store.write(prev, next)) {
          return send(res, 200, { state: next, backend: store.name });
        }
      }
      return send(res, 409, { error: 'The shared save is busy, please retry' });
    }

    return send(res, 405, { error: 'Method not allowed' }, { Allow: 'GET, PUT' });
  } catch (err) {
    console.error('[home-state]', err);
    return send(res, 502, { error: 'Shared save backend unavailable' });
  }
}
