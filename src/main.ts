import { setupCanvas, W, H } from './game/canvas';
import { Input } from './game/input';
import { startLoop } from './game/loop';
import { RunState } from './game/run';
import { drawWorld, CAMERA_X } from './game/render/world';
import { drawRunner } from './game/render/runner';
import { C } from './game/render/theme';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = setupCanvas(canvas);
const input = new Input(canvas);
let run = new RunState();

startLoop({
  tick() {
    if (run.sim.finished) {
      if (input.presses().length) run = new RunState();
      return;
    }
    run.tick(input.mask, performance.now());
  },
  frame(alpha) {
    const x = run.x(alpha);
    const camX = x - CAMERA_X;
    ctx.fillStyle = C.ink;
    ctx.fillRect(0, 0, W, H);
    drawWorld(ctx, {
      course: run.course,
      camX,
      tick: run.sim.tick,
      obsState: run.sim.obsState,
      beams: run.sim.beams,
      hitAt: run.hitAt,
      now: performance.now(),
    });
    drawRunner(ctx, { sx: CAMERA_X, y: run.y(alpha), sliding: run.sim.r.sliding === 1, airborne: run.sim.r.grounded === 0, scaleY: 1, phase: performance.now() / 1000 }, C.lime, C.ink);
    ctx.fillStyle = C.text;
    ctx.font = '24px monospace';
    ctx.fillText((run.sim.tick / 60).toFixed(2), 40, 50);
  },
});
