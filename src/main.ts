import { setupCanvas, W, H } from './game/canvas';
import { Input } from './game/input';
import { startLoop } from './game/loop';
import { RunState } from './game/run';
import { GhostRunner } from './game/ghost';
import { drawWorld, CAMERA_X } from './game/render/world';
import { drawRunner } from './game/render/runner';
import { GhostDrawer } from './game/render/ghost';
import { drawHud, type Chip } from './game/render/hud';
import { C } from './game/render/theme';
import { recordFromSim, type GhostRecord } from './booth/record';
import { gateDelta } from './sim/splits';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = setupCanvas(canvas);
const input = new Input(canvas);
const ghostDrawer = new GhostDrawer();
let run = new RunState();
let ghost: GhostRunner | null = null;
let last: GhostRecord | null = null;
let chips: Chip[] = [];
let lastGate = -1;

function restart(): void {
  run = new RunState();
  ghost = last ? new GhostRunner(run.course, last) : null;
  ghostDrawer.reset();
  chips = [];
  lastGate = -1;
}

startLoop({
  tick() {
    if (run.sim.finished) {
      if (input.presses().length) restart();
      return;
    }
    const now = performance.now();
    run.tick(input.mask, now);
    ghost?.tick();
    for (const e of run.sim.events) {
      if (e.type === 'gate' && ghost) {
        const d = gateDelta(run.sim.splits, ghost.record.splits, e.gate);
        if (d !== null) chips.push({ gate: e.gate, delta: d, worldX: run.course.gates[e.gate], at: now });
        lastGate = e.gate;
      }
    }
    if (run.sim.finished) {
      last = recordFromSim(run.sim, run.rec.log, { id: 'local', initials: 'YOU', courseVersion: '', rivalId: null, beatRival: false, createdAt: Date.now() });
    }
  },
  frame(alpha) {
    const now = performance.now();
    const x = run.x(alpha);
    const camX = x - CAMERA_X;
    ctx.fillStyle = C.ink;
    ctx.fillRect(0, 0, W, H);
    drawWorld(ctx, { course: run.course, camX, tick: run.sim.tick, obsState: run.sim.obsState, beams: run.sim.beams, hitAt: run.hitAt, now });
    if (ghost && !ghost.rejected) {
      const gx = ghost.x(alpha);
      ghostDrawer.draw(ctx, { sx: gx - camX, y: ghost.y(alpha), sliding: ghost.sim.r.sliding === 1, airborne: ghost.sim.r.grounded === 0, scaleY: 1, phase: now / 1000 + 0.3 }, gx, camX, ghost.record.initials);
    }
    drawRunner(ctx, { sx: CAMERA_X, y: run.y(alpha), sliding: run.sim.r.sliding === 1, airborne: run.sim.r.grounded === 0, scaleY: 1, phase: now / 1000 }, C.lime, C.ink);
    const ld = lastGate >= 0 && ghost ? gateDelta(run.sim.splits, ghost.record.splits, lastGate) : null;
    drawHud(ctx, { tick: run.sim.tick, rivalInitials: ghost?.record.initials ?? '—', lastDelta: ld, lastGate, flow: run.sim.flow, chips, camX, now, gateCount: run.course.gates.length });
  },
});
