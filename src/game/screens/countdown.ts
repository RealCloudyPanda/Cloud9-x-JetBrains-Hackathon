import { C, display, tracked } from '../render/theme';
import { W } from '../canvas';
import { label } from '../render/ui';

/** 3 · 2 · 1 · GO, each scaling in over 180 ms with ease-out. */
export function drawCountdown(ctx: CanvasRenderingContext2D, elapsedMs: number, rivalInitials: string): void {
  const step = Math.min(3, Math.floor(elapsedMs / 1000));
  const age = elapsedMs - step * 1000;
  const text = step < 3 ? String(3 - step) : 'GO';
  const t = Math.min(1, age / 180);
  const e = 1 - Math.pow(1 - t, 3);
  const scale = 0.6 + 0.4 * e;
  ctx.save();
  ctx.translate(W / 2 + 60, 330);
  ctx.scale(scale, scale);
  ctx.globalAlpha = e;
  ctx.font = display(step < 3 ? 200 : 180, 700);
  tracked(ctx, 200);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = step < 3 ? C.text : C.lime;
  ctx.fillText(text, 0, 0);
  ctx.restore();
  ctx.letterSpacing = '0px';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  label(ctx, `RACING ${rivalInitials}`, 64, 120, C.cyan, 18);
}
