import { expect, it } from 'vitest';
import { resultsView, segmentTicks } from '../src/game/runResult';
import { fakeRecord } from './helpers/records';

it('turns cumulative splits into per-segment ticks and skips missed gates', () => {
  expect(segmentTicks([60, 150, -1])).toEqual([60, 90, 0]);
});

it('builds the results view against a rival and hides the overall delta when the rival did not finish', () => {
  const record = fakeRecord('me', 1700, { splits: [100, 200], hits: [1, 2], perfects: [3, 0] });
  const rival = fakeRecord('them', 1750, { splits: [110, 190] });
  const view = resultsView({ record, rival, verdict: [], newBest: true }, ['G1', 'G2'], 500, true);
  expect(view.overall).toBe(-50);
  expect(view.hits).toBe(3);
  expect(view.perfects).toBe(3);
  expect(view.segTicks).toEqual([100, 100]);
  const dnfRival = resultsView({ record, rival: { ...rival, dnf: true }, verdict: [], newBest: false }, ['G1', 'G2'], 0, false);
  expect(dnfRival.overall).toBeNull();
});
