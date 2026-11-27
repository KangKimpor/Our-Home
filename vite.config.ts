import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, type Connect, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import {
  applyHomeStateRequest,
  createDefaultHomeState,
  NO_STORE_HEADERS as SHARED_NO_STORE_HEADERS,
  parseHomeStateRequest,
  type SharedHomeState,
} from './src/game/sharedHomeCore';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
};

function createBuildVersion(): { version: string; builtAt: string } {
  const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
    version?: string;
  };
  const pkgVersion = pkg.version || '0.0.0';
  let sha = '';
  try {
    sha = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    // Git metadata may be absent in packaged builds.
  }
  const stamp = Date.now().toString(36);
  const version = sha ? `${pkgVersion}-${sha}-${stamp}` : `${pkgVersion}-${stamp}`;
  return { version, builtAt: new Date().toISOString() };
}

function appVersionPlugin(): Plugin {
  const meta = createBuildVersion();
  const payload = JSON.stringify(meta, null, 2);

  return {
    name: 'our-home-app-version',
    config() {
      return {
        define: {
          __APP_VERSION__: JSON.stringify(meta.version),
        },
      };
    },
    transformIndexHtml(html) {
      return {
        html,
        tags: [
          {
            tag: 'meta',
            attrs: { name: 'app-version', content: meta.version },
            injectTo: 'head',
          },
        ],
      };
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: payload,
      });
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split('?')[0];
        if (pathname === '/version.json') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          for (const [k, v] of Object.entries(NO_CACHE_HEADERS)) res.setHeader(k, v);
          res.end(payload);
          return;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split('?')[0];
        if (
          pathname === '/' ||
          pathname === '/index.html' ||
          pathname === '/version.json' ||
          pathname === '/sw.js'
        ) {
          for (const [k, v] of Object.entries(NO_CACHE_HEADERS)) res.setHeader(k, v);
        }
        next();
      });
    },
  };
}

/**
 * Local stand-in for `api/home-state.ts` during `vite` dev and `vite preview`.
 * Holds the one shared save in memory so several browsers on this machine share a room.
 *
 * Test isolation: a request may carry an `x-our-home-save-ns` header or an
 * `our-home-save-ns` cookie to address its own in-memory room, so parallel
 * Playwright tests never trample each other. Production ignores both.
 */
function sharedHomeDevApiPlugin(): Plugin {
  const rooms = new Map<string, SharedHomeState>();
  const NS_COOKIE = 'our-home-save-ns';

  const namespaceOf = (req: IncomingMessage): string => {
    const header = req.headers['x-our-home-save-ns'];
    if (typeof header === 'string' && header) return header;
    const cookie = req.headers.cookie ?? '';
    for (const part of cookie.split(';')) {
      const [k, ...rest] = part.trim().split('=');
      if (k === NS_COOKIE && rest.length) return decodeURIComponent(rest.join('='));
    }
    return 'default';
  };

  const roomOf = (ns: string): SharedHomeState => rooms.get(ns) ?? createDefaultHomeState();

  const send = (res: ServerResponse, status: number, payload: unknown) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    for (const [k, v] of Object.entries(SHARED_NO_STORE_HEADERS)) res.setHeader(k, v);
    res.end(JSON.stringify(payload));
  };

  const readBody = (req: IncomingMessage): Promise<unknown> =>
    new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      req.on('data', (c: Buffer) => chunks.push(c));
      req.on('end', () => {
        try {
          const text = Buffer.concat(chunks).toString('utf8');
          resolve(text ? JSON.parse(text) : null);
        } catch (err) {
          reject(err);
        }
      });
      req.on('error', reject);
    });

  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    const pathname = req.url?.split('?')[0];
    if (pathname !== '/api/home-state') return next();
    const ns = namespaceOf(req);
    const method = (req.method ?? 'GET').toUpperCase();

    if (method === 'GET') return send(res, 200, { state: roomOf(ns), backend: 'memory' });
    if (method === 'DELETE') {
      rooms.delete(ns);
      return send(res, 200, { state: roomOf(ns), backend: 'memory' });
    }
    if (method === 'PUT') {
      readBody(req).then(
        (body) => {
          const request = parseHomeStateRequest(body);
          if (request.kind === 'invalid')
            return send(res, 400, { error: 'Expected { patch } or { reset: true }' });
          const next = applyHomeStateRequest(roomOf(ns), request);
          rooms.set(ns, next);
          send(res, 200, { state: next, backend: 'memory' });
        },
        () => send(res, 400, { error: 'Invalid JSON body' }),
      );
      return;
    }
    res.setHeader('Allow', 'GET, PUT, DELETE');
    send(res, 405, { error: 'Method not allowed' });
  };

  return {
    name: 'our-home-shared-home-api',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

export default defineConfig({
  plugins: [react(), appVersionPlugin(), sharedHomeDevApiPlugin()],
  build: { target: 'es2020' },
});
