import type { GhostRecord } from './record';
import { topRuns } from './storage';

export type RivalKind = 'relay' | 'champion' | 'house';

export interface RivalChoice {
  record: GhostRecord;
  kind: RivalKind;
}

/**
 * Champion run → today's fastest; otherwise the most recent Ghost; otherwise the House Ghost.
 * Only Ghosts of the current Course Version with stored inputs that `verify` accepts are eligible.
 */
export function pickRival(
  runs: GhostRecord[],
  opts: { champion: boolean; version: string; house: GhostRecord; forceHouse?: boolean; verify: (r: GhostRecord) => boolean },
): RivalChoice {
  if (opts.forceHouse) return { record: opts.house, kind: 'house' };
  const eligible = runs.filter((r) => r.courseVersion === opts.version && r.inputs !== null);
  if (opts.champion) {
    for (const r of topRuns(eligible, eligible.length)) if (opts.verify(r)) return { record: r, kind: 'champion' };
  }
  for (let i = eligible.length - 1; i >= 0; i--) {
    if (opts.verify(eligible[i])) return { record: eligible[i], kind: 'relay' };
  }
  return { record: opts.house, kind: 'house' };
}
