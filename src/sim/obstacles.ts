import type { Obstacle, ObstacleKind } from './course';

export const OBSTACLE_SIZE: Record<ObstacleKind, { w: number }> = {
  hurdle: { w: 24 },
  lowbar: { w: 120 },
  pit: { w: 110 },
  beam: { w: 24 },
};

export const HURDLE_H = 40;
export const BAR_UNDERSIDE = 30;
export const BAR_TOP = 1000;
export const BEAM_TRIGGER = 160;

export const BEAM_UNLOCKED = -1;
export const BEAM_LOW = 0;
export const BEAM_HIGH = 1;

export const PERFECT_WINDOW: Record<'jump' | 'slide' | 'pit', [number, number]> = {
  jump: [18, 54],
  slide: [12, 48],
  pit: [0, 36],
};

export function obstacleWidth(o: Obstacle): number {
  return OBSTACLE_SIZE[o.kind].w;
}

export function solidBox(o: Obstacle, beamState: number): [number, number] | null {
  switch (o.kind) {
    case 'hurdle':
      return [0, HURDLE_H];
    case 'lowbar':
      return [BAR_UNDERSIDE, BAR_TOP];
    case 'beam':
      if (beamState === BEAM_LOW) return [0, HURDLE_H];
      if (beamState === BEAM_HIGH) return [BAR_UNDERSIDE, BAR_TOP];
      return null;
    case 'pit':
      return null;
  }
}

export function answerOf(o: Obstacle, beamState: number): 'jump' | 'slide' | 'pit' {
  if (o.kind === 'pit') return 'pit';
  if (o.kind === 'lowbar') return 'slide';
  if (o.kind === 'beam') return beamState === BEAM_HIGH ? 'slide' : 'jump';
  return 'jump';
}

export function lockBeam(obstacle: Obstacle): number {
  return obstacle.beamAnswer === 'slide' ? BEAM_HIGH : BEAM_LOW;
}

export function obstacleName(kind: string): string {
  switch (kind) {
    case 'hurdle':
      return 'Hurdle';
    case 'double':
      return 'Double Hurdle';
    case 'lowbar':
      return 'Low Bar';
    case 'pit':
      return 'Pit';
    case 'beam':
      return 'Switch Beam';
    default:
      return kind;
  }
}
