import { cycleLetter } from '../booth/initials';
import { MASK_SLIDE } from '../sim/tuning';
import type { Press } from './input';

const ADVANCE_CODES = new Set(['Space', 'ArrowRight', 'Enter', 'NumpadEnter', 'Mouse0']);
const LAST_SLOT = 2;

export type InitialsOutcome = 'submit' | null;

export class InitialsEntry {
  letters = ['A', 'A', 'A'];
  slot = 0;
  private slideUsed = false;

  get text(): string {
    return this.letters.join('');
  }

  reset(): void {
    this.letters = ['A', 'A', 'A'];
    this.slot = 0;
    this.slideUsed = false;
  }

  press(p: Press): InitialsOutcome {
    if (p.kind === 'slide-release') {
      if (!this.slideUsed && p.code !== 'Mouse2') this.cycle(1);
      this.slideUsed = false;
      return null;
    }
    if (p.kind === 'slide') {
      this.slideUsed = false;
      if (p.code === 'Mouse2') this.cycle(1);
      return null;
    }
    const twoButtonConfirm = p.kind === 'jump' && (p.mask & MASK_SLIDE) !== 0;
    if (twoButtonConfirm) this.slideUsed = true;
    if (twoButtonConfirm || ADVANCE_CODES.has(p.code)) return this.advance();
    if (p.code === 'ArrowUp' || p.code === 'KeyW') this.cycle(-1);
    else if (p.code === 'ArrowLeft' || p.code === 'Backspace') this.slot = Math.max(0, this.slot - 1);
    else if (/^Key[A-Z]$/.test(p.code)) {
      this.letters[this.slot] = p.code.slice(3);
      if (this.slot < LAST_SLOT) this.slot++;
    }
    return null;
  }

  private advance(): InitialsOutcome {
    if (this.slot < LAST_SLOT) {
      this.slot++;
      return null;
    }
    return 'submit';
  }

  private cycle(step: 1 | -1): void {
    this.letters[this.slot] = cycleLetter(this.letters[this.slot], step);
  }
}
