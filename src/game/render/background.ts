import { W, GROUND_Y } from '../canvas';
import { C } from './theme';

/** Ink sky, stage lights and a perspective floor grid that scrolls with the camera. */
export function drawBackground(ctx: CanvasRenderingContext2D, camX: number, flow: number): void {
  ctx.fillStyle = C.ink;
  ctx.fillRect(0, 0, W, 720);
  // stage light cones
  for (let i = 0; i < 4; i++) {
    const x = ((i * 420 - camX * 0.15) % 1680 + 1680) % 1680 - 200;
    const g = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    g.addColorStop(0, 'oklch(0.85 0.06 230 / 0.07)');
    g.addColorStop(1, 'oklch(0.85 0.06 230 / 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 40, 0);
    ctx.lineTo(x + 220, GROUND_Y);
    ctx.lineTo(x - 140, GROUND_Y);
    ctx.fill();
  }
  // distant skyline bars (parallax)
  ctx.fillStyle = 'oklch(0.20 0.025 250)';
  for (let i = 0; i < 16; i++) {
    const bx = ((i * 97 - camX * 0.3) % 1552 + 1552) % 1552 - 120;
    const h = 60 + ((i * 53) % 140);
    ctx.fillRect(bx, GROUND_Y - h, 70, h);
  }
  // floor grid
  ctx.strokeStyle = C.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  const depth = 120;
  for (let k = 1; k <= 6; k++) {
    const y = GROUND_Y + (depth * k * k) / 36;
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
  }
  const spacing = 80;
  const off = ((camX % spacing) + spacing) % spacing;
  for (let x = -spacing * 8; x < W + spacing * 8; x += spacing) {
    const sx = x - off;
    const vx = W / 2 + (sx - W / 2) * 3.2;
    ctx.moveTo(sx, GROUND_Y);
    ctx.lineTo(vx, GROUND_Y + depth);
  }
  ctx.stroke();
  void flow;
}
