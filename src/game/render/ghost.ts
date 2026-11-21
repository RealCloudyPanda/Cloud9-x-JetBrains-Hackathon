import { drawRunner, type RunnerPose } from './runner';
import { C } from './theme';

const TRAIL = 6;

export class GhostDrawer {
  private trail: { sx: number; y: number; sliding: boolean }[] = [];

  reset(): void {
    this.trail.length = 0;
  }

  draw(ctx: CanvasRenderingContext2D, pose: RunnerPose, worldX: number, camX: number, label: string | null): void {
    this.trail.unshift({ sx: worldX, y: pose.y, sliding: pose.sliding });
    if (this.trail.length > TRAIL) this.trail.length = TRAIL;

    ctx.save();
    for (let i = this.trail.length - 1; i >= 1; i--) {
      const t = this.trail[i];
      const h = t.sliding ? 22 : 48;
      const w = t.sliding ? 44 : 28;
      ctx.globalAlpha = 0.16 * (1 - i / TRAIL);
      ctx.fillStyle = C.cyan;
      const sx = t.sx - camX - i * 3;
      for (let yy = 0; yy < h; yy += 4) ctx.fillRect(sx, 600 - t.y - h + yy, w, 2);
    }
    ctx.globalAlpha = 0.45;
    drawRunner(ctx, pose, C.cyan, C.ink);
    ctx.restore();

    if (label) {
      const h = pose.sliding ? 22 : 48;
      const x = pose.sx + 14;
      const y = 600 - pose.y - h - 16;
      ctx.save();
      ctx.font = '600 15px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = C.cyan;
      ctx.globalAlpha = 0.9;
      ctx.fillText(label, x, y);
      ctx.restore();
    }
  }
}
