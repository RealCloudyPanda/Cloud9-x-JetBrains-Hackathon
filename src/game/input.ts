import { MASK_JUMP, MASK_SLIDE } from '../sim/tuning';

const JUMP_KEYS = new Set(['ArrowUp', 'KeyW', 'Space']);
const SLIDE_KEYS = new Set(['ArrowDown', 'KeyS']);
const MODIFIERS = /^(Alt|Control|Meta|Shift)(Left|Right)$/;

export type PressKind = 'jump' | 'slide' | 'left' | 'right' | 'confirm' | 'other';

export interface Press {
  kind: PressKind;
  code: string;
  ctrl: boolean;
  shift: boolean;
  mask: number;
}

/**
 * Keyboard and mouse → a live mask. The loop snapshots `mask` once per Tick; nothing
 * here touches the sim. Discrete presses are queued for menu screens.
 */
export class Input {
  private keys = new Set<string>();
  private buttons = 0;
  private queue: Press[] = [];
  /** Called synchronously on any press (used to unlock audio inside the gesture). */
  onAnyPress: (() => void) | null = null;
  onBlur: (() => void) | null = null;

  constructor(target: HTMLElement) {
    window.addEventListener('keydown', (e) => {
      if (JUMP_KEYS.has(e.code) || SLIDE_KEYS.has(e.code) || e.code.startsWith('Arrow')) e.preventDefault();
      if (e.repeat || MODIFIERS.test(e.code)) return;
      this.keys.add(e.code);
      this.push(this.kindOf(e.code), e.code, e.ctrlKey || e.metaKey, e.shiftKey);
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => {
      this.keys.clear();
      this.buttons = 0;
      this.queue = [];
      this.onBlur?.();
    });
    target.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.buttons |= e.button === 2 ? MASK_SLIDE : MASK_JUMP;
      this.push(e.button === 2 ? 'slide' : 'jump', `Mouse${e.button}`, false, false);
    });
    window.addEventListener('mouseup', (e) => {
      this.buttons &= ~(e.button === 2 ? MASK_SLIDE : MASK_JUMP);
    });
    target.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private kindOf(code: string): PressKind {
    if (JUMP_KEYS.has(code)) return 'jump';
    if (SLIDE_KEYS.has(code)) return 'slide';
    if (code === 'ArrowLeft' || code === 'KeyA') return 'left';
    if (code === 'ArrowRight' || code === 'KeyD') return 'right';
    if (code === 'Enter' || code === 'NumpadEnter') return 'confirm';
    return 'other';
  }

  private push(kind: PressKind, code: string, ctrl: boolean, shift: boolean): void {
    this.queue.push({ kind, code, ctrl, shift, mask: this.mask });
    if (this.queue.length > 32) this.queue.shift();
    this.onAnyPress?.();
  }

  get mask(): number {
    let m = this.buttons;
    for (const k of this.keys) {
      if (JUMP_KEYS.has(k)) m |= MASK_JUMP;
      else if (SLIDE_KEYS.has(k)) m |= MASK_SLIDE;
    }
    return m;
  }

  /** Drain queued presses. */
  presses(): Press[] {
    const q = this.queue;
    this.queue = [];
    return q;
  }

  clear(): void {
    this.queue = [];
  }
}
