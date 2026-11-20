import { GROUND_Y } from '../canvas';
import { C, display, tracked } from './theme';

const CAP = 96;

interface P { x: number; y: number; vx: number; vy: number; life: number; max: number; col: string; size: number }

/** Render-only juice. Fixed-capacity particle pool; never feeds the sim. */
export class Fx {
  private pool: P[] = Array.from({ length: CAP }, () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, col: '', size: 2 }));
  private words: { text: string; x: number; y: number; at: number; col: string }[] = [];
  private rings: { x: number; y: number; at: number }[] = [];
  shakeUntil = 0;
  shakeAmp = 0;
  stretchAt = -1e9;
  squashAt = -1e9;
  flashAt = -1e9;
  shakeEnabled = true;

  burst(x: number, y: number, n: number, col: string, speed: number): void {
    for (const p of this.pool) {
      if (n <= 0) break;
      if (p.life > 0) continue;
      const a = Math.random() * Math.PI - Math.PI;
      const s = speed * (0.4 + Math.random() * 0.6);
      Object.assign(p, { x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, max: 0.4 + Math.random() * 0.3, col, size: 2 + Math.random() * 3 });
      n--;
    }
  }

  word(text: string, x: number, y: number, now: number, col: string): void {
    this.words.push({ text, x, y, at: now, col });
    if (this.words.length > 6) this.words.shift();
  }

  ring(x: number, y: number, now: number): void {
    this.rings.push({ x, y, at: now });
    if (this.rings.length > 6) this.rings.shift();
  }

  shake(now: number, amp: number, ms: number): void {
    if (!this.shakeEnabled) return;
    this.shakeAmp = amp;
    this.shakeUntil = now + ms;
  }

  offset(now: number): [number, number] {
    if (now >= this.shakeUntil) return [0, 0];
    const k = (this.shakeUntil - now) / 120;
    return [(Math.random() * 2 - 1) * this.shakeAmp * k, (Math.random() * 2 - 1) * this.shakeAmp * k];
  }

  /** Vertical scale of the runner from jump stretch / land squash. */
  scaleY(now: number): number {
    const s = (now - this.stretchAt) / 80;
    if (s >= 0 && s < 2) return 1 + 0.15 * (s < 1 ? s : 2 - s);
    const q = (now - this.squashAt) / 120;
    if (q >= 0 && q < 1) return 0.85 + 0.15 * q;
    return 1;
  }

  draw(ctx: CanvasRenderingContext2D, now: number, dt: number, camDx: number): void {
    const step = dt / 1000;
    for (const p of this.pool) {
      if (p.life <= 0) continue;
      p.life -= step / p.max;
      p.x += p.vx * step - camDx;
      p.y += p.vy * step;
      p.vy += 900 * step;
      if (p.y > GROUND_Y) { p.y = GROUND_Y; p.vy *= -0.3; }
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.col;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
    for (const r of this.rings) {
      const a = (now - r.at) / 380;
      if (a < 0 || a > 1) continue;
      r.x -= camDx;
      ctx.strokeStyle = C.lime;
      ctx.globalAlpha = 1 - a;
      ctx.lineWidth = 3 * (1 - a) + 1;
      ctx.beginPath();
      ctx.arc(r.x, r.y, 14 + 60 * (1 - Math.pow(1 - a, 3)), 0, Math.PI * 2);
      ctx.stroke();
    }
    for (const w of this.words) {
      const a = (now - w.at) / 620;
      if (a < 0 || a > 1) continue;
      const s = 0.9 + 0.1 * Math.min(1, (now - w.at) / 220);
      ctx.save();
      ctx.globalAlpha = a < 0.35 ? 1 : 1 - (a - 0.35) / 0.65;
      ctx.translate(w.x, w.y - 30 * a);
      ctx.scale(s, s);
      ctx.font = display(26, 700);
      tracked(ctx, 26);
      ctx.textAlign = 'center';
      ctx.fillStyle = w.col;
      ctx.fillText(w.text, 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.letterSpacing = '0px';
  }
}
