import { describe, it, expect } from 'vitest';
import { pickRival } from '../src/booth/rival';
import { fakeRecord } from './helpers/records';

const house = fakeRecord('house', 1720);
const ok = () => true;

describe('rival selection', () => {
  it('empty board → House Ghost', () => {
    expect(pickRival([], { champion: false, version: 'v1', house, verify: ok }).kind).toBe('house');
  });
  it('relay → most recent Ghost', () => {
    const r = pickRival([fakeRecord('a', 1500), fakeRecord('b', 1900)], { champion: false, version: 'v1', house, verify: ok });
    expect(r).toMatchObject({ kind: 'relay', record: { id: 'b' } });
  });
  it('champion → fastest non-DNF Ghost', () => {
    const runs = [fakeRecord('a', 1500), fakeRecord('d', 1400, { dnf: true }), fakeRecord('b', 1900)];
    expect(pickRival(runs, { champion: true, version: 'v1', house, verify: ok })).toMatchObject({ kind: 'champion', record: { id: 'a' } });
  });
  it('ignores stale Course Versions and trimmed inputs', () => {
    const runs = [fakeRecord('a', 1500), fakeRecord('old', 1500, { courseVersion: 'v0' }), fakeRecord('t', 1500, { inputs: null })];
    expect(pickRival(runs, { champion: false, version: 'v1', house, verify: ok }).record.id).toBe('a');
  });
  it('falls back when a replay hash mismatches', () => {
    const runs = [fakeRecord('a', 1500), fakeRecord('bad', 1900)];
    expect(pickRival(runs, { champion: false, version: 'v1', house, verify: (r) => r.id !== 'bad' }).record.id).toBe('a');
    expect(pickRival(runs, { champion: false, version: 'v1', house, verify: () => false }).kind).toBe('house');
  });
  it('force House Ghost wins over everything', () => {
    expect(pickRival([fakeRecord('a', 1)], { champion: true, version: 'v1', house, verify: ok, forceHouse: true }).kind).toBe('house');
  });
});
