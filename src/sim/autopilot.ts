import { FP } from './fixed';
import { BEAM_HIGH, BEAM_UNLOCKED, answerOf, obstacleWidth } from './obstacles';
import { front } from './runner';
import { OBS_PENDING, type Sim } from './sim';
import { MASK_JUMP, MASK_SLIDE } from './tuning';

export interface AutopilotOptions {
  jumpAt: number;
  slideAt: number;
  pitAt: number;
  mistakes: number[];
}

export const EXPERT: AutopilotOptions = { jumpAt: 36, slideAt: 30, pitAt: 18, mistakes: [] };

export function createAutopilot(opts: AutopilotOptions): (sim: Sim) => number {
  let holdJump = 0;
  let sliding = -1;
  return (sim: Sim) => {
    const r = sim.r;
    const f = front(r);
    const obs = sim.course.obstacles;
    let mask = 0;

    if (holdJump > 0) {
      holdJump--;
      mask |= MASK_JUMP;
    }
    if (sliding >= 0) {
      const o = obs[sliding];
      if (r.x < (o.x + obstacleWidth(o) + 4) * FP) mask |= MASK_SLIDE;
      else sliding = -1;
    }
    if (mask !== 0) return mask;

    for (let i = sim.nextObs; i < obs.length; i++) {
      if (sim.obsState[i] !== OBS_PENDING) continue;
      const o = obs[i];
      const d = o.x * FP - f;
      if (d < -obstacleWidth(o) * FP) continue;
      if (o.kind === 'beam' && sim.beams[i] === BEAM_UNLOCKED) break;
      let answer = answerOf(o, sim.beams[i]);
      if (opts.mistakes.includes(i) && o.kind === 'beam') answer = sim.beams[i] === BEAM_HIGH ? 'jump' : 'slide';
      const at = (answer === 'slide' ? opts.slideAt : answer === 'pit' ? opts.pitAt : opts.jumpAt) * FP;
      if (d > at) break;
      if (answer === 'slide') {
        sliding = i;
        return MASK_SLIDE;
      }
      if (r.grounded === 1 && r.stumble === 0) {
        holdJump = answer === 'pit' ? 14 : o.tag === 'double' ? 1 : 4;
        return MASK_JUMP;
      }
      break;
    }
    return 0;
  };
}
