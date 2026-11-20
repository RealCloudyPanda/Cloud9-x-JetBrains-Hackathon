import { describe, it, expect } from 'vitest';
import { FakeStorage } from './helpers/fakeStorage';
import { fakeRecord } from './helpers/records';
import { appendRun, loadMeta, loadRuns, saveMeta, startNewDay, trimRuns, RUNS_PREFIX, safeSet, updateRun } from '../src/booth/storage';
import { nextStreak } from '../src/booth/streak';

describe('storage', () => {
  it('appends and reloads runs', () => {
    const kv = new FakeStorage();
    appendRun(kv, '2026-11-20', fakeRecord('a', 1800));
    appendRun(kv, '2026-11-20', fakeRecord('b', 1700));
    expect(loadRuns(kv, '2026-11-20').map((r) => r.id)).toEqual(['a', 'b']);
    updateRun(kv, '2026-11-20', 'a', { initials: 'ZED' });
    expect(loadRuns(kv, '2026-11-20')[0].initials).toBe('ZED');
  });

  it('drops inputs beyond the latest 30 and top 10', () => {
    const runs = Array.from({ length: 60 }, (_, i) => fakeRecord(`r${i}`, 2000 + (i < 5 ? -i * 10 : i)));
    const trimmed = trimRuns(runs);
    const withInputs = trimmed.filter((r) => r.inputs !== null).map((r) => r.id);
    expect(withInputs.length).toBe(40); // 30 latest + 10 older top runs
    expect(withInputs).toContain('r0');
    expect(trimmed.find((r) => r.id === 'r20')!.inputs).toBeNull();
  });

  it('rolls over to a fresh board on a new date, keeping settings', () => {
    const kv = new FakeStorage();
    const m = loadMeta(kv, '2026-11-20');
    m.runCounter = 9;
    m.relayStreak = 3;
    m.settings.sound = false;
    saveMeta(kv, m);
    expect(loadMeta(kv, '2026-11-20').runCounter).toBe(9);
    const next = loadMeta(kv, '2026-11-21');
    expect(next.currentDay).toBe('2026-11-21');
    expect(next.runCounter).toBe(0);
    expect(next.settings.sound).toBe(false);
  });

  it('Start new day gives an empty board on the same date', () => {
    const kv = new FakeStorage();
    const m = loadMeta(kv, '2026-11-20');
    appendRun(kv, m.currentDay, fakeRecord('a', 1800));
    const fresh = startNewDay(kv, m, '2026-11-20');
    expect(fresh.currentDay).toBe('2026-11-20~2');
    expect(loadRuns(kv, fresh.currentDay)).toEqual([]);
    expect(loadMeta(kv, '2026-11-20').currentDay).toBe('2026-11-20~2');
  });

  it('on quota error deletes the oldest day and retries once', () => {
    const kv = new FakeStorage(3000);
    kv.setItem(RUNS_PREFIX + '2026-11-01', 'x'.repeat(1000));
    expect(safeSet(kv, RUNS_PREFIX + '2026-11-20', 'y'.repeat(1000), '2026-11-20')).toBe(true);
    expect(kv.getItem(RUNS_PREFIX + '2026-11-01')).toBeNull();
    expect(safeSet(kv, RUNS_PREFIX + '2026-11-20', 'y'.repeat(5000), '2026-11-20')).toBe(false);
  });

  it('streak increments on a win and resets on a loss', () => {
    expect(nextStreak(2, true)).toBe(3);
    expect(nextStreak(2, false)).toBe(0);
  });
});
