import { C, display, mono, tracked } from '../render/theme';
import { label } from '../render/ui';
import { W, H } from '../canvas';
import { formatTime } from '../../sim/splits';

export interface InitialsView {
  letters: string[];
  slot: number;
  finishTick: number;
  dnf: boolean;
  idleFrac: number;
}

export function drawInitials(ctx: CanvasRenderingContext2D, v: InitialsView): void {
  ctx.fillStyle = 'oklch(0.12 0.02 250 / 0.94)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'left';
  label(ctx, 'SIGN YOUR GHOST', 64, 150, C.text2, 18);
  ctx.font = display(56, 700);
  tracked(ctx, 56);
  ctx.fillStyle = C.text;
  ctx.fillText('ENTER YOUR INITIALS', 60, 214);
  ctx.letterSpacing = '0px';
  label(ctx, `YOUR TIME ${v.dnf ? 'DNF' : formatTime(v.finishTick)}`, 64, 256, C.lime, 18);

  for (let i = 0; i < 3; i++) {
    const x = 64 + i * 150;
    const active = i === v.slot;
    ctx.fillStyle = active ? 'oklch(0.95 0.01 250 / 0.08)' : 'oklch(0.95 0.01 250 / 0.03)';
    ctx.fillRect(x, 300, 124, 160);
    ctx.font = mono(112, 700);
    ctx.textAlign = 'center';
    ctx.fillStyle = i < v.slot ? C.lime : active ? C.text : C.text3;
    ctx.fillText(v.letters[i], x + 62, 422);
    ctx.textAlign = 'left';
    if (active) {
      ctx.fillStyle = C.lime;
      ctx.fillRect(x, 470, 124, 6);
      ctx.font = display(22, 700);
      ctx.fillStyle = C.text2;
      ctx.textAlign = 'center';
      ctx.fillText('▲', x + 62, 292);
      ctx.fillText('▼', x + 62, 506);
      ctx.textAlign = 'left';
    }
  }
  label(ctx, '↑ / ↓ / RIGHT-CLICK CHANGE LETTER   ·   SPACE / → / LEFT-CLICK CONFIRM   ·   ← BACK', 64, 565, C.text2, 15);
  label(ctx, 'TWO BUTTONS: HOLD ↓ AND PRESS ↑ TO CONFIRM', 64, 595, C.text2, 15);
  ctx.fillStyle = 'oklch(0.95 0.01 250 / 0.08)';
  ctx.fillRect(64, 620, 420, 4);
  ctx.fillStyle = C.text3;
  ctx.fillRect(64, 620, 420 * (1 - v.idleFrac), 4);
  label(ctx, 'AUTO-SAVES AS ??? WHEN THE BAR RUNS OUT', 64, 650, C.text3, 12);
}

export function drawSubmitted(ctx: CanvasRenderingContext2D, initials: string, ageMs: number, persistent = true): void {
  ctx.fillStyle = 'oklch(0.12 0.02 250 / 0.94)';
  ctx.fillRect(0, 0, W, H);
  const t = Math.min(1, ageMs / 260);
  const e = 1 - Math.pow(1 - t, 3);
  ctx.globalAlpha = e;
  label(ctx, persistent ? 'SAVED ON THIS BROWSER' : 'SESSION ONLY · EXPORT BEFORE CLOSING', 64, 280, C.text2, 18);
  ctx.font = display(84, 700);
  tracked(ctx, 84);
  ctx.fillStyle = C.text;
  ctx.fillText('YOUR GHOST', 60, 370 + (1 - e) * 16);
  ctx.fillStyle = C.cyan;
  ctx.fillText(`RUNS NEXT · ${initials}`, 60, 460 + (1 - e) * 16);
  ctx.letterSpacing = '0px';
  ctx.globalAlpha = 1;
}
