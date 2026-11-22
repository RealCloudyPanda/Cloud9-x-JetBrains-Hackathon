import type { SimEvent } from '../sim/sim';
import type { Synth } from '../audio/synth';
import type { Fx } from './render/fx';
import { GROUND_Y } from './canvas';
import { C } from './render/theme';

export interface RunnerAnchor {
  x: number;
  y: number;
  now: number;
}

export class RunEffects {
  constructor(private fx: Fx, private synth: Synth) {}

  play(e: SimEvent, at: RunnerAnchor): void {
    const { fx, synth } = this;
    const { x, y, now } = at;
    switch (e.type) {
      case 'jump':
        fx.stretchAt = now;
        synth.play('jump');
        break;
      case 'land':
        fx.squashAt = now;
        fx.burst(x + 14, GROUND_Y - 2, 4, C.text2, 160);
        synth.play('land');
        break;
      case 'slide':
        fx.burst(x + 30, GROUND_Y - 2, 6, C.text2, 220);
        synth.play('slide');
        break;
      case 'perfect':
        fx.word('PERFECT', x + 14, y - 70, now, C.lime);
        fx.ring(x + 14, y - 24, now);
        fx.burst(x + 14, y - 24, 14, C.lime, 380);
        synth.play('perfect');
        break;
      case 'hit':
        fx.shake(now, 6, 120);
        fx.flashAt = now;
        fx.burst(x + 28, y - 24, 12, C.orange, 320);
        synth.play('hit');
        break;
      case 'gate':
        synth.play('gate');
        break;
      default:
        break;
    }
  }
}
