import { C, display, mono, tracked } from '../render/theme';
import { drawParts, label, reveal } from '../render/ui';
import { W, H } from '../canvas';
import { formatDelta, formatTime } from '../../sim/splits';
import { deltaColour } from '../render/hud';
import type { VerdictPart } from '../../booth/verdict';

export interface ResultsView {
  ageMs: number;
  finishTick: number;
  dnf: boolean;
  rivalInitials: string;
  overall: number | null;
  segDeltas: (number | null)[];
  segTicks: number[];
  labels: string[];
  verdict: VerdictPart[];
  hits: number;
  perfects: number;
  newBest: boolean;
  canSkip: boolean;
}

/** Broadcast lower-third: total, overall Delta, six-segment split bar, Verdict. */
export function drawResults(ctx: CanvasRenderingContext2D, v: ResultsView): void {
  const a = v.ageMs;
  ctx.fillStyle = 'oklch(0.10 0.02 250 / 0.55)';
  ctx.fillRect(0, 0, W, H);
  const top = 300;
  const r0 = reveal(a, 0, 300);
  ctx.fillStyle = 'oklch(0.13 0.02 250 / 0.96)';
  ctx.fillRect(0, top + (1 - r0) * 40, W, H - top);
  ctx.fillStyle = C.lime;
  ctx.fillRect(0, top + (1 - r0) * 40, 12 + 52 * r0, 4);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const x = 64;

  // Total time + overall Delta.
  const r1 = reveal(a, 60);
  ctx.globalAlpha = r1;
  label(ctx, `YOUR TIME · VS ${v.rivalInitials}`, x, top + 50 + (1 - r1) * 12, C.text2, 15);
  ctx.font = mono(92, 700);
  ctx.fillStyle = C.text;
  const t = v.dnf ? 'DNF' : formatTime(v.finishTick);
  ctx.fillText(t, x - 4, top + 140 + (1 - r1) * 12);
  const tw = ctx.measureText(t).width;
  const r2 = reveal(a, 160);
  ctx.globalAlpha = r2;
  if (v.overall !== null && !v.dnf) {
    const col = deltaColour(v.overall);
    ctx.font = mono(48, 700);
    ctx.fillStyle = col;
    const dx = x + tw + 36;
    ctx.fillText(formatDelta(v.overall), dx, top + 134);
    const dw = ctx.measureText(formatDelta(v.overall)).width;
    const word = Math.abs(v.overall) <= 1 ? 'LEVEL WITH' : v.overall < 0 ? 'AHEAD OF' : 'BEHIND';
    label(ctx, `${word} ${v.rivalInitials}`, dx + dw + 14, top + 132, col, 22);
  }
  // Counts, right aligned.
  ctx.textAlign = 'right';
  label(ctx, `${v.perfects} PERFECT · ${v.hits} ${v.hits === 1 ? 'HIT' : 'HITS'}`, W - 64, top + 50, C.text2, 15);
  ctx.textAlign = 'left';

  // Split bar.
  const barY = top + 190;
  const barW = W - 128;
  const total = v.segTicks.reduce((s, n) => s + Math.max(1, n), 0) || 1;
  let sx = x;
  v.segTicks.forEach((ticks, i) => {
    const w = (Math.max(1, ticks) / total) * barW;
    const r = reveal(a, 240 + i * 70, 260);
    const d = v.segDeltas[i];
    const col = d === null ? C.text3 : deltaColour(d);
    ctx.globalAlpha = r;
    ctx.fillStyle = d === null ? 'oklch(0.95 0.01 250 / 0.06)' : d <= -3 ? C.limeDim : d >= 3 ? C.orangeDim : 'oklch(0.95 0.01 250 / 0.08)';
    ctx.fillRect(sx + 2, barY, (w - 4) * r, 52);
    ctx.fillStyle = col;
    ctx.fillRect(sx + 2, barY, (w - 4) * r, 4);
    label(ctx, v.labels[i], sx + 12, barY + 34, C.text2, 14);
    ctx.font = mono(20, 700);
    ctx.fillStyle = col;
    ctx.textAlign = 'right';
    ctx.fillText(d === null ? '—' : formatDelta(d), sx + w - 12, barY + 35);
    ctx.textAlign = 'left';
    sx += w;
  });

  // Verdict.
  const r3 = reveal(a, 400, 400);
  ctx.globalAlpha = r3;
  drawParts(ctx, v.verdict, x, barY + 110 + (1 - r3) * 10, W - 128 - 260, 30, C.lime);
  ctx.globalAlpha = 1;

  if (v.newBest) {
    const r4 = reveal(a, 520);
    ctx.globalAlpha = r4;
    ctx.fillStyle = C.lime;
    ctx.fillRect(W - 64 - 250, top - 46, 250, 40);
    ctx.font = display(20, 700);
    tracked(ctx, 20);
    ctx.fillStyle = C.ink;
    ctx.textAlign = 'center';
    ctx.fillText('NEW BEST TODAY', W - 64 - 125, top - 19);
    ctx.letterSpacing = '0px';
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }
  if (v.canSkip) {
    ctx.textAlign = 'right';
    label(ctx, 'ANY KEY · CONTINUE', W - 64, H - 30, C.text3, 13);
    ctx.textAlign = 'left';
  }
}
