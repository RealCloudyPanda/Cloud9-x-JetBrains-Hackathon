import { createSim, step, type Sim } from '../../src/sim/sim';
import { createRecorder, record, type InputLog } from '../../src/sim/inputLog';
import type { Course } from '../../src/sim/course';

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function botRun(course: Course, seed: number): { sim: Sim; log: InputLog } {
  const rand = mulberry32(seed);
  const sim = createSim(course);
  const rec = createRecorder();
  let mask = 0;
  let hold = 0;
  while (!sim.finished) {
    if (hold <= 0) {
      const p = rand();
      mask = p < 0.55 ? 0 : p < 0.85 ? 1 : p < 0.97 ? 2 : 3;
      hold = 1 + Math.floor(rand() * 24);
    }
    hold--;
    record(rec, sim.tick, mask);
    step(sim, mask);
  }
  return { sim, log: rec.log };
}
