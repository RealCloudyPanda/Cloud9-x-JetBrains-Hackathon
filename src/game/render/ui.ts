import { C, display, mono, tracked } from './theme';
import type { VerdictPart } from '../../booth/verdict';

/** Small uppercase label with tracking. */
export function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, colour: string = C.text2, size = 14): number {
  ctx.font = display(size, 600);
  tracked(ctx, size);
  ctx.fillStyle = colour;
  ctx.fillText(text, x, y);
  const w = ctx.measureText(text).width;
  ctx.letterSpacing = '0px';
  return w;
}

/** An outlined key cap with a glyph and a caption. Returns the width used. */
export function keyCap(ctx: CanvasRenderingContext2D, glyph: string, caption: string, x: number, y: number, colour: string = C.text): number {
  const size = 52;
  ctx.lineWidth = 2;
  ctx.strokeStyle = colour;
  ctx.beginPath();
  ctx.roundRect(x, y - size / 2, size, size, 8);
  ctx.stroke();
  ctx.fillStyle = 'oklch(0.95 0.01 250 / 0.06)';
  ctx.fill();
  ctx.font = display(28, 700);
  ctx.textAlign = 'center';
  ctx.fillStyle = colour;
  ctx.fillText(glyph, x + size / 2, y + 2);
  ctx.textAlign = 'left';
  ctx.font = display(22, 700);
  tracked(ctx, 22);
  ctx.fillText(caption, x + size + 14, y + 2);
  const w = size + 14 + ctx.measureText(caption).width;
  ctx.letterSpacing = '0px';
  return w;
}

/** Verdict sentence with strong parts highlighted, wrapped to maxW. */
export function drawParts(ctx: CanvasRenderingContext2D, parts: VerdictPart[], x: number, y: number, maxW: number, size: number, strong: string): void {
  const words: { t: string; strong: boolean }[] = [];
  for (const p of parts) {
    const pieces = p.text.split(/(\s+)/).filter((s) => s.length);
    for (const piece of pieces) words.push({ t: piece, strong: !!p.strong });
  }
  ctx.font = display(size, 600);
  let cx = x;
  let cy = y;
  for (const w of words) {
    const tw = ctx.measureText(w.t).width;
    if (/^\s+$/.test(w.t)) {
      if (cx > x) cx += tw;
      continue;
    }
    if (cx + tw > x + maxW && cx > x) {
      cx = x;
      cy += size * 1.3;
    }
    ctx.fillStyle = w.strong ? strong : C.text;
    ctx.fillText(w.t, cx, cy);
    cx += tw;
  }
}

export function monoText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, colour: string, weight = 600): number {
  ctx.font = mono(size, weight);
  ctx.fillStyle = colour;
  ctx.fillText(text, x, y);
  return ctx.measureText(text).width;
}

/** Reveal helper: 0→1 over `dur` ms starting at `delay`. */
export function reveal(age: number, delay: number, dur = 320): number {
  const t = Math.min(1, Math.max(0, (age - delay) / dur));
  return 1 - Math.pow(1 - t, 4);
}
