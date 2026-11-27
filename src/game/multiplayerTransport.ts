import {
  LIVE_BROADCAST_EVENT,
  LIVE_CHANNEL,
  LIVE_ENDPOINT,
  isClientId,
  isPlayerRole,
  parseLiveServerMessage,
  sanitizeLiveEvent,
  type PlayerRole,
  type PresencePeer,
  type RoomLiveEvent,
} from './multiplayer';

export type LiveStatus = 'connecting' | 'online' | 'offline';

export interface LiveHandlers {
  onPresence: (peers: PresencePeer[]) => void;
  onEvent: (event: RoomLiveEvent, fromClientId: string) => void;
  onStatus?: (status: LiveStatus) => void;
}

/** A realtime link to the partner's device. Every method is safe to call while offline. */
export interface LiveTransport {
  readonly kind: 'supabase' | 'sse' | 'none';
  /** Updates the role this client announces in presence. */
  setRole: (role: PlayerRole | null) => void;
  /** Broadcasts an event to every other connected client (never echoed back to us). */
  send: (event: RoomLiveEvent) => void;
  close: () => void;
}

export interface LiveTransportOptions {
  clientId: string;
  role: PlayerRole | null;
  handlers: LiveHandlers;
}

export interface SupabaseLiveConfig {
  url: string;
  key: string;
}

/** Public Supabase Realtime config from the build env (never a service-role key). */
export function supabaseLiveConfig(
  env: Record<string, unknown> = import.meta.env as Record<string, unknown>,
): SupabaseLiveConfig | null {
  const url = typeof env.VITE_SUPABASE_URL === 'string' ? env.VITE_SUPABASE_URL.trim() : '';
  const key = typeof env.VITE_SUPABASE_PUBLISHABLE_KEY === 'string' ? env.VITE_SUPABASE_PUBLISHABLE_KEY.trim() : '';
  return url && key ? { url, key } : null;
}

/** Production: Supabase Realtime Presence (join/leave) + Broadcast (instant events). */
export function createSupabaseTransport(config: SupabaseLiveConfig, options: LiveTransportOptions): LiveTransport {
  const { clientId, handlers } = options;
  let role = options.role;
  let closed = false;
  let subscribed = false;
  let teardown: (() => void) | null = null;
  let channel: {
    track: (payload: Record<string, unknown>) => Promise<unknown>;
    send: (msg: { type: 'broadcast'; event: string; payload: unknown }) => Promise<unknown>;
  } | null = null;

  const track = () => {
    if (!channel || !subscribed) return;
    channel.track({ clientId, role }).catch(() => undefined);
  };

  handlers.onStatus?.('connecting');
  // Loaded lazily so local/offline builds never download the Supabase client.
  void import('@supabase/supabase-js')
    .then(({ createClient }) => {
      if (closed) return;
      const client = createClient(config.url, config.key, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        realtime: { params: { eventsPerSecond: 15 } },
      });
      const ch = client.channel(LIVE_CHANNEL, {
        config: { broadcast: { self: false }, presence: { key: clientId } },
      });
      ch.on('presence', { event: 'sync' }, () => {
        const state = ch.presenceState() as Record<string, Array<Record<string, unknown>>>;
        const peers: PresencePeer[] = [];
        for (const metas of Object.values(state)) {
          const meta = metas[metas.length - 1];
          if (meta && isClientId(meta.clientId)) {
            peers.push({ clientId: meta.clientId, role: isPlayerRole(meta.role) ? meta.role : null });
          }
        }
        handlers.onPresence(peers);
      });
      ch.on('broadcast', { event: LIVE_BROADCAST_EVENT }, (msg: { payload?: unknown }) => {
        const payload = msg.payload as { from?: unknown; event?: unknown } | undefined;
        if (!payload || !isClientId(payload.from) || payload.from === clientId) return;
        const event = sanitizeLiveEvent(payload.event);
        if (event) handlers.onEvent(event, payload.from);
      });
      ch.subscribe((status: string) => {
        if (closed) return;
        if (status === 'SUBSCRIBED') {
          subscribed = true;
          handlers.onStatus?.('online');
          track();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          subscribed = false;
          handlers.onStatus?.('offline');
          handlers.onPresence([]);
        }
      });
      channel = ch as unknown as typeof channel;
      teardown = () => {
        void client.removeChannel(ch).catch(() => undefined);
      };
    })
    .catch(() => {
      if (!closed) handlers.onStatus?.('offline');
    });

  return {
    kind: 'supabase',
    setRole(next) {
      role = next;
      track();
    },
    send(event) {
      if (!channel || !subscribed) return;
      channel
        .send({ type: 'broadcast', event: LIVE_BROADCAST_EVENT, payload: { from: clientId, event } })
        .catch(() => undefined);
    },
    close() {
      closed = true;
      subscribed = false;
      teardown?.();
      teardown = null;
      channel = null;
    },
  };
}

/** Local dev / preview / E2E: Server-Sent Events stream + POSTs to the `/api/live` relay. */
export function createSseTransport(options: LiveTransportOptions): LiveTransport {
  const { clientId, handlers } = options;
  let role = options.role;
  let closed = false;
  let source: EventSource | null = null;

  const post = (body: unknown) => {
    if (closed || typeof fetch !== 'function') return;
    void fetch(LIVE_ENDPOINT, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => undefined);
  };

  if (typeof EventSource === 'function') {
    handlers.onStatus?.('connecting');
    const params = new URLSearchParams({ clientId, role: role ?? '' });
    try {
      source = new EventSource(`${LIVE_ENDPOINT}?${params.toString()}`);
    } catch {
      source = null;
      handlers.onStatus?.('offline');
    }
    if (source) {
      source.onopen = () => {
        handlers.onStatus?.('online');
        // The server learns our role from the URL; re-announce in case it changed meanwhile.
        if (role) post({ type: 'presence', clientId, role });
      };
      source.onerror = () => {
        // EventSource reconnects on its own; meanwhile treat the partner as away.
        handlers.onStatus?.('offline');
        handlers.onPresence([]);
      };
      source.onmessage = (e: MessageEvent<string>) => {
        let data: unknown;
        try {
          data = JSON.parse(e.data);
        } catch {
          return;
        }
        const msg = parseLiveServerMessage(data);
        if (!msg) return;
        if (msg.type === 'presence') handlers.onPresence(msg.peers);
        else if (msg.from !== clientId) handlers.onEvent(msg.event, msg.from);
      };
    }
  } else {
    handlers.onStatus?.('offline');
  }

  return {
    kind: 'sse',
    setRole(next) {
      role = next;
      post({ type: 'presence', clientId, role: next });
    },
    send(event) {
      if (!source || source.readyState !== 1) return;
      post({ type: 'event', clientId, event });
    },
    close() {
      closed = true;
      source?.close();
      source = null;
    },
  };
}

/** Supabase Realtime when the public env vars are configured, otherwise the local SSE relay. */
export function createLiveTransport(
  options: LiveTransportOptions,
  config: SupabaseLiveConfig | null = supabaseLiveConfig(),
): LiveTransport {
  return config ? createSupabaseTransport(config, options) : createSseTransport(options);
}
