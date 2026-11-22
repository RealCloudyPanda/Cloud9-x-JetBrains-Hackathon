import { W } from '../canvas';

const FLOW_THRESHOLD = 1050;

export function drawSpeedLines(ctx: CanvasRenderingContext2D, flow: number, camX: number): void {
  if (flow <= FLOW_THRESHOLD) return;
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
