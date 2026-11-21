import { COURSE, type Course } from '../sim/course';
import { FP } from '../sim/fixed';
import { createRecorder, record, type Recorder } from '../sim/inputLog';
import { createSim, step, type Sim } from '../sim/sim';

export class RunState {
  readonly sim: Sim;
  readonly rec: Recorder = createRecorder();
  prevX = 0;
  prevY = 0;
  hitAt: number[];

  constructor(readonly course: Course = COURSE) {
    this.sim = createSim(course);
    this.hitAt = new Array(course.obstacles.length).fill(-1e9);
  }

  tick(mask: number, now: number): void {
    this.prevX = this.sim.r.x;
    this.prevY = this.sim.r.y;
    record(this.rec, this.sim.tick, mask);
    step(this.sim, mask);
    if (this.sim.finished) {
      this.prevX = this.sim.r.x;
      this.prevY = this.sim.r.y;
    }
    for (const e of this.sim.events) if (e.type === 'hit') this.hitAt[e.obstacle] = now;
  }

  x(alpha: number): number {
    return (this.prevX + (this.sim.r.x - this.prevX) * alpha) / FP;
  }

  y(alpha: number): number {
    return (this.prevY + (this.sim.r.y - this.prevY) * alpha) / FP;
  }
}
