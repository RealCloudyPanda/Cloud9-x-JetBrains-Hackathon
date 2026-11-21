import { TIMERS, type Clock } from './timers';

export type BoothState = 'attract' | 'countdown' | 'run' | 'results' | 'initials' | 'submitted' | 'operator';

export interface BoothHooks {
  enter?(state: BoothState, from: BoothState): void;
  autoSubmit?(): void;
}

export class Booth {
  state: BoothState = 'attract';
  enteredAt: number;
  lastInputAt: number;
  champion = false;

  constructor(private clock: Clock, private hooks: BoothHooks = {}) {
    this.enteredAt = clock();
    this.lastInputAt = this.enteredAt;
  }

  private go(next: BoothState): void {
    const from = this.state;
    this.state = next;
    this.enteredAt = this.clock();
    this.lastInputAt = this.enteredAt;
    this.hooks.enter?.(next, from);
  }

  get elapsed(): number {
    return this.clock() - this.enteredAt;
  }

  press(opts: { champion?: boolean } = {}): boolean {
    this.lastInputAt = this.clock();
    switch (this.state) {
      case 'attract':
        this.champion = !!opts.champion;
        this.go('countdown');
        return true;
      case 'results':
        if (this.elapsed >= TIMERS.resultsGuard) {
          this.go('initials');
          return true;
        }
        return false;
      default:
        return false;
    }
  }

  touch(): void {
    this.lastInputAt = this.clock();
  }

  runFinished(): void {
    if (this.state === 'run') this.go('results');
  }

  initialsDone(): void {
    if (this.state === 'initials') this.go('submitted');
  }

  hidden(): void {
    if (this.state !== 'attract') this.go('attract');
  }

  openOperator(): void {
    if (this.state === 'run' || this.state === 'countdown' || this.state === 'operator') return;
    this.go('operator');
  }

  closeOperator(): void {
    if (this.state === 'operator') this.go('attract');
  }

  update(): void {
    const now = this.clock();
    const idle = now - this.lastInputAt;
    const t = now - this.enteredAt;
    switch (this.state) {
      case 'countdown':
        if (t >= TIMERS.countdown) this.go('run');
        break;
      case 'results':
        if (t >= TIMERS.resultsAuto || idle >= TIMERS.idle) this.go('initials');
        break;
      case 'initials':
        if (idle >= TIMERS.initialsIdle) {
          this.hooks.autoSubmit?.();
          if (this.state === 'initials') this.go('submitted');
        }
        break;
      case 'submitted':
        if (t >= TIMERS.submitted) this.go('attract');
        break;
      case 'operator':
        if (idle >= TIMERS.idle) this.go('attract');
        break;
      default:
        break;
    }
  }
}
