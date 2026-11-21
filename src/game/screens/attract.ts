import { C, display, mono, tracked } from '../render/theme';
import { keyCap, label } from '../render/ui';
import { W, H } from '../canvas';
import { formatTime } from '../../sim/splits';
import type { RivalKind } from '../../booth/rival';

export interface AttractView {
  rivalInitials: string;
  rivalTicks: number;
  rivalKind: RivalKind;
  rivalDnf: boolean;
  streak: number;
  runsToday: number;
  champion: { initials: string; ticks: number } | null;
  now: number;
  sample: boolean;
  reducedMotion?: boolean;
}

export function drawAttract(ctx: CanvasRenderingContext2D, v: AttractView): void {
  // Left scrim so the type always reads over the moving course.
  const g = ctx.createLinearGradient(0, 0, 760, 0);
  g.addColorStop(0, 'oklch(0.12 0.02 250 / 0.92)');
  g.addColorStop(0.7, 'oklch(0.12 0.02 250 / 0.6)');
  g.addColorStop(1, 'oklch(0.12 0.02 250 / 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 760, H);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Wordmark.
  ctx.fillStyle = C.lime;
  ctx.fillRect(64, 58, 10, 30);
  ctx.fillStyle = C.cyan;
  ctx.globalAlpha = 0.5;
  ctx.fillRect(80, 58, 10, 30);
  ctx.globalAlpha = 1;
  ctx.font = display(30, 700);
  tracked(ctx, 30);
  ctx.fillStyle = C.text;
  ctx.fillText('GHOST RELAY', 104, 85);
  ctx.letterSpacing = '0px';

  // Rival block.
  const kind = v.rivalKind === 'house' ? 'STARTER · HOUSE GHOST' : v.rivalKind === 'champion' ? "TODAY'S CHAMPION" : 'THE LAST PLAYER';
  label(ctx, `NEXT RIVAL · ${kind}`, 64, 222, C.text2, 16);
  ctx.font = display(128, 700);
  tracked(ctx, 128);
  ctx.fillStyle = C.text;
  ctx.fillText('BEAT', 58, 340);
  const bw = ctx.measureText('BEAT ').width;
  ctx.fillStyle = C.cyan;
  ctx.fillText(v.rivalInitials, 58 + bw, 340);
  ctx.letterSpacing = '0px';
  ctx.font = mono(52, 600);
  ctx.fillStyle = C.text;
  const t = v.rivalDnf ? 'DNF' : formatTime(v.rivalTicks);
  ctx.fillText(t, 64, 410);
  const tw = ctx.measureText(t).width;
  label(ctx, v.rivalDnf ? 'DID NOT FINISH' : 'SECONDS', 64 + tw + 14, 408, C.text2, 18);

  // Controls.
  const y = 548;
  let x = 64;
  x += keyCap(ctx, '↑', 'JUMP', x, y) + 40;
  keyCap(ctx, '↓', 'SLIDE', x, y);
  label(ctx, 'HOLD ↑ TO JUMP HIGHER · MOUSE WORKS TOO', 64, y + 58, C.text3, 13);

  // Pulsing call to action (ambient, not input-driven, so it may animate).
  const pulse = v.reducedMotion ? 1 : 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(v.now / 380));
  ctx.globalAlpha = pulse;
  ctx.font = display(26, 700);
  tracked(ctx, 26);
  ctx.fillStyle = C.lime;
  ctx.fillText('PRESS ANY KEY', 64, 668);
  ctx.letterSpacing = '0px';
  ctx.globalAlpha = 1;

  // Right column: streak, runs, champion hint.
  ctx.textAlign = 'right';
  label(ctx, 'RELAY STREAK', W - 64, 70, C.text2, 14);
  ctx.textAlign = 'right';
  ctx.font = mono(48, 700);
  ctx.fillStyle = v.streak > 0 ? C.lime : C.text;
  ctx.fillText(String(v.streak), W - 64, 122);
  ctx.textAlign = 'right';
  label(ctx, `${v.runsToday} ${v.runsToday === 1 ? 'RUN' : 'RUNS'} TODAY`, W - 64, 152, C.text3, 13);
  if (v.champion) {
    ctx.textAlign = 'right';
    label(ctx, `HOLD ↓ + PRESS ↑ TO RACE TODAY'S CHAMPION · ${v.champion.initials} ${formatTime(v.champion.ticks)}`, W - 64, 668, C.text2, 14);
  }
  if (v.sample) {
    ctx.textAlign = 'right';
    label(ctx, 'STARTER RUN · SCRIPTED HOUSE GHOST · YOUR RUN BECOMES THE NEXT RIVAL', W - 64, 640, C.orange, 13);
  }
  ctx.textAlign = 'left';
}
