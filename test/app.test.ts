import { afterEach, expect, it, vi } from 'vitest';
import { loadLiveRun } from '../src/booth/broadcast';
import { MemoryKV } from '../src/booth/memoryKv';
import { appendRun, dateKey, loadRuns } from '../src/booth/storage';
import type { GhostRecord } from '../src/booth/record';
import { fakeRecord } from './helpers/records';
import { TIMERS } from '../src/booth/timers';
import { App } from '../src/game/app';
import { verifyGhost } from '../src/game/ghost';
import { Input } from '../src/game/input';
import { TICK_MS } from '../src/game/loop';
import { createAutopilot } from '../src/sim/autopilot';
import { COURSE } from '../src/sim/course';
import { MASK_JUMP, MASK_SLIDE, TUNING } from '../src/sim/tuning';

function booth(seed: GhostRecord[] = []) {
  const window = new EventTarget();
  const canvas = new EventTarget() as HTMLElement;
  vi.stubGlobal('window', window);
  const store = new MemoryKV();
  for (const record of seed) appendRun(store, dateKey(new Date()), record);
  const input = new Input(canvas);
  let now = 0;
  const app = new App({} as CanvasRenderingContext2D, input, store, () => now, false);
  function key(code: string, down: boolean, ctrlKey = false, shiftKey = false) {
    window.dispatchEvent(Object.assign(new Event(down ? 'keydown' : 'keyup'), { code, ctrlKey, shiftKey }));
  }
  function mouse(button: number, down: boolean) {
    (down ? canvas : window).dispatchEvent(Object.assign(new Event(down ? 'mousedown' : 'mouseup'), { button }));
  }
  function tap(code: string) {
    key(code, true);
    key(code, false);
  }
  function tick(ms = TICK_MS) {
    now += ms;
    app.tick();
  }
  function play(control: (bit: number, down: boolean) => void, onFirstGate?: () => void) {
    const pilot = createAutopilot({ jumpAt: 40, slideAt: 34, pitAt: 20, mistakes: [] });
    for (let i = 0; i < TUNING.timeCap && app.booth.state === 'run'; i++) {
      const mask = pilot(app.run!.sim);
      for (const bit of [MASK_JUMP, MASK_SLIDE]) {
        if ((input.mask ^ mask) & bit) control(bit, !!(mask & bit));
      }
      const beforeGate = app.lastGate < 0;
      tick();
      if (beforeGate && app.lastGate === 0) onFirstGate?.();
    }
  }
  return { app, store, input, key, mouse, tap, tick, play };
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it('completes a two-key turn and passes the recorded ghost to the next player', () => {
  const { app, store, input, key, tap, tick, play } = booth();
  key('ArrowDown', true);
  tick();
  expect(app.booth.state).toBe('attract');
  key('ArrowDown', false);
  tick();
  expect(app.booth.state).toBe('countdown');

  key('ArrowUp', true);
  tick(TIMERS.countdown);
  expect(app.booth.state).toBe('run');
  expect(input.mask).toBe(0);
  key('ArrowUp', false);
  const day = app.meta.currentDay;
  expect(loadLiveRun(store, day)?.deltas).toEqual(COURSE.gates.map(() => null));

  play((bit, down) => key(bit === MASK_JUMP ? 'ArrowUp' : 'ArrowDown', down), () => {
    expect(loadLiveRun(store, day)?.deltas[0]).toEqual(expect.any(Number));
  });
  expect(app.lastGate).toBe(COURSE.gates.length - 1);
  expect(app.booth.state).toBe('results');
  expect(loadLiveRun(store, day)).toBeNull();
  const [record] = loadRuns(store, day);
  expect(record.dnf).toBe(false);
  expect(verifyGhost(COURSE, record)).toBe(true);

  tap('ArrowUp');
  tick();
  expect(app.booth.state).toBe('results');
  tap('ArrowUp');
  tick(TIMERS.resultsGuard);
  expect(app.booth.state).toBe('initials');
  tap('ArrowDown');
  tick();
  for (let slot = 0; slot < 3; slot++) {
    key('ArrowDown', true);
    tick();
    tap('ArrowUp');
    key('ArrowDown', false);
    tick();
  }
  expect(app.booth.state).toBe('submitted');
  expect(loadRuns(store, day)[0].initials).toBe('BAA');
  tick(TIMERS.submitted);
  expect(app.booth.state).toBe('attract');
  expect(app.run).toBeNull();
  expect(app.result).toBeNull();
  expect(app.rival.record.initials).toBe('BAA');

  key('ArrowDown', true);
  tick();
  tap('ArrowUp');
  tick();
  expect(app.rival.kind).toBe('champion');
  tick(TIMERS.countdown);
  expect(loadLiveRun(store, day)?.rival).toBe('BAA');
  app.booth.hidden();
  expect(app.booth.state).toBe('attract');
  expect(loadLiveRun(store, day)).toBeNull();
  expect(loadRuns(store, day)).toHaveLength(1);
});

it('opens the operator shortcut across ticks and resets to a fresh board', () => {
  const { app, store, key, tap, tick } = booth();
  key('ControlLeft', true, true);
  tick();
  key('ShiftLeft', true, true, true);
  tick();
  expect(app.booth.state).toBe('attract');
  key('KeyO', true, true, true);
  tick();
  expect(app.booth.state).toBe('operator');
  const day = app.meta.currentDay;
  tap('Enter');
  tick();
  expect(app.meta.currentDay).toBe(day);
  tap('Enter');
  tick();
  expect(app.meta.currentDay).toBe(day + '~2');
  expect(loadLiveRun(store, app.meta.currentDay)).toBeNull();
  tap('Escape');
  tick();
  expect(app.booth.state).toBe('attract');
});

it('plays one beep per countdown step across uneven ticks', () => {
  const { app, tap, tick } = booth();
  const play = vi.spyOn(app.synth, 'play');
  tap('ArrowUp');
  tick();
  tick(1025);
  tick(1);
  tick(1000);
  tick(1);
  tick(1000);
  expect(play.mock.calls).toEqual([['beep'], ['beep'], ['beep'], ['go']]);
  expect(app.booth.state).toBe('run');
});

it('completes a mouse-only turn and starts the next run on the new calendar day', () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 10, 20, 23, 59));
  const { app, store, mouse, tick, play } = booth();
  mouse(0, true);
  tick();
  mouse(0, false);
  tick(TIMERS.countdown);
  play((bit, down) => mouse(bit === MASK_JUMP ? 0 : 2, down));
  expect(app.booth.state).toBe('results');
  mouse(0, true);
  mouse(0, false);
  tick(TIMERS.resultsGuard);
  expect(app.booth.state).toBe('initials');
  for (const button of [2, 0, 0, 0]) {
    mouse(button, true);
    mouse(button, false);
    tick();
  }
  expect(app.booth.state).toBe('submitted');
  expect(loadRuns(store, '2026-11-20')[0].initials).toBe('BAA');

  vi.setSystemTime(new Date(2026, 10, 21, 0, 1));
  tick(TIMERS.submitted);
  expect(app.booth.state).toBe('attract');
  expect(app.meta.currentDay).toBe('2026-11-21');
  expect(app.rival.kind).toBe('house');
  mouse(0, true);
  tick();
  tick(TIMERS.countdown);
  expect(loadLiveRun(store, '2026-11-21')?.rival).toBe(app.rival.record.initials);
  expect(loadLiveRun(store, '2026-11-20')).toBeNull();
});

it('Tab and Escape preserve attract so booth tools can receive focus', () => {
  const { app, tap, tick } = booth();
  tap('Tab'); tick();
  tap('Escape'); tick();
  expect(app.booth.state).toBe('attract');
});

it('a retired course record cannot suppress a current-course personal best', () => {
  const { app, tap, tick, play } = booth([fakeRecord('retired', 1, { courseVersion: 'old-physics' })]);
  tap('Enter'); tick(); tick(TIMERS.countdown);
  play(() => {});
  expect(app.booth.state).toBe('results');
  expect(app.result?.newBest).toBe(true);
});

it('operator arrow presses move once and Tab remains native browser navigation', () => {
  const { app, tap, tick } = booth();
  app.booth.openOperator();
  tap('ArrowDown'); tick();
  expect(app.operator.focus).toBe(1);
  tap('Enter'); tick();
  expect(app.meta.settings.sound).toBe(false);
  tap('Tab'); tick();
  expect(app.operator.focus).toBe(1);
  tap('ArrowUp'); tick();
  expect(app.operator.focus).toBe(0);
  tap('Enter'); tick();
  expect(app.operator.confirm).toBe(true);
});
