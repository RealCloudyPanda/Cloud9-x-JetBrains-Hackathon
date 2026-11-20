import type { Course } from '../sim/course';
import { FP } from '../sim/fixed';
import { createCursor, maskAt, type Cursor, type InputLog } from '../sim/inputLog';
import { createSim, step, type Sim } from '../sim/sim';
import type { GhostRecord } from '../booth/record';

function validLog(inputs: InputLog | null, finishTick: number): inputs is InputLog {
  if (!Array.isArray(inputs) || !Number.isInteger(finishTick) || finishTick < 1) return false;
  let prevTick = -1;
  for (const event of inputs) {
    if (!Array.isArray(event) || event.length !== 2) return false;
    const [tick, mask] = event;
    if (!Number.isInteger(tick) || tick <= prevTick || tick >= finishTick ||
        !Number.isInteger(mask) || mask < 0 || mask > 3) return false;
    prevTick = tick;
  }
  return true;
}

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
    const inputs = validLog(record.inputs, record.finishTick) ? record.inputs : null;
    this.cursor = createCursor(inputs ?? []);
    this.rejected = inputs === null ||
      !Array.isArray(record.splits) || record.splits.length !== course.gates.length ||
      !Array.isArray(record.gateHashes) || record.gateHashes.length !== course.gates.length;
  }

  tick(): void {
    if (this.sim.finished || this.rejected) return;
    this.prevX = this.sim.r.x;
    this.prevY = this.sim.r.y;
    step(this.sim, maskAt(this.cursor, this.sim.tick));
    for (const e of this.sim.events) {
      if (e.type === 'gate' && (e.tick !== this.record.splits[e.gate] ||
          this.sim.gateHashes[e.gate] !== this.record.gateHashes[e.gate])) this.rejected = true;
    }
    if (this.sim.finished && (this.sim.finishTick !== this.record.finishTick ||
        Boolean(this.sim.dnf) !== this.record.dnf ||
        this.sim.splits.some((tick, i) => tick !== this.record.splits[i]) ||
        this.sim.gateHashes.some((hash, i) => hash !== this.record.gateHashes[i]))) this.rejected = true;
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

/** Replay a whole record headlessly and check its gate data and finish. */
export function verifyGhost(course: Course, record: GhostRecord): boolean {
  const g = new GhostRunner(course, record);
  while (!g.sim.finished && !g.rejected) g.tick();
  return !g.rejected;
}
