import type { Course } from '../sim/course';
import { FP } from '../sim/fixed';
import { createCursor, maskAt, type Cursor } from '../sim/inputLog';
import { createSim, step, type Sim } from '../sim/sim';
import type { GhostRecord } from '../booth/record';

/**
 * A Ghost is a second sim stepped on the same Tick from a recorded Input Log.
 * If any gate hash differs from the one stored, the replay has drifted and is rejected.
 */
export class GhostRunner {
  readonly sim: Sim;
  private cursor: Cursor;
  rejected = false;
  prevX = 0;
  prevY = 0;

  constructor(course: Course, readonly record: GhostRecord) {
    this.sim = createSim(course);
    this.cursor = createCursor(record.inputs ?? []);
    if (!record.inputs) this.rejected = true;
  }

  tick(): void {
    if (this.sim.finished || this.rejected) return;
    this.prevX = this.sim.r.x;
    this.prevY = this.sim.r.y;
    step(this.sim, maskAt(this.cursor, this.sim.tick));
    for (const e of this.sim.events) {
      if (e.type === 'gate' && this.sim.gateHashes[e.gate] !== this.record.gateHashes[e.gate]) this.rejected = true;
    }
    if (this.sim.finished && this.sim.finishTick !== this.record.finishTick) this.rejected = true;
  }

  x(alpha: number): number {
    if (this.sim.finished) return this.sim.r.x / FP;
    return (this.prevX + (this.sim.r.x - this.prevX) * alpha) / FP;
  }

  y(alpha: number): number {
    if (this.sim.finished) return this.sim.r.y / FP;
    return (this.prevY + (this.sim.r.y - this.prevY) * alpha) / FP;
  }
}

/** Replay a whole record headlessly; true if every gate hash and the finish Tick match. */
export function verifyGhost(course: Course, record: GhostRecord): boolean {
  const g = new GhostRunner(course, record);
  while (!g.sim.finished && !g.rejected) g.tick();
  return !g.rejected;
}
