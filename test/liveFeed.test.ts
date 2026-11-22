import { expect, it } from 'vitest';
import { LiveFeed } from '../src/booth/liveFeed';
import { loadLiveRun } from '../src/booth/broadcast';
import type { KV } from '../src/booth/storage';

function memoryKv(): KV {
  const data = new Map<string, string>();
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  } as KV;
}

it('publishes gate deltas for the second monitor and clears after the run', () => {
  const kv = memoryKv();
  const posted: unknown[] = [];
  const channel = { postMessage: (m: unknown) => posted.push(m) } as unknown as BroadcastChannel;
  const feed = new LiveFeed(kv, channel, () => 1000);
  feed.start('2026-11-21', 'ABC', 3);
  feed.gate(1, -12);
  expect(loadLiveRun(kv, '2026-11-21', 1000)?.deltas).toEqual([null, -12, null]);
  feed.clear();
  expect(loadLiveRun(kv, '2026-11-21', 1000)).toBeNull();
  expect(posted).toHaveLength(3);
});

it('ignores gate updates when no run is live', () => {
  const kv = memoryKv();
  const feed = new LiveFeed(kv, null, () => 1000);
  feed.gate(0, 5);
  expect(loadLiveRun(kv, '2026-11-21', 1000)).toBeNull();
});
