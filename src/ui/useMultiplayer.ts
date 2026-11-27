import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  computePresence,
  createClientId,
  loadPlayerRole,
  savePlayerRole,
  type PlayerRole,
  type PresencePeer,
  type PresenceSummary,
  type RoomLiveEvent,
  type RoomLiveEventType,
} from '../game/multiplayer';
import { createLiveTransport, type LiveStatus, type LiveTransport } from '../game/multiplayerTransport';

type EventOf<T extends RoomLiveEventType> = Extract<RoomLiveEvent, { type: T }>;
type Listener = (event: RoomLiveEvent) => void;

/** Fan-out of incoming live events, so scene pieces can react without re-rendering the App. */
export interface LiveBus {
  on: <T extends RoomLiveEventType>(type: T, fn: (event: EventOf<T>) => void) => () => void;
  dispatch: (event: RoomLiveEvent) => void;
}

export function createLiveBus(): LiveBus {
  const listeners = new Map<RoomLiveEventType, Set<Listener>>();
  return {
    on(type, fn) {
      const set = listeners.get(type) ?? new Set<Listener>();
      listeners.set(type, set);
      const listener = fn as Listener;
      set.add(listener);
      return () => {
        set.delete(listener);
      };
    },
    dispatch(event) {
      for (const fn of Array.from(listeners.get(event.type) ?? [])) {
        try {
          fn(event);
        } catch {
          // One misbehaving listener never breaks the live link.
        }
      }
    },
  };
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

export interface Multiplayer {
  clientId: string;
  /** Who plays on this device (null = not chosen; both residents stroll on their own). */
  role: PlayerRole | null;
  setRole: (role: PlayerRole | null) => void;
  status: LiveStatus;
  peers: PresencePeer[];
  presence: PresenceSummary;
  /** Increments with every presence update received (0 = none yet). */
  presenceEpoch: number;
  /** Stable key of the other connected clients; changes whenever someone joins or leaves. */
  partnersKey: string;
  /** Broadcasts an event to the partner's device (no-op while offline). */
  send: (event: RoomLiveEvent) => void;
  bus: LiveBus;
}

/**
 * React binding for the live 2-player room: remembers this device's role, keeps one realtime
 * connection (Supabase Realtime in production, the `/api/live` SSE relay locally), and exposes
 * presence plus an event bus for incoming partner actions.
 */
export function useMultiplayer(storage: StorageLike | undefined): Multiplayer {
  const [clientId] = useState(() => createClientId());
  const [role, setRoleState] = useState<PlayerRole | null>(() => loadPlayerRole(storage));
  const [peers, setPeers] = useState<PresencePeer[]>([]);
  const [presenceEpoch, setPresenceEpoch] = useState(0);
  const [status, setStatus] = useState<LiveStatus>('connecting');
  const [bus] = useState(createLiveBus);
  const transportRef = useRef<LiveTransport | null>(null);
  const roleRef = useRef(role);

  useEffect(() => {
    let transport: LiveTransport | null = null;
    try {
      transport = createLiveTransport({
        clientId,
        role: roleRef.current,
        handlers: {
          onPresence: (next) => {
            setPeers(next);
            setPresenceEpoch((n) => n + 1);
          },
          onEvent: (event) => bus.dispatch(event),
          onStatus: setStatus,
        },
      });
    } catch {
      setStatus('offline');
    }
    transportRef.current = transport;
    return () => {
      transport?.close();
      if (transportRef.current === transport) transportRef.current = null;
    };
  }, [bus, clientId]);

  const setRole = useCallback(
    (next: PlayerRole | null) => {
      roleRef.current = next;
      setRoleState(next);
      savePlayerRole(storage, next);
      transportRef.current?.setRole(next);
    },
    [storage],
  );

  const send = useCallback((event: RoomLiveEvent) => {
    try {
      transportRef.current?.send(event);
    } catch {
      // Offline: the shared save + polling still keep both rooms in step.
    }
  }, []);

  const presence = useMemo(() => computePresence(peers, clientId), [peers, clientId]);
  const partnersKey = useMemo(
    () =>
      peers
        .filter((p) => p.clientId !== clientId)
        .map((p) => `${p.clientId}:${p.role ?? ''}`)
        .sort()
        .join(','),
    [peers, clientId],
  );

  return { clientId, role, setRole, status, peers, presence, presenceEpoch, partnersKey, send, bus };
}
