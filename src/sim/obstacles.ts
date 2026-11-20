import type { Obstacle, ObstacleKind } from './course';

/** Obstacle geometry in px (SPEC §4.2). y is measured up from the ground. */
export const OBSTACLE_SIZE: Record<ObstacleKind, { w: number }> = {
  hurdle: { w: 24 },
  lowbar: { w: 120 },
  pit: { w: 110 },
  beam: { w: 24 },
};

export const HURDLE_H = 40;
export const BAR_UNDERSIDE = 30;
/** Bars and HIGH beams hang from the rafters: effectively unjumpable. */
export const BAR_TOP = 1000;
export const BEAM_TRIGGER = 160;

export const BEAM_UNLOCKED = -1;
export const BEAM_LOW = 0;
export const BEAM_HIGH = 1;

/** Perfect windows: runner front to obstacle leading edge when the answering action starts. */
export const PERFECT_WINDOW: Record<'jump' | 'slide' | 'pit', [number, number]> = {
  jump: [18, 54],
  slide: [12, 48],
  pit: [0, 36],
};

export function obstacleWidth(o: Obstacle): number {
  return OBSTACLE_SIZE[o.kind].w;
}

/**
 * Solid box for a non-pit obstacle, or null if it has none.
 * beamState is only consulted for Switch Beams.
 */
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

/** Which action answers this obstacle (for the Perfect window). */
export function answerOf(o: Obstacle, beamState: number): 'jump' | 'slide' | 'pit' {
  if (o.kind === 'pit') return 'pit';
  if (o.kind === 'lowbar') return 'slide';
  if (o.kind === 'beam') return beamState === BEAM_HIGH ? 'slide' : 'jump';
  return 'jump';
}

/** Lock rule: LOW if the trigger Tick is even, else HIGH (SPEC §4.2). */
export function lockBeam(triggerTick: number): number {
  return (triggerTick & 1) === 0 ? BEAM_LOW : BEAM_HIGH;
}

/** Display name used in the Verdict. */
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
