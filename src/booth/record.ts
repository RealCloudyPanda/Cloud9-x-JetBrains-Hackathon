import type { InputLog } from '../sim/inputLog';
import type { Sim } from '../sim/sim';

export type GhostRecord = {
  id: string;
  initials: string;
  courseVersion: string;
  finishTick: number;
  dnf: boolean;
  splits: number[];
  gateHashes: number[];
  hits: number[];
  perfects: number[];
  hitKinds: string[][];
  inputs: InputLog | null;
  rivalId: string | null;
  beatRival: boolean;
  createdAt: number;
};

export function recordFromSim(
  sim: Sim,
  inputs: InputLog,
  meta: { id: string; initials: string; courseVersion: string; rivalId: string | null; beatRival: boolean; createdAt: number },
): GhostRecord {
  return {
    ...meta,
    finishTick: sim.finishTick,
    dnf: sim.dnf === 1,
    splits: [...sim.splits],
    gateHashes: [...sim.gateHashes],
    hits: [...sim.hits],
    perfects: [...sim.perfects],
    hitKinds: sim.hitKinds.map((k) => [...k]),
    inputs: inputs.map(([t, m]) => [t, m] as [number, number]),
  };
}
