import { describe, it, expect } from 'vitest';
import { FakeStorage } from './helpers/fakeStorage';
import { fakeRecord } from './helpers/records';
import { topRuns, trimRuns, MAX_RECORDS, RUNS_PREFIX, safeSet } from '../src/booth/storage';

describe('storage', () => {
  it('drops inputs beyond the latest 30 and top 10', () => {
    const runs = Array.from({ length: 60 }, (_, i) => fakeRecord(`r${i}`, 2000 + (i < 5 ? -i * 10 : i)));
    const trimmed = trimRuns(runs);
    const withInputs = trimmed.filter((r) => r.inputs !== null).map((r) => r.id);
    expect(withInputs.length).toBe(40);
    expect(withInputs).toContain('r0');
    expect(trimmed.find((r) => r.id === 'r20')!.inputs).toBeNull();
  });

  it('keeps the fastest ghosts when the daily history fills up', () => {
    const runs = Array.from({ length: MAX_RECORDS + 20 }, (_, i) => fakeRecord(`r${i}`, 1600 + i));
    const trimmed = trimRuns(runs);
    expect(trimmed).toHaveLength(MAX_RECORDS);
    expect(topRuns(trimmed, 10)).toEqual(runs.slice(0, 10));
    expect(trimmed.slice(-30)).toEqual(runs.slice(-30));
    expect(trimmed.some((r) => r.id === runs[10].id)).toBe(false);
  });


  it('on quota error deletes the oldest day and retries once', () => {
    const kv = new FakeStorage(3000);
    kv.setItem(RUNS_PREFIX + '2026-11-01', 'x'.repeat(1000));
    expect(safeSet(kv, RUNS_PREFIX + '2026-11-20', 'y'.repeat(1000), '2026-11-20')).toBe(true);
    expect(kv.getItem(RUNS_PREFIX + '2026-11-01')).toBeNull();
    expect(safeSet(kv, RUNS_PREFIX + '2026-11-20', 'y'.repeat(5000), '2026-11-20')).toBe(false);
  });

});
