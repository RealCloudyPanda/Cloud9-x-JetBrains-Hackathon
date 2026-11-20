import { formatDelta, formatTime } from '../../sim/splits';
import { TUNING } from '../../sim/tuning';
import { W } from '../canvas';
import { C, EASE_OUT, display, mono, tracked } from './theme';

export interface Chip {
  gate: number;
  /** Cumulative Delta at that gate, Ticks. */
  delta: number;
  worldX: number;
  at: number;
}

export interface HudView {
  tick: number;
  rivalInitials: string;
  lastDelta: number | null;
  lastGate: number;
  flow: number;
  chips: Chip[];
  camX: number;
  now: number;
  gateCount: number;
}

export function deltaColour(ticks: number): string {
  if (ticks <= -3) return C.lime;
  if (ticks >= 3) return C.orange;
  return C.text2;
}

export function drawHud(ctx: CanvasRenderingContext2D, v: HudView): void {
  // Top bar.
  ctx.fillStyle = 'oklch(0.12 0.02 250 / 0.82)';
  ctx.fillRect(0, 0, W, 76);
  ctx.fillStyle = 'oklch(0.95 0.01 250 / 0.08)';
  ctx.fillRect(0, 76, W, 1);

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.font = display(13, 600);
  tracked(ctx, 13);
  ctx.fillStyle = C.text2;
  ctx.fillText('TIME', 40, 26);
  ctx.letterSpacing = '0px';
  ctx.font = mono(34, 600);
  ctx.fillStyle = C.text;
  ctx.fillText(formatTime(v.tick), 40, 53);

  // vs rival
  const vx = 260;
  ctx.font = display(13, 600);
  tracked(ctx, 13);
  ctx.fillStyle = C.text2;
  ctx.fillText(v.lastGate >= 0 ? `VS ${v.rivalInitials} · AT ${v.lastGate === v.gateCount - 1 ? 'FIN' : 'G' + (v.lastGate + 1)}` : `VS ${v.rivalInitials}`, vx, 26);
  ctx.letterSpacing = '0px';
  ctx.font = mono(34, 600);
  if (v.lastDelta === null) {
    ctx.fillStyle = C.text3;
    ctx.fillText('—', vx, 53);
  } else {
    ctx.fillStyle = deltaColour(v.lastDelta);
    ctx.fillText(formatDelta(v.lastDelta), vx, 53);
    const tw = ctx.measureText(formatDelta(v.lastDelta)).width;
    ctx.font = display(16, 600);
    ctx.fillText(v.lastDelta < 0 ? 'AHEAD' : v.lastDelta > 0 ? 'BEHIND' : 'LEVEL', vx + tw + 12, 55);
  }

  // Flow meter
  const fx = W - 360;
  const fw = 320;
  ctx.font = display(13, 600);
  tracked(ctx, 13);
  ctx.fillStyle = C.text2;
  ctx.fillText('FLOW', fx, 26);
  ctx.letterSpacing = '0px';
  ctx.textAlign = 'right';
  ctx.font = mono(15, 500);
  ctx.fillStyle = C.text2;
  ctx.fillText(`×${(v.flow / 1000).toFixed(2)}`, fx + fw, 26);
  ctx.textAlign = 'left';
  const t = (v.flow - TUNING.flowMin) / (TUNING.flowMax - TUNING.flowMin);
  ctx.fillStyle = 'oklch(0.95 0.01 250 / 0.1)';
  ctx.fillRect(fx, 48, fw, 8);
  ctx.fillStyle = v.flow < 1000 ? C.orange : C.lime;
  ctx.fillRect(fx, 48, Math.max(2, fw * t), 8);
  // 1.00 tick
  const one = fx + fw * ((1000 - TUNING.flowMin) / (TUNING.flowMax - TUNING.flowMin));
  ctx.fillStyle = C.text;
  ctx.fillRect(one - 1, 44, 2, 16);

  // Delta chips above gates.
  for (const chip of v.chips) {
    const age = v.now - chip.at;
    if (age > 2600) continue;
    const sx = chip.worldX - v.camX;
    if (sx < -120 || sx > W + 120) continue;
    const pop = EASE_OUT(age / 220);
    const fade = age > 2000 ? 1 - (age - 2000) / 600 : 1;
    const text = formatDelta(chip.delta);
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.translate(sx, 196 - 18 * pop);
    ctx.scale(0.9 + 0.1 * pop, 0.9 + 0.1 * pop);
    ctx.font = mono(28, 700);
    const w = ctx.measureText(text).width + 28;
    const col = deltaColour(chip.delta);
    ctx.fillStyle = C.inkDeep;
    ctx.fillRect(-w / 2, -22, w, 44);
    ctx.fillStyle = col;
    ctx.fillRect(-w / 2, -22, 4, 44);
    ctx.textAlign = 'center';
    ctx.fillText(text, 2, 1);
    ctx.restore();
  }
}
