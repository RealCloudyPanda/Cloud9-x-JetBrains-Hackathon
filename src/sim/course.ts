/** Course data (SPEC §4). Whole logical pixels; the sim converts to fixed-point. */
export type ObstacleKind = 'hurdle' | 'lowbar' | 'pit' | 'beam';

export interface Obstacle {
  kind: ObstacleKind;
  /** Leading edge, px from the start line. */
  x: number;
  /** Set on both halves of a Double Hurdle. */
  tag?: 'double';
}

export interface Course {
  length: number;
  /** Split Gate positions; the last one is the Finish. */
  gates: number[];
  gateLabels: string[];
  segmentNames: string[];
  obstacles: Obstacle[];
}

const h = (x: number): Obstacle => ({ kind: 'hurdle', x });
const dbl = (x: number): Obstacle[] => [
  { kind: 'hurdle', x, tag: 'double' },
  { kind: 'hurdle', x: x + 150, tag: 'double' },
];
const bar = (x: number): Obstacle => ({ kind: 'lowbar', x });
const pit = (x: number): Obstacle => ({ kind: 'pit', x });
const beam = (x: number): Obstacle => ({ kind: 'beam', x });

export const COURSE: Course = {
  length: 10800,
  gates: [1800, 3600, 5400, 7200, 9000, 10800],
  gateLabels: ['G1', 'G2', 'G3', 'G4', 'G5', 'FIN'],
  segmentNames: ['WARM-UP', 'RHYTHM', 'SWITCH', 'PITS', 'MIXED', 'SPRINT'],
  obstacles: [
    // S1 WARM-UP: learn both buttons
    h(620), bar(1040), h(1420), h(1660),
    // S2 RHYTHM: even Double Hurdles, a Perfect chain is possible
    ...dbl(2020), ...dbl(2560), ...dbl(3100),
    // S3 SWITCH: read the beam, react
    beam(3920), h(4260), beam(4620), h(4960), beam(5260),
    // S4 PITS: held jumps, a Low Bar right after a landing
    pit(5640), h(5990), pit(6260), bar(6560), pit(6960),
    // S5 MIXED: everything, tighter
    h(7400), beam(7700), pit(8010), bar(8330), ...dbl(8620),
    // S6 SPRINT: two beams, a Double, then a clear run where Flow pays off
    beam(9240), beam(9580), ...dbl(9900),
  ],
};

/** A flat Course with a few Hurdles, used by early physics tests. */
export const FLAT_COURSE: Course = {
  length: 3000,
  gates: [500, 1000, 1500, 2000, 2500, 3000],
  gateLabels: ['G1', 'G2', 'G3', 'G4', 'G5', 'FIN'],
  segmentNames: ['A', 'B', 'C', 'D', 'E', 'F'],
  obstacles: [h(700), h(1300), h(2100)],
};
