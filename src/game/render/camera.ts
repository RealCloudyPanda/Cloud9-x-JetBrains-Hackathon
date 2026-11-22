import { GROUND_Y } from '../canvas';

export const ZOOM = 1.4;

export function applyZoom(ctx: CanvasRenderingContext2D): void {
  ctx.translate(0, GROUND_Y);
  ctx.scale(ZOOM, ZOOM);
  ctx.translate(0, -GROUND_Y);
}
