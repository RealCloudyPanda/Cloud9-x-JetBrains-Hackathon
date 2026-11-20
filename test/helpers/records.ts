import type { GhostRecord } from '../../src/booth/record';

export function fakeRecord(id: string, finishTick: number, extra: Partial<GhostRecord> = {}): GhostRecord {
  return {
    id,
    initials: 'AAA',
    courseVersion: 'v1',
    finishTick,
    dnf: false,
    splits: [1, 2, 3, 4, 5, finishTick],
    gateHashes: [0, 0, 0, 0, 0, 0],
    hits: [0, 0, 0, 0, 0, 0],
    perfects: [0, 0, 0, 0, 0, 0],
    hitKinds: [[], [], [], [], [], []],
    inputs: [[0, 1]],
    rivalId: null,
    beatRival: false,
    createdAt: 0,
    ...extra,
  };
}
