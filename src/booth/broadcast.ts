import { PREFIX, type KV } from './storage';

export const LIVE_KEY = `${PREFIX}live`;
// Expire a snapshot left behind by a crashed tab.
const LIVE_TIMEOUT_MS = 30_000;

export interface LiveRun {
  day: string;
  rival: string;
  deltas: (number | null)[];
  updatedAt: number;
}

export function loadLiveRun(kv: KV, day: string, now = Date.now()): LiveRun | null {
  try {
    const text = kv.getItem(LIVE_KEY);
    if (!text) return null;
    const live = JSON.parse(text) as LiveRun | null;
    if (live?.day !== day || typeof live.rival !== 'string' || !Array.isArray(live.deltas)) return null;
    const age = now - live.updatedAt;
    return age >= 0 && age < LIVE_TIMEOUT_MS ? live : null;
  } catch {
    return null;
  }
}

export function saveLiveRun(kv: KV, live: LiveRun | null): void {
  try {
    if (live) kv.setItem(LIVE_KEY, JSON.stringify(live));
    else kv.removeItem(LIVE_KEY);
  } catch {
    /* Transient updates must never interrupt gameplay. */
  }
}

export const CHANNEL = 'ghost-relay';

export function openChannel(): BroadcastChannel | null {
  try {
    return typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL);
  } catch {
    return null;
  }
}
