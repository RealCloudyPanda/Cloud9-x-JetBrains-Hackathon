import { COURSE } from '../sim/course';
import { courseVersion } from '../sim/courseVersion';
import { gateDelta, segmentDeltas } from '../sim/splits';
import { FP } from '../sim/fixed';
import { MASK_SLIDE } from '../sim/tuning';
import { Booth, type BoothState } from '../booth/stateMachine';
import { TIMERS } from '../booth/timers';
import { appendRun, dateKey, loadMeta, loadRuns, saveMeta, startNewDay, topRuns, updateRun, type KV, type Meta } from '../booth/storage';
import { pickRival, type RivalChoice } from '../booth/rival';
import { recordFromSim, type GhostRecord } from '../booth/record';
import { nextStreak } from '../booth/streak';
import { verdict, type VerdictPart } from '../booth/verdict';
import { cleanInitials, cycleLetter } from '../booth/initials';
import { openChannel, saveLiveRun, type LiveRun } from '../booth/broadcast';
import houseJson from './houseGhost.json';
import { RunState } from './run';
import { GhostRunner, verifyGhost } from './ghost';
import type { Input, Press } from './input';
import { W, H, GROUND_Y } from './canvas';
import { drawBackground } from './render/background';
import { drawWorld, CAMERA_X } from './render/world';
import { drawRunner } from './render/runner';
import { GhostDrawer } from './render/ghost';
import { drawHud, type Chip } from './render/hud';
import { Fx } from './render/fx';
import { C } from './render/theme';
import { drawAttract } from './screens/attract';
import { drawCountdown } from './screens/countdown';
import { drawResults } from './screens/results';
import { drawInitials, drawSubmitted } from './screens/initials';
import { drawOperator, OPERATOR_ITEMS } from './screens/operator';
import { Synth } from '../audio/synth';

/** World zoom about the floor line so the runner reads from across a booth. */
export const ZOOM = 1.4;
function zoom(ctx: CanvasRenderingContext2D): void {
  ctx.translate(0, GROUND_Y);
  ctx.scale(ZOOM, ZOOM);
  ctx.translate(0, -GROUND_Y);
}

const HOUSE = houseJson as unknown as GhostRecord;
const VERSION = courseVersion(COURSE);

interface Result {
  record: GhostRecord;
  rival: GhostRecord;
  verdict: VerdictPart[];
  newBest: boolean;
}

export class App {
  readonly booth: Booth;
  readonly synth = new Synth();
  readonly fx = new Fx();
  meta: Meta;
  runs: GhostRecord[];
  run: RunState | null = null;
  ghost: GhostRunner | null = null;
  rival: RivalChoice;
  attract: GhostRunner;
  chips: Chip[] = [];
  lastGate = -1;
  result: Result | null = null;
  letters = ['A', 'A', 'A'];
  slot = 0;
  opFocus = 0;
  opConfirm = false;
  finishAt = 0;
  private ghostDrawer = new GhostDrawer();
  private attractDrawer = new GhostDrawer();
  private channel: BroadcastChannel | null;
  private liveRun: LiveRun | null = null;
  private lastCam = 0;
  private initialsSlideUsed = false;
  reducedMotion = false;
  frozenNow: number | null = null;
  /** Scripted input for screenshot scenes; null = the real keyboard/mouse. */
  maskOverride: ((sim: import('../sim/sim').Sim) => number) | null = null;

  constructor(private ctx: CanvasRenderingContext2D, private input: Input, private kv: KV, private clock: () => number, syncBoard = true) {
    this.channel = syncBoard ? openChannel() : null;
    this.booth = new Booth(clock, { enter: (s, from) => this.onEnter(s, from), autoSubmit: () => this.submitInitials(true) });
    this.meta = loadMeta(kv, dateKey(new Date()));
    this.runs = loadRuns(kv, this.meta.currentDay);
    this.rival = this.chooseRival(false);
    this.attract = new GhostRunner(COURSE, this.rival.record);
    this.applySettings();
    input.onAnyPress = () => this.synth.unlock();
  }

  applySettings(): void {
    this.synth.enabled = this.meta.settings.sound;
    this.fx.shakeEnabled = this.meta.settings.shake && !this.reducedMotion;
  }

  private notifyBoard(): void {
    try {
      this.channel?.postMessage('changed');
    } catch {
      /* monitor is optional */
    }
  }

  private publishLiveRun(): void {
    if (this.liveRun) this.liveRun.updatedAt = Date.now();
    saveLiveRun(this.kv, this.liveRun);
    this.notifyBoard();
  }

  private chooseRival(champion: boolean): RivalChoice {
    return pickRival(this.runs, {
      champion,
      version: VERSION,
      house: HOUSE,
      forceHouse: this.meta.settings.forceHouse,
      verify: (r) => verifyGhost(COURSE, r),
    });
  }

  private refreshDay(): void {
    const today = dateKey(new Date());
    if (this.meta.currentDay.split('~')[0] === today) return;
    this.meta = loadMeta(this.kv, today);
    this.runs = loadRuns(this.kv, this.meta.currentDay);
    this.applySettings();
  }

  private resetAttract(): void {
    this.refreshDay();
    this.rival = this.chooseRival(false);
    this.attract = new GhostRunner(COURSE, this.rival.record);
    this.attractDrawer.reset();
  }

  private onEnter(s: BoothState, from: BoothState): void {
    if (s === 'countdown') {
      this.refreshDay();
      this.rival = this.chooseRival(this.booth.champion);
      if (this.meta.settings.forceHouse) {
        this.meta.settings.forceHouse = false;
        saveMeta(this.kv, this.meta);
      }
      this.run = new RunState(COURSE);
      this.ghost = new GhostRunner(COURSE, this.rival.record);
      this.ghostDrawer.reset();
      this.chips = [];
      this.lastGate = -1;
      this.result = null;
      this.input.clear();
    }
    if (s === 'run') {
      this.input.clear();
      this.synth.play('go');
      this.liveRun = { day: this.meta.currentDay, rival: this.rival.record.initials, deltas: COURSE.gates.map(() => null), updatedAt: 0 };
      this.publishLiveRun();
    }
    if (s === 'initials') {
      this.input.clear();
      this.letters = ['A', 'A', 'A'];
      this.slot = 0;
      this.initialsSlideUsed = false;
    }
    if (s === 'attract') {
      if (from === 'run') {
        this.liveRun = null;
        this.publishLiveRun();
      }
      this.input.clear();
      this.run = null;
      this.ghost = null;
      this.result = null;
      this.fx.reset();
      this.resetAttract();
    }
    if (s === 'operator') {
      this.opFocus = 0;
      this.opConfirm = false;
    }
  }

  // ---- Fixed Tick -------------------------------------------------------

  tick(): void {
    const presses = this.input.presses();
    for (const p of presses) if (p.ctrl && p.shift && p.code === 'KeyO') this.booth.openOperator();
    const now = this.clock();
    switch (this.booth.state) {
      case 'attract':
        this.attract.tick();
        if (this.attract.sim.finished || this.attract.rejected) this.resetAttract();
        for (const p of presses) {
          if ((p.ctrl && p.shift) || p.kind === 'slide') continue;
          this.booth.press({ champion: p.kind === 'jump' && (p.mask & MASK_SLIDE) !== 0 });
          break;
        }
        break;
      case 'countdown': {
        const step = Math.floor(this.booth.elapsed / 1000);
        const prev = Math.floor((this.booth.elapsed - 1000 / 60) / 1000);
        if (step !== prev && step < 3) this.synth.play('beep');
        break;
      }
      case 'run':
        this.tickRun(now);
        break;
      case 'results':
        if (presses.some((p) => !(p.ctrl && p.shift) && p.kind !== 'slide-release')) this.booth.press();
        break;
      case 'initials':
        for (const p of presses) {
          this.initialsPress(p);
          if (this.booth.state !== 'initials') break;
        }
        break;
      case 'operator':
        for (const p of presses) {
          this.operatorPress(p);
          if (this.booth.state !== 'operator') break;
        }
        break;
      default:
        break;
    }
    this.booth.update();
  }

  tickRun(now: number): void {
    const run = this.run!;
    const ghost = this.ghost!;
    run.tick(this.maskOverride ? this.maskOverride(run.sim) : this.input.mask, now);
    ghost.tick();
    const fx = this.fx;
    const ry = GROUND_Y - run.sim.r.y / FP;
    const rx = CAMERA_X / ZOOM;
    for (const e of run.sim.events) {
      switch (e.type) {
        case 'jump':
          fx.stretchAt = now;
          this.synth.play('jump');
          break;
        case 'land':
          fx.squashAt = now;
          fx.burst(rx + 14, GROUND_Y - 2, 4, C.text2, 160);
          this.synth.play('land');
          break;
        case 'slide':
          fx.burst(rx + 30, GROUND_Y - 2, 6, C.text2, 220);
          this.synth.play('slide');
          break;
        case 'perfect':
          fx.word('PERFECT', rx + 14, ry - 70, now, C.lime);
          fx.ring(rx + 14, ry - 24, now);
          fx.burst(rx + 14, ry - 24, 14, C.lime, 380);
          this.synth.play('perfect');
          break;
        case 'hit':
          fx.shake(now, 6, 120);
          fx.flashAt = now;
          fx.burst(rx + 28, ry - 24, 12, C.orange, 320);
          this.synth.play('hit');
          break;
        case 'gate': {
          const d = gateDelta(run.sim.splits, ghost.record.splits, e.gate);
          if (d !== null) this.chips.push({ gate: e.gate, delta: d, worldX: COURSE.gates[e.gate], at: now });
          this.lastGate = e.gate;
          this.synth.play('gate');
          if (this.liveRun) {
            this.liveRun.deltas[e.gate] = d;
            this.publishLiveRun();
          }
          break;
        }
        default:
          break;
      }
    }
    if (run.sim.finished) this.finishRun(now);
  }

  private finishRun(now: number): void {
    const run = this.run!;
    const rival = this.rival.record;
    const prevBest = topRuns(this.runs, 1)[0];
    const beat = !run.sim.dnf && (rival.dnf || run.sim.finishTick < rival.finishTick - 1);
    this.meta.runCounter++;
    const record = recordFromSim(run.sim, run.rec.log, {
      id: `${this.meta.currentDay}-${this.meta.runCounter}`,
      initials: '???',
      courseVersion: VERSION,
      rivalId: rival.id,
      beatRival: beat,
      createdAt: Date.now(),
    });
    this.meta.relayStreak = nextStreak(this.meta.relayStreak, beat);
    this.meta.bestStreak = Math.max(this.meta.bestStreak, this.meta.relayStreak);
    saveMeta(this.kv, this.meta);
    this.runs = appendRun(this.kv, this.meta.currentDay, record);
    const newBest = !record.dnf && (!prevBest || record.finishTick < prevBest.finishTick);
    this.result = { record, rival, verdict: verdict(record, rival).parts, newBest };
    this.finishAt = now;
    this.synth.play(newBest ? 'best' : 'finish');
    this.liveRun = null;
    this.publishLiveRun();
    this.booth.runFinished();
  }

  initialsPress(p: Press): void {
    this.booth.touch();
    const code = p.code;
    if (p.kind === 'slide-release') {
      if (!this.initialsSlideUsed && code !== 'Mouse2') this.letters[this.slot] = cycleLetter(this.letters[this.slot], 1);
      this.initialsSlideUsed = false;
      return;
    }
    if (p.kind === 'slide') {
      this.initialsSlideUsed = false;
      if (code === 'Mouse2') this.letters[this.slot] = cycleLetter(this.letters[this.slot], 1);
      return;
    }
    const twoButtonConfirm = p.kind === 'jump' && (p.mask & MASK_SLIDE) !== 0;
    if (twoButtonConfirm) this.initialsSlideUsed = true;
    if (twoButtonConfirm || code === 'Space' || code === 'ArrowRight' || code === 'Enter' || code === 'NumpadEnter' || code === 'Mouse0') {
      if (this.slot < 2) this.slot++;
      else this.submitInitials(false);
    } else if (code === 'ArrowUp' || code === 'KeyW') this.letters[this.slot] = cycleLetter(this.letters[this.slot], -1);
    else if (code === 'ArrowLeft' || code === 'Backspace') this.slot = Math.max(0, this.slot - 1);
    else if (/^Key[A-Z]$/.test(code)) {
      this.letters[this.slot] = code.slice(3);
      if (this.slot < 2) this.slot++;
    }
  }

  submitInitials(auto: boolean): void {
    if (!this.result) return;
    const initials = auto ? '???' : cleanInitials(this.letters.join(''));
    this.result.record.initials = initials;
    this.runs = updateRun(this.kv, this.meta.currentDay, this.result.record.id, { initials });
    this.notifyBoard();
    if (!auto) this.booth.initialsDone();
  }

  private operatorPress(p: Press): void {
    this.booth.touch();
    if (p.code === 'Escape') return this.booth.closeOperator();
    if (p.code === 'ArrowDown' || p.code === 'Tab') this.opFocus = (this.opFocus + 1) % OPERATOR_ITEMS.length;
    else if (p.code === 'ArrowUp') this.opFocus = (this.opFocus + OPERATOR_ITEMS.length - 1) % OPERATOR_ITEMS.length;
    else if (p.code === 'Enter' || p.code === 'Space') this.operatorAction(OPERATOR_ITEMS[this.opFocus].id);
    if (OPERATOR_ITEMS[this.opFocus].id !== 'newday') this.opConfirm = false;
  }

  private operatorAction(id: string): void {
    const s = this.meta.settings;
    if (id === 'newday') {
      if (!this.opConfirm) {
        this.opConfirm = true;
        return;
      }
      this.meta = startNewDay(this.kv, this.meta, dateKey(new Date()));
      this.runs = [];
      this.opConfirm = false;
      this.liveRun = null;
      this.publishLiveRun();
    } else if (id === 'sound') s.sound = !s.sound;
    else if (id === 'shake') s.shake = !s.shake;
    else if (id === 'house') s.forceHouse = !s.forceHouse;
    else if (id === 'export') this.exportDay();
    else if (id === 'close') return this.booth.closeOperator();
    saveMeta(this.kv, this.meta);
    this.applySettings();
  }

  private exportDay(): void {
    const blob = new Blob([JSON.stringify({ day: this.meta.currentDay, courseVersion: VERSION, runs: this.runs }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ghost-relay-${this.meta.currentDay}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  // ---- Render -----------------------------------------------------------

  frame(alpha: number, dt: number): void {
    const ctx = this.ctx;
    const now = this.frozenNow ?? this.clock();
    const state = this.booth.state;
    const showRun = this.run && state !== 'attract' && state !== 'operator';
    ctx.save();
    const [ox, oy] = this.fx.offset(now);
    ctx.translate(ox, oy);

    if (showRun) {
      const run = this.run!;
      // finish slow-mo: ease the camera for 250 ms after the line
      const x = run.x(alpha);
      const camX = x - CAMERA_X / ZOOM;
      const camDx = camX - this.lastCam;
      this.lastCam = camX;
      drawBackground(ctx, camX, run.sim.flow);
      zoom(ctx);
      drawWorld(ctx, { course: COURSE, camX, tick: run.sim.tick, obsState: run.sim.obsState, beams: run.sim.beams, hitAt: run.hitAt, now });
      const ghost = this.ghost;
      if (ghost && !ghost.rejected) {
        const gx = ghost.x(alpha);
        this.ghostDrawer.draw(ctx, { sx: gx - camX, y: ghost.y(alpha), sliding: ghost.sim.r.sliding === 1, airborne: ghost.sim.r.grounded === 0, scaleY: 1, phase: run.sim.tick / 60 + 0.3 }, gx, camX, ghost.record.initials);
      }
      const stumbling = run.sim.r.stumble > 0 && Math.floor(now / 60) % 2 === 0;
      drawRunner(
        ctx,
        { sx: CAMERA_X / ZOOM, y: run.y(alpha), sliding: run.sim.r.sliding === 1, airborne: run.sim.r.grounded === 0, scaleY: this.fx.scaleY(now), phase: run.sim.tick / 60 },
        stumbling ? C.orange : C.lime,
        C.ink,
      );
      this.drawSpeedLines(ctx, run.sim.flow, camX);
      this.fx.draw(ctx, now, dt, state === 'run' ? camDx : 0);
      ctx.restore();
      ctx.save();
      if (state === 'run' || state === 'countdown') {
        const ld = this.lastGate >= 0 && ghost ? gateDelta(run.sim.splits, ghost.record.splits, this.lastGate) : null;
        drawHud(ctx, { tick: run.sim.tick, rivalInitials: this.rival.record.initials, lastDelta: ld, lastGate: this.lastGate, flow: run.sim.flow, chips: this.chips, camX, now, gateCount: COURSE.gates.length });
      }
      if (now - this.fx.flashAt < 120) {
        ctx.fillStyle = 'oklch(0.72 0.19 45 / 0.12)';
        ctx.fillRect(0, 0, W, H);
      }
      if (state === 'countdown') drawCountdown(ctx, this.booth.elapsed, this.rival.record.initials);
      if (state === 'results' && this.result) this.drawResult(now);
      if (state === 'initials' && this.result) {
        drawInitials(ctx, { letters: this.letters, slot: this.slot, finishTick: this.result.record.finishTick, dnf: this.result.record.dnf, idleFrac: Math.min(1, (this.clock() - this.booth.lastInputAt) / TIMERS.initialsIdle) });
      }
      if (state === 'submitted' && this.result) drawSubmitted(ctx, this.result.record.initials, this.booth.elapsed);
    } else {
      const g = this.attract;
      const gx = g.x(alpha);
      const camX = gx - (CAMERA_X + 360) / ZOOM;
      drawBackground(ctx, camX, g.sim.flow);
      zoom(ctx);
      drawWorld(ctx, { course: COURSE, camX, tick: g.sim.tick, obsState: g.sim.obsState, beams: g.sim.beams, hitAt: [], now });
      this.attractDrawer.draw(ctx, { sx: gx - camX, y: g.y(alpha), sliding: g.sim.r.sliding === 1, airborne: g.sim.r.grounded === 0, scaleY: 1, phase: g.sim.tick / 60 }, gx, camX, this.rival.record.initials);
      ctx.restore();
      ctx.save();
      const champ = topRuns(this.runs.filter((r) => r.courseVersion === VERSION && r.inputs), 1)[0];
      drawAttract(ctx, {
        rivalInitials: this.rival.record.initials,
        rivalTicks: this.rival.record.finishTick,
        rivalKind: this.rival.kind,
        rivalDnf: this.rival.record.dnf,
        streak: this.meta.relayStreak,
        runsToday: this.runs.length,
        champion: champ ? { initials: champ.initials, ticks: champ.finishTick } : null,
        now,
        sample: this.runs.length === 0,
      });
      if (state === 'operator') drawOperator(ctx, this.meta.settings, this.opFocus, this.opConfirm, this.meta.currentDay, this.runs.length);
    }
    ctx.restore();
  }

  private drawSpeedLines(ctx: CanvasRenderingContext2D, flow: number, camX: number): void {
    if (this.reducedMotion || !this.meta.settings.shake || flow <= 1050) return;
    const n = Math.floor((flow - 1000) / 40);
    ctx.strokeStyle = 'oklch(0.95 0.01 250 / 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const y = 180 + ((i * 137) % 380);
      const x = W - ((camX * 2.4 + i * 211) % (W + 200));
      ctx.moveTo(x, y);
      ctx.lineTo(x + 60 + (flow - 1000) / 4, y);
    }
    ctx.stroke();
  }

  private drawResult(now: number): void {
    const res = this.result!;
    const rec = res.record;
    const segTicks = rec.splits.map((s, i) => (s < 0 ? 0 : s - (i === 0 ? 0 : rec.splits[i - 1])));
    drawResults(this.ctx, {
      ageMs: now - this.finishAt,
      finishTick: rec.finishTick,
      dnf: rec.dnf,
      rivalInitials: res.rival.initials,
      overall: res.rival.dnf ? null : rec.finishTick - res.rival.finishTick,
      segDeltas: segmentDeltas(rec.splits, res.rival.splits),
      segTicks,
      labels: COURSE.gateLabels,
      verdict: res.verdict,
      hits: rec.hits.reduce((a, b) => a + b, 0),
      perfects: rec.perfects.reduce((a, b) => a + b, 0),
      newBest: res.newBest,
      canSkip: this.booth.elapsed >= TIMERS.resultsGuard,
    });
  }
}
