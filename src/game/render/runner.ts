import { GROUND_Y } from '../canvas';

export interface RunnerPose {
  /** Screen x of the back edge, world feet height (px, up). */
  sx: number;
  y: number;
  sliding: boolean;
  airborne: boolean;
  /** Vertical scale for squash/stretch (1 = none). */
  scaleY: number;
  /** Seconds, drives the stride animation. */
  phase: number;
}

/** A sleek capsule runner with a visor and striding legs. */
export function drawRunner(ctx: CanvasRenderingContext2D, p: RunnerPose, body: string, visor: string): void {
  const w = p.sliding ? 44 : 28;
  const h = (p.sliding ? 22 : 48) * p.scaleY;
  const scaleX = 1 + (1 - p.scaleY) * 0.6;
  const cx = p.sx + w / 2;
  const footY = GROUND_Y - p.y;
  const bw = w * scaleX;

  ctx.save();
  ctx.translate(cx, footY);
  if (!p.sliding) ctx.rotate(p.airborne ? -0.05 : 0.09); // lean into the run

  // legs
  if (!p.sliding) {
    const stride = p.airborne ? 0.6 : Math.sin(p.phase * 22);
    ctx.strokeStyle = body;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-4, -12);
    ctx.lineTo(-4 + stride * 7, -1);
    ctx.moveTo(4, -12);
    ctx.lineTo(4 - stride * 7, -1);
    ctx.stroke();
  }

  // body capsule
  const top = -h;
  const bodyBottom = p.sliding ? 0 : -10;
  const r = Math.min(bw, bodyBottom - top) / 2;
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.roundRect(-bw / 2, top, bw, bodyBottom - top, r);
  ctx.fill();

  // visor
  ctx.fillStyle = visor;
  const vh = p.sliding ? 6 : 7;
  const vy = top + (p.sliding ? 6 : 9);
  ctx.beginPath();
  ctx.roundRect(bw / 2 - (p.sliding ? 16 : 14), vy, p.sliding ? 14 : 12, vh, 3);
  ctx.fill();
  ctx.restore();
}
