import type { Course } from './course';
import { FP, fnv1a } from './fixed';
import { TUNING } from './tuning';
import {
  BEAM_TRIGGER,
  BEAM_UNLOCKED,
  PERFECT_WINDOW,
  answerOf,
  lockBeam,
  obstacleWidth,
  solidBox,
} from './obstacles';
import { flowAfterClear, flowAfterHit, recoverFlow, speedFor } from './flow';
import { applyGravity, applyInput, boxH, boxW, createRunner, front, type RunnerEvent, type RunnerState } from './runner';

export const OBS_PENDING = 0;
export const OBS_CLEAR = 1;
export const OBS_PERFECT = 2;
export const OBS_HIT = 3;

export type SimEvent =
  | { type: 'jump' | 'slide' | 'land' | 'finish' }
  | { type: 'clear' | 'perfect' | 'hit' | 'beamLock'; obstacle: number }
  | { type: 'gate'; gate: number; tick: number };

export interface Sim {
  course: Course;
  tick: number;
  r: RunnerState;
  prevMask: number;
  flow: number;
  burst: number;
  nextObs: number;
  obsState: number[];
  beams: number[];
  gateIndex: number;
  splits: number[];
  gateHashes: number[];
  hits: number[];
  perfects: number[];
  hitKinds: string[][];
  finished: number;
  dnf: number;
  finishTick: number;
  /** Render-only output of the last step. Never read by the sim. */
  events: SimEvent[];
}

export function createSim(course: Course): Sim {
  const n = course.obstacles.length;
  const g = course.gates.length;
  return {
    course,
    tick: 0,
    r: createRunner(),
    prevMask: 0,
    flow: TUNING.flowStart,
    burst: 0,
    nextObs: 0,
    obsState: new Array<number>(n).fill(OBS_PENDING),
    beams: new Array<number>(n).fill(BEAM_UNLOCKED),
    gateIndex: 0,
    splits: new Array<number>(g).fill(-1),
    gateHashes: new Array<number>(g).fill(0),
    hits: new Array<number>(g).fill(0),
    perfects: new Array<number>(g).fill(0),
    hitKinds: Array.from({ length: g }, () => [] as string[]),
    finished: 0,
    dnf: 0,
    finishTick: -1,
    events: [],
  };
}

/** FNV-1a over every integer field that influences the future. */
export function hashState(sim: Sim): number {
  const r = sim.r;
  const head = [
    sim.tick, r.x, r.y, r.vy, r.grounded, r.coyote, r.buffer, r.hold, r.sliding, r.slideTicks,
    r.stumble, r.jumpFront, r.slideFront, sim.prevMask, sim.flow, sim.burst, sim.nextObs, sim.gateIndex,
  ];
  return fnv1a(sim.beams, fnv1a(sim.obsState, fnv1a(head)));
}

function segment(sim: Sim): number {
  return sim.gateIndex < sim.course.gates.length ? sim.gateIndex : sim.course.gates.length - 1;
}

/** True if any part of the runner box is over floor. */
function isSupported(sim: Sim): boolean {
  const r = sim.r;
  const x0 = r.x;
  const x1 = r.x + boxW(r);
  const obs = sim.course.obstacles;
  for (let i = sim.nextObs; i < obs.length; i++) {
    const o = obs[i];
    const ox = o.x * FP;
    if (ox > x1) break;
    if (o.kind !== 'pit') continue;
    const oe = (o.x + obstacleWidth(o)) * FP;
    if (x0 >= ox && x1 <= oe) return false;
  }
  return true;
}

function hit(sim: Sim, i: number): void {
  const o = sim.course.obstacles[i];
  const seg = segment(sim);
  sim.obsState[i] = OBS_HIT;
  sim.flow = flowAfterHit(sim.flow);
  sim.burst = 0;
  sim.r.stumble = o.kind === 'pit' ? TUNING.pitStumbleTicks : TUNING.stumbleTicks;
  sim.hits[seg]++;
  sim.hitKinds[seg].push(o.tag ?? o.kind);
  sim.events.push({ type: 'hit', obstacle: i });
}

function clear(sim: Sim, i: number): void {
  const o = sim.course.obstacles[i];
  const answer = answerOf(o, sim.beams[i]);
  const start = answer === 'slide' ? sim.r.slideFront : sim.r.jumpFront;
  const d = o.x * FP - start;
  const [lo, hi] = PERFECT_WINDOW[answer];
  const perfect = d >= lo * FP && d <= hi * FP;
  sim.obsState[i] = perfect ? OBS_PERFECT : OBS_CLEAR;
  sim.flow = flowAfterClear(sim.flow, perfect);
  if (perfect) {
    sim.burst = TUNING.burstTicks;
    sim.perfects[segment(sim)]++;
  }
  sim.events.push({ type: perfect ? 'perfect' : 'clear', obstacle: i });
}

function resolveObstacles(sim: Sim): void {
  const r = sim.r;
  const f = front(r);
  const hx0 = r.x + TUNING.hitInsetX * FP;
  const hx1 = r.x + boxW(r) - TUNING.hitInsetX * FP;
  const hy0 = r.y + TUNING.hitInsetFeet * FP;
  const hy1 = r.y + boxH(r) - TUNING.hitInsetHead * FP;
  const obs = sim.course.obstacles;

  for (let i = sim.nextObs; i < obs.length; i++) {
    const o = obs[i];
    const ox = o.x * FP;
    if (ox - BEAM_TRIGGER * FP > f) break;
    if (o.kind === 'beam' && sim.beams[i] === BEAM_UNLOCKED && f >= ox - BEAM_TRIGGER * FP) {
      sim.beams[i] = lockBeam(sim.tick);
      sim.events.push({ type: 'beamLock', obstacle: i });
    }
    if (sim.obsState[i] !== OBS_PENDING) continue;
    const oe = (o.x + obstacleWidth(o)) * FP;

    if (o.kind === 'pit') {
      // Fell in: the box is fully over the gap and has sunk below the lip.
      if (r.grounded === 0 && r.y < -20 * FP && r.x >= ox && r.x + boxW(r) <= oe) {
        hit(sim, i);
        r.x = oe;
        r.y = 0;
        r.vy = 0;
        r.grounded = 1;
        r.coyote = TUNING.coyoteTicks;
        r.sliding = 0;
      } else if (r.x >= oe) {
        clear(sim, i);
      }
      continue;
    }

    const box = solidBox(o, sim.beams[i]);
    if (box && hx1 > ox && hx0 < oe && hy1 > box[0] * FP && hy0 < box[1] * FP) {
      hit(sim, i);
    } else if (hx0 >= oe) {
      clear(sim, i);
    }
  }
  while (sim.nextObs < obs.length && sim.obsState[sim.nextObs] !== OBS_PENDING) sim.nextObs++;
}

const runnerEvents: RunnerEvent[] = [];

/** Advance the simulation by exactly one Tick with the given input mask. */
export function step(sim: Sim, mask: number): void {
  sim.events.length = 0;
  if (sim.finished) return;
  const r = sim.r;
  runnerEvents.length = 0;

  applyInput(r, mask, sim.prevMask, runnerEvents);

  r.x += speedFor(sim.flow, sim.burst, r.stumble > 0);
  if (sim.burst > 0) sim.burst--;
  if (r.stumble > 0) r.stumble--;
  sim.flow = recoverFlow(sim.flow);

  applyGravity(r, mask, isSupported(sim), runnerEvents);
  for (const e of runnerEvents) sim.events.push({ type: e });

  sim.prevMask = mask;
  sim.tick++;

  resolveObstacles(sim);

  const gates = sim.course.gates;
  while (sim.gateIndex < gates.length && front(r) >= gates[sim.gateIndex] * FP) {
    const g = sim.gateIndex;
    sim.splits[g] = sim.tick;
    sim.gateHashes[g] = hashState(sim);
    sim.gateIndex++;
    sim.events.push({ type: 'gate', gate: g, tick: sim.tick });
  }
  if (sim.gateIndex >= gates.length) {
    sim.finished = 1;
    sim.finishTick = sim.tick;
    sim.events.push({ type: 'finish' });
  } else if (sim.tick >= TUNING.timeCap) {
    sim.finished = 1;
    sim.dnf = 1;
    sim.finishTick = TUNING.timeCap;
    sim.events.push({ type: 'finish' });
  }
}
