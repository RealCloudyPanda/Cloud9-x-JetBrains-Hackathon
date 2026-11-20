import type { Course } from './course';
import { createCursor, maskAt, type InputLog } from './inputLog';
import { createSim, step, type Sim } from './sim';

/** Re-simulate a whole Input Log. */
export function replay(course: Course, log: InputLog): Sim {
  const sim = createSim(course);
  const c = createCursor(log);
  while (!sim.finished) step(sim, maskAt(c, sim.tick));
  return sim;
}
