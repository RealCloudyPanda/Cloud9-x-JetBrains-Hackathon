import { OPERATOR_ITEMS } from './screens/operator';
import type { Press } from './input';

export type OperatorItemId = (typeof OPERATOR_ITEMS)[number]['id'];

export class OperatorMenu {
  focus = 0;
  confirm = false;

  get focused(): OperatorItemId {
    return OPERATOR_ITEMS[this.focus].id;
  }

  reset(): void {
    this.focus = 0;
    this.confirm = false;
  }

  press(p: Press): OperatorItemId | null {
    if (p.code === 'Escape') return 'close';
    let chosen: OperatorItemId | null = null;
    if (p.code === 'ArrowDown') this.move(1);
    else if (p.code === 'ArrowUp') this.move(-1);
    else if (p.code === 'Enter' || p.code === 'Space') chosen = this.choose();
    if (this.focused !== 'newday') this.confirm = false;
    return chosen;
  }

  private move(step: 1 | -1): void {
    const n = OPERATOR_ITEMS.length;
    this.focus = (this.focus + step + n) % n;
  }

  private choose(): OperatorItemId | null {
    const id = this.focused;
    if (id !== 'newday') return id;
    if (!this.confirm) {
      this.confirm = true;
      return null;
    }
    this.confirm = false;
    return id;
  }
}
