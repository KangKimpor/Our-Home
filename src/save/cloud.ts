import type { GameState, SaveEnvelope } from '../game/types';
import { isEnvelope } from './schema';

export type CloudState = 'unconfigured' | 'signed-out' | 'signed-in' | 'syncing' | 'offline' | 'error';

export interface CloudUser {
  sub: string;
  email?: string;
  name?: string;
}

export interface CloudStatus {
  state: CloudState;
  user: CloudUser | null;
  lastError?: string;
  lastSyncedAt?: number;
}

const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env ?? {};

const config = {
  domain: env.VITE_AUTH0_DOMAIN ?? '',
  clientId: env.VITE_AUTH0_CLIENT_ID ?? '',
  audience: env.VITE_AUTH0_AUDIENCE ?? '',
  supabaseUrl: env.VITE_SUPABASE_URL ?? '',
  supabaseKey: env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '',
};

export function cloudConfigured(): boolean {
  return Boolean(config.domain && config.clientId && config.supabaseUrl && config.supabaseKey);
}

export function cloudConfigSummary(): { auth0: boolean; supabase: boolean } {
  return { auth0: Boolean(config.domain && config.clientId), supabase: Boolean(config.supabaseUrl && config.supabaseKey) };
}

let status: CloudStatus = {
  state: cloudConfigured() ? 'signed-out' : 'unconfigured',
  user: null,
};
const listeners = new Set<(status: CloudStatus) => void>();

function emit(patch: Partial<CloudStatus>): void {
  status = { ...status, ...patch };
  listeners.forEach((listener) => listener(status));
}

export function getCloudStatus(): CloudStatus {
  return status;
}

export function subscribeCloud(listener: (status: CloudStatus) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

let auth0Client: { getUser: () => Promise<Record<string, unknown> | undefined>; getTokenSilently: (opts?: unknown) => Promise<string>; loginWithRedirect: (opts?: unknown) => Promise<void>; logout: (opts?: unknown) => Promise<void>; handleRedirectCallback: () => Promise<unknown>; isAuthenticated: () => Promise<boolean> } | null = null;
let supabaseClient: { from: (table: string) => any } | null = null;

async function getAuth0() {
  if (auth0Client) return auth0Client;
  if (!cloudConfigured()) throw new Error('Cloud save is not configured yet.');
  const { createAuth0Client } = await import('@auth0/auth0-spa-js');
  const client = await createAuth0Client({
    domain: config.domain,
    clientId: config.clientId,
    cacheLocation: 'localstorage',
    useRefreshTokens: true,
    authorizationParams: {
      redirect_uri: window.location.origin,
      ...(config.audience ? { audience: config.audience } : {}),
    },
  });
  if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
    await client.handleRedirectCallback();
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  auth0Client = client as unknown as typeof auth0Client;
  return auth0Client!;
}

async function getSupabase() {
  if (supabaseClient) return supabaseClient;
  const { createClient } = await import('@supabase/supabase-js');
  if (!config.supabaseUrl || !config.supabaseKey) throw new Error('Supabase is not configured yet.');
  supabaseClient = createClient(config.supabaseUrl, config.supabaseKey, {
    accessToken: async () => {
      const client = await getAuth0();
      try {
        return await client.getTokenSilently(
          config.audience ? { authorizationParams: { audience: config.audience } } : undefined,
        );
      } catch {
        return '';
      }
    },
  });
  return supabaseClient;
}

export async function refreshCloudUser(): Promise<CloudStatus> {
  if (!cloudConfigured()) {
    emit({ state: 'unconfigured', user: null });
    return status;
  }
  try {
    const client = await getAuth0();
    const authenticated = await client.isAuthenticated();
    if (!authenticated) {
      emit({ state: 'signed-out', user: null });
      return status;
    }
    const user = await client.getUser();
    emit({
      state: 'signed-in',
      user: user
        ? { sub: String(user.sub ?? ''), email: user.email as string | undefined, name: user.name as string | undefined }
        : null,
      lastError: undefined,
    });
  } catch (error) {
    emit({ state: 'error', lastError: error instanceof Error ? error.message : String(error) });
  }
  return status;
}

export async function signIn(): Promise<void> {
  const client = await getAuth0();
  await client.loginWithRedirect({ appState: { returnTo: window.location.pathname } });
}

export async function signOut(): Promise<void> {
  const client = await getAuth0();
  await client.logout({ logoutParams: { returnTo: window.location.origin } });
  emit({ state: 'signed-out', user: null });
}

export async function fetchCloudSave(): Promise<SaveEnvelope | null> {
  const user = status.user;
  if (!user?.sub) return null;
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('saves')
    .select('data, version, revision, device_id, updated_at')
    .eq('user_id', user.sub)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const envelope: SaveEnvelope = {
    version: Number(data.version ?? 1),
    revision: Number(data.revision ?? 1),
    deviceId: String(data.device_id ?? 'cloud'),
    savedAt: data.updated_at ? new Date(data.updated_at).getTime() : Date.now(),
    state: data.data as GameState,
  };
  if (!isEnvelope(envelope)) throw new Error('Cloud save could not be read.');
  return envelope;
}

export async function uploadCloudSave(envelope: SaveEnvelope): Promise<void> {
  const user = status.user;
  if (!user?.sub) throw new Error('Sign in first.');
  emit({ state: 'syncing' });
  try {
    const supabase = await getSupabase();
    const { error } = await supabase.from('saves').upsert(
      {
        user_id: user.sub,
        data: envelope.state,
        version: envelope.version,
        revision: envelope.revision,
        device_id: envelope.deviceId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );
    if (error) throw error;
    const { data: snapshots } = await supabase
      .from('save_snapshots')
      .select('id')
      .eq('user_id', user.sub)
      .order('created_at', { ascending: false });
    if (Array.isArray(snapshots) && snapshots.length > 1) {
      const keep = new Set(snapshots.slice(0, 10).map((s: { id: string }) => s.id));
      const old = snapshots.slice(10).map((s: { id: string }) => s.id);
      if (old.length) await supabase.from('save_snapshots').delete().in('id', old);
      void keep;
    }
    await supabase.from('save_snapshots').insert({ user_id: user.sub, data: envelope.state });
    emit({ state: 'signed-in', lastSyncedAt: Date.now(), lastError: undefined });
  } catch (error) {
    emit({ state: 'error', lastError: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

export async function deleteCloudData(): Promise<void> {
  const user = status.user;
  if (!user?.sub) throw new Error('Sign in first.');
  const supabase = await getSupabase();
  const first = await supabase.from('save_snapshots').delete().eq('user_id', user.sub);
  if (first.error) throw first.error;
  const second = await supabase.from('saves').delete().eq('user_id', user.sub);
  if (second.error) throw second.error;
}

/** Test hook: the client is intentionally lazy. */
export function resetCloudClientForTests(): void {
  auth0Client = null;
  supabaseClient = null;
  status = { state: cloudConfigured() ? 'signed-out' : 'unconfigured', user: null };
}
