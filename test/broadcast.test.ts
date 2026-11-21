import { expect, it } from 'vitest';
import { LIVE_KEY, loadLiveRun, saveLiveRun, type LiveRun } from '../src/booth/broadcast';
import { MemoryKV } from '../src/booth/memoryKv';

it('restores the latest live splits without a channel and expires abandoned runs', () => {
  const kv = new MemoryKV();
  const day = '2026-11-20~2';
  const start: LiveRun = { day, rival: 'ABC', deltas: [null, null, null, null, null, null], updatedAt: 1_000 };
  saveLiveRun(kv, start);
  const split = { ...start, deltas: [-9, null, null, null, null, null], updatedAt: 7_000 };
  saveLiveRun(kv, split);

  expect(loadLiveRun(kv, day, 7_500)).toEqual(split);
  expect(loadLiveRun(kv, '2026-11-20', 7_500)).toBeNull();
  expect(loadLiveRun(kv, day, 37_000)).toBeNull();
  saveLiveRun(kv, null);
  expect(loadLiveRun(kv, day, 7_500)).toBeNull();
  kv.setItem(LIVE_KEY, '{invalid');
  expect(loadLiveRun(kv, day, 7_500)).toBeNull();
});

it('expires booth heartbeats so a closed or suspended player tab is visible', async () => {
  const { saveBoothStatus, loadBoothStatus } = await import('../src/booth/broadcast');
  const kv = new MemoryKV();
  saveBoothStatus(kv, { state: 'run', day: 'today', updatedAt: 1000, persistent: true });
  expect(loadBoothStatus(kv, 2000)?.state).toBe('run');
  expect(loadBoothStatus(kv, 7000)).toBeNull();
  expect(loadBoothStatus(kv, 999)).toBeNull();
});
