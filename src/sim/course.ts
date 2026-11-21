export type ObstacleKind = 'hurdle' | 'lowbar' | 'pit' | 'beam';

export interface Obstacle {
  kind: ObstacleKind;
  x: number;
  tag?: 'double';
  beamAnswer?: 'jump' | 'slide';
}

export interface Course {
  length: number;
  gates: number[];
  gateLabels: string[];
  segmentNames: string[];
  obstacles: Obstacle[];
}

const h = (x: number): Obstacle => ({ kind: 'hurdle', x });
const dbl = (x: number): Obstacle[] => [
  { kind: 'hurdle', x, tag: 'double' },
  { kind: 'hurdle', x: x + 170, tag: 'double' },
];
const bar = (x: number): Obstacle => ({ kind: 'lowbar', x });
const pit = (x: number): Obstacle => ({ kind: 'pit', x });
const beam = (x: number, beamAnswer: 'jump' | 'slide'): Obstacle => ({ kind: 'beam', x, beamAnswer });

export const COURSE: Course = {
  length: 10800,
  gates: [1800, 3600, 5400, 7200, 9000, 10800],
  gateLabels: ['G1', 'G2', 'G3', 'G4', 'G5', 'FIN'],
  segmentNames: ['WARM-UP', 'RHYTHM', 'SWITCH', 'PITS', 'MIXED', 'SPRINT'],
  obstacles: [
    h(620), bar(1040), h(1420), h(1660),
    ...dbl(2020), ...dbl(2560), ...dbl(3100),
    beam(3920, 'jump'), h(4260), beam(4620, 'slide'), h(4960), beam(5260, 'jump'),
    pit(5640), h(5990), pit(6260), bar(6560), pit(6960),
    h(7400), beam(7700, 'slide'), pit(8010), bar(8330), ...dbl(8620),
    beam(9240, 'jump'), beam(9580, 'slide'), ...dbl(9900),
  ],
};

export const FLAT_COURSE: Course = {
  length: 3000,
  gates: [500, 1000, 1500, 2000, 2500, 3000],
  gateLabels: ['G1', 'G2', 'G3', 'G4', 'G5', 'FIN'],
  segmentNames: ['A', 'B', 'C', 'D', 'E', 'F'],
  obstacles: [h(700), h(1300), h(2100)],
};
