import type { Course } from '../../sim/course';
import { BAR_UNDERSIDE, BEAM_HIGH, BEAM_LOW, BEAM_TRIGGER, BEAM_UNLOCKED, HURDLE_H, obstacleWidth } from '../../sim/obstacles';
import { OBS_HIT, OBS_PERFECT } from '../../sim/sim';
import { GROUND_Y, W } from '../canvas';
import { C, display, tracked } from './theme';

export const CAMERA_X = 320;

export interface WorldView {
  course: Course;
  /** World px at the left edge of the screen. */
  camX: number;
  tick: number;
  obsState: number[];
  beams: number[];
  /** Per-obstacle render time (ms) of the last Hit, for the orange flash. */
  hitAt: number[];
  now: number;
}

const BAR_DRAW_TOP = 512;

function neonRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, stroke: string, glow: string): void {
  ctx.fillStyle = glow;
  ctx.fillRect(x, y, w, h);
  ctx.lineWidth = 6;
  ctx.strokeStyle = glow;
  ctx.strokeRect(x, y, w, h);
  ctx.lineWidth = 2;
  ctx.strokeStyle = stroke;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
}

function drawHurdle(ctx: CanvasRenderingContext2D, sx: number, stroke: string, glow: string): void {
  neonRect(ctx, sx, GROUND_Y - HURDLE_H, 24, HURDLE_H, stroke, glow);
  ctx.fillStyle = stroke;
  ctx.fillRect(sx + 4, GROUND_Y - HURDLE_H + 8, 16, 3);
}

function drawBar(ctx: CanvasRenderingContext2D, sx: number, w: number, stroke: string, glow: string): void {
  const top = BAR_DRAW_TOP;
  const bottom = GROUND_Y - BAR_UNDERSIDE;
  // cables to the rafters
  ctx.strokeStyle = 'oklch(0.86 0.08 300 / 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(sx + 6, 0);
  ctx.lineTo(sx + 6, top);
  ctx.moveTo(sx + w - 6, 0);
  ctx.lineTo(sx + w - 6, top);
  ctx.stroke();
  neonRect(ctx, sx, top, w, bottom - top, stroke, glow);
  // hazard ticks on the underside so the gap reads as "go under"
  ctx.fillStyle = stroke;
  for (let x = sx + 8; x < sx + w - 8; x += 16) ctx.fillRect(x, bottom - 8, 8, 3);
}

/** Floor line with gaps for Pits, obstacles, gate banners. */
export function drawWorld(ctx: CanvasRenderingContext2D, v: WorldView): void {
  const { course, camX } = v;
  const obs = course.obstacles;

  // Floor, broken by pits.
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 3;
  ctx.beginPath();
  let cursor = camX - 10;
  for (const o of obs) {
    if (o.kind !== 'pit') continue;
    const end = o.x + obstacleWidth(o);
    if (end < camX || o.x > camX + W) continue;
    ctx.moveTo(cursor - camX, GROUND_Y);
    ctx.lineTo(o.x - camX, GROUND_Y);
    cursor = end;
  }
  ctx.moveTo(cursor - camX, GROUND_Y);
  ctx.lineTo(W + 10, GROUND_Y);
  ctx.stroke();

  // Under-floor sheen.
  ctx.fillStyle = 'oklch(0.95 0.01 250 / 0.05)';
  ctx.fillRect(0, GROUND_Y + 2, W, 6);

  // Gates.
  course.gates.forEach((gx, i) => {
    const sx = gx - camX;
    if (sx < -200 || sx > W) return;
    const fin = i === course.gates.length - 1;
    ctx.strokeStyle = fin ? C.lime : 'oklch(0.95 0.01 250 / 0.35)';
    ctx.lineWidth = 2;
    ctx.setLineDash(fin ? [] : [6, 8]);
    ctx.beginPath();
    ctx.moveTo(sx, 150);
    ctx.lineTo(sx, GROUND_Y);
    ctx.stroke();
    ctx.setLineDash([]);
    const label = course.gateLabels[i];
    const name = i + 1 < course.segmentNames.length ? course.segmentNames[i + 1] : 'FINISH';
    ctx.font = display(18);
    tracked(ctx, 18);
    const tw = Math.max(ctx.measureText(label).width, 0);
    ctx.fillStyle = fin ? C.lime : C.inkRaised;
    ctx.fillRect(sx - 2, 122, tw + 20, 30);
    ctx.fillStyle = fin ? C.ink : C.text;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, sx + 8, 138);
    ctx.font = display(13, 600);
    tracked(ctx, 13);
    ctx.fillStyle = C.text2;
    ctx.fillText(fin ? 'FINISH' : `NEXT · ${name}`, sx + tw + 28, 138);
    ctx.letterSpacing = '0px';
  });

  // Obstacles.
  for (let i = 0; i < obs.length; i++) {
    const o = obs[i];
    const w = obstacleWidth(o);
    const sx = o.x - camX;
    if (sx + w < -40 || sx > W + 40) continue;
    const hitAge = v.now - v.hitAt[i];
    const hot = v.obsState[i] === OBS_HIT;
    const flashing = hitAge >= 0 && hitAge < 260;
    const perfect = v.obsState[i] === OBS_PERFECT;
    const stroke = hot ? C.orange : perfect ? C.lime : C.obstacle;
    const glow = flashing ? 'oklch(0.72 0.19 45 / 0.55)' : hot ? C.orangeDim : perfect ? C.limeDim : C.obstacleGlow;

    switch (o.kind) {
      case 'hurdle':
        drawHurdle(ctx, sx, stroke, glow);
        break;
      case 'lowbar':
        drawBar(ctx, sx, w, stroke, glow);
        break;
      case 'pit': {
        ctx.fillStyle = 'oklch(0.08 0.02 250)';
        ctx.fillRect(sx, GROUND_Y - 1, w, 120);
        ctx.strokeStyle = hot ? C.orange : 'oklch(0.72 0.19 45 / 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx, GROUND_Y);
        ctx.lineTo(sx, GROUND_Y + 40);
        ctx.moveTo(sx + w, GROUND_Y);
        ctx.lineTo(sx + w, GROUND_Y + 40);
        ctx.stroke();
        // lip markers
        ctx.fillStyle = 'oklch(0.72 0.19 45 / 0.8)';
        ctx.fillRect(sx - 10, GROUND_Y - 2, 10, 4);
        ctx.fillRect(sx + w, GROUND_Y - 2, 10, 4);
        break;
      }
      case 'beam': {
        const state = v.beams[i];
        const shown = state === BEAM_UNLOCKED ? ((v.tick / 6) | 0) % 2 : state;
        const locked = state !== BEAM_UNLOCKED;
        const s = locked ? stroke : 'oklch(0.86 0.08 300 / 0.55)';
        const g = locked ? glow : 'oklch(0.86 0.08 300 / 0.08)';
        if (shown === BEAM_LOW) drawHurdle(ctx, sx, s, g);
        else if (shown === BEAM_HIGH) drawBar(ctx, sx, w, s, g);
        // trigger tick on the floor
        const tx = o.x - BEAM_TRIGGER - camX;
        ctx.fillStyle = locked ? 'oklch(0.95 0.01 250 / 0.25)' : 'oklch(0.95 0.01 250 / 0.6)';
        ctx.fillRect(tx - 1, GROUND_Y + 6, 2, 10);
        if (locked) {
          ctx.font = display(14);
          ctx.fillStyle = stroke;
          ctx.textAlign = 'center';
          ctx.fillText(state === BEAM_LOW ? '↑' : '↓', sx + 12, GROUND_Y + 26);
        }
        break;
      }
    }
  }
}
