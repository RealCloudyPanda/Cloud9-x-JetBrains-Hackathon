import type { App } from './app';
import { createAutopilot } from '../sim/autopilot';
import { COURSE } from '../sim/course';

/**
 * `?scene=attract|run|results|initials` freezes a deterministic frame (for screenshots and judges).
 * The player is a scripted autopilot racing the House Ghost; storage is in-memory only.
 */
export function applyScene(app: App, scene: string): void {
  const beams = (xs: number[]) => COURSE.obstacles.flatMap((o, i) => (o.kind === 'beam' && xs.includes(o.x) ? [i] : []));
  const pilot = createAutopilot({ jumpAt: 40, slideAt: 34, pitAt: 20, mistakes: beams([3920, 5260]) });
  const t0 = performance.now();
  if (scene === 'attract') {
    for (let i = 0; i < 400; i++) app.attract.tick();
    app.frozenNow = t0;
    return;
  }
  app.booth.press();
  app.booth.state = 'run';
  app.maskOverride = pilot;
  const stopAt = scene === 'run' ? 1130 : Infinity;
  let fakeNow = t0 - 60000;
  while (app.run && !app.run.sim.finished && app.run.sim.tick < stopAt) {
    fakeNow += 1000 / 60;
    app.tickRun(fakeNow);
  }
  app.maskOverride = null;
  if (scene === 'run') {
    // keep the chips fresh for the frame
    app.chips.forEach((c, i) => (c.at = t0 - 300 - i * 50));
    app.frozenNow = t0;
    return;
  }
  app.finishAt = t0 - 2500;
  if (scene === 'initials') {
    app.booth.state = 'initials';
    app.letters = ['J', 'B', 'A'];
    app.slot = 2;
  }
  app.booth.enteredAt = t0 - 2500;
  app.booth.lastInputAt = t0 - 3000;
  app.frozenNow = t0;
}
