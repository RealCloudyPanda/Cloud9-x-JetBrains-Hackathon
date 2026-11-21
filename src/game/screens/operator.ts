import { C, display, tracked } from '../render/theme';
import { label } from '../render/ui';
import { W, H } from '../canvas';
import type { Settings } from '../../booth/storage';

export const OPERATOR_ITEMS = [
  { id: 'newday', text: 'Start new day' },
  { id: 'sound', text: 'Sound' },
  { id: 'shake', text: 'Screen shake' },
  { id: 'export', text: 'Export today as JSON' },
  { id: 'house', text: 'Force House Ghost on next run' },
  { id: 'close', text: 'Close' },
] as const;

export function drawOperator(ctx: CanvasRenderingContext2D, s: Settings, focus: number, confirm: boolean, day: string, runs: number): void {
  ctx.fillStyle = 'oklch(0.08 0.02 250 / 0.86)';
  ctx.fillRect(0, 0, W, H);
  const x = 360;
  const w = 560;
  ctx.fillStyle = C.inkRaised;
  ctx.fillRect(x, 110, w, 500);
  ctx.textAlign = 'left';
  label(ctx, 'OPERATOR PANEL', x + 32, 156, C.text, 20);
  label(ctx, `BOARD ${day} · ${runs} RUNS · ↑ ↓ MOVE · ENTER SELECT · ESC CLOSE`, x + 32, 184, C.text3, 12);
  OPERATOR_ITEMS.forEach((item, i) => {
    const y = 220 + i * 62;
    const focused = i === focus;
    if (focused) {
      ctx.strokeStyle = C.lime;
      ctx.lineWidth = 3;
      ctx.strokeRect(x + 24, y, w - 48, 50);
    }
    ctx.font = display(22, 600);
    tracked(ctx, 22);
    ctx.fillStyle = C.text;
    let text: string = item.text;
    if (item.id === 'newday' && confirm) {
      text = 'Press Enter again to clear today';
      ctx.fillStyle = C.orange;
    }
    ctx.fillText(text, x + 44, y + 33);
    ctx.letterSpacing = '0px';
    const val = item.id === 'sound' ? s.sound : item.id === 'shake' ? s.shake : item.id === 'house' ? s.forceHouse : null;
    if (val !== null) {
      ctx.textAlign = 'right';
      label(ctx, val ? 'ON' : 'OFF', x + w - 44, y + 32, val ? C.lime : C.text3, 18);
      ctx.textAlign = 'left';
    }
  });
}

export function operatorStatus(settings: Settings, focus: number, confirm: boolean): string {
  const item = OPERATOR_ITEMS[focus];
  const value = item.id === 'sound' ? settings.sound : item.id === 'shake' ? settings.shake : item.id === 'house' ? settings.forceHouse : null;
  const action = item.id === 'newday' && confirm ? 'Press Enter again to clear today' : item.text;
  return `Operator panel · ${focus + 1} of ${OPERATOR_ITEMS.length} · ${action}${value === null ? '' : value ? ' · ON' : ' · OFF'} · arrows move · Enter selects · Escape closes`;
}
