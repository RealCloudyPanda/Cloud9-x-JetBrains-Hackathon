import { segmentDeltas } from '../sim/splits';
import type { GhostRecord } from '../booth/record';
import type { VerdictPart } from '../booth/verdict';
import type { ResultsView } from './screens/results';

export interface RunResult {
  record: GhostRecord;
  rival: GhostRecord;
  verdict: VerdictPart[];
  newBest: boolean;
}

const sum = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0);

export function segmentTicks(splits: readonly number[]): number[] {
  return splits.map((s, i) => (s < 0 ? 0 : s - (i === 0 ? 0 : splits[i - 1])));
}

export function resultsView(result: RunResult, labels: readonly string[], ageMs: number, canSkip: boolean): ResultsView {
  const { record, rival } = result;
  return {
    ageMs,
    finishTick: record.finishTick,
    dnf: record.dnf,
    rivalInitials: rival.initials,
    overall: rival.dnf ? null : record.finishTick - rival.finishTick,
    segDeltas: segmentDeltas(record.splits, rival.splits),
    segTicks: segmentTicks(record.splits),
    labels: [...labels],
    verdict: result.verdict,
    hits: sum(record.hits),
    perfects: sum(record.perfects),
    newBest: result.newBest,
    canSkip,
  };
}
