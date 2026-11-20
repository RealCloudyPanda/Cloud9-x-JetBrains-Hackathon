import { describe, it, expect } from 'vitest';
import { Booth, type BoothState } from '../src/booth/stateMachine';

function setup() {
  let now = 0;
  const entered: BoothState[] = [];
  let autoSubmits = 0;
  const booth = new Booth(() => now, { enter: (s) => entered.push(s), autoSubmit: () => autoSubmits++ });
  const advance = (ms: number, step = 100) => {
    for (let t = 0; t < ms; t += step) {
      now += step;
      booth.update();
    }
  };
  return { booth, advance, entered, autoSubmits: () => autoSubmits };
}

describe('booth state machine', () => {
  it('runs a full Turn and returns to Attract', () => {
    const { booth, advance } = setup();
    booth.press();
    expect(booth.state).toBe('countdown');
    advance(3000);
    expect(booth.state).toBe('run');
    booth.runFinished();
    expect(booth.state).toBe('results');
    advance(8000);
    expect(booth.state).toBe('initials');
    booth.initialsDone();
    advance(2000);
    expect(booth.state).toBe('attract');
  });

  it('Countdown ignores inputs', () => {
    const { booth, advance } = setup();
    booth.press();
    advance(1000);
    expect(booth.press()).toBe(false);
    expect(booth.state).toBe('countdown');
  });

  it('Results ignores presses for a short guard, then any press goes to Initials', () => {
    const { booth, advance } = setup();
    booth.press();
    advance(3000);
    booth.runFinished();
    expect(booth.press()).toBe(false);
    advance(1000);
    expect(booth.press()).toBe(true);
    expect(booth.state).toBe('initials');
  });

  it('Initials submits "???" after 12 s idle', () => {
    const { booth, advance, autoSubmits } = setup();
    booth.press();
    advance(3000);
    booth.runFinished();
    advance(8000);
    advance(12000);
    expect(autoSubmits()).toBe(1);
    advance(2000);
    expect(booth.state).toBe('attract');
  });

  it('every non-Run state returns to Attract within 30 s of silence', () => {
    for (const reach of ['countdown', 'results', 'initials', 'submitted', 'operator'] as const) {
      const { booth, advance } = setup();
      if (reach === 'operator') booth.openOperator();
      else {
        booth.press();
        if (reach !== 'countdown') {
          advance(3000);
          booth.runFinished();
          if (reach !== 'results') advance(8000);
          if (reach === 'submitted') booth.initialsDone();
        }
      }
      expect(booth.state).toBe(reach);
      let waited = 0;
      while (booth.state !== 'attract' && booth.state !== 'run' && waited < 30000) {
        advance(100);
        waited += 100;
      }
      if (booth.state === 'run') booth.hidden();
      expect(booth.state).toBe('attract');
      expect(waited).toBeLessThanOrEqual(30000);
    }
  });

  it('tab hidden during a Run goes to Attract', () => {
    const { booth, advance } = setup();
    booth.press();
    advance(3000);
    booth.hidden();
    expect(booth.state).toBe('attract');
  });

  it('champion start is remembered', () => {
    const { booth } = setup();
    booth.press({ champion: true });
    expect(booth.champion).toBe(true);
  });
});
