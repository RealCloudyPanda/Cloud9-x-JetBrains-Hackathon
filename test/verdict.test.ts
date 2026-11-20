import { describe, it, expect } from 'vitest';
import { verdict, verdictText } from '../src/booth/verdict';
import { cleanInitials, cycleLetter } from '../src/booth/initials';

const rival = { initials: 'ABC', splits: [300, 600, 900, 1200, 1500, 1800], finishTick: 1800, dnf: false };

describe('verdict', () => {
  it('DNF names the gate it ran out before', () => {
    const v = verdict({ splits: [300, 650, 1100, -1, -1, -1], finishTick: 3600, dnf: true }, rival);
    expect(v.kind).toBe('dnf');
    expect(verdictText(v.parts)).toBe('Time ran out before Gate 4. The course is still there for you.');
  });

  it('a win names the margin and the biggest gain', () => {
    const v = verdict({ splits: [290, 590, 852, 1150, 1450, 1724], finishTick: 1724, dnf: false }, rival);
    expect(v.kind).toBe('win');
    expect(verdictText(v.parts)).toBe('You beat ABC by 1.27 s. Biggest gain: Gate 3 (−0.63 s). Your ghost runs next.');
  });

  it('a loss names the worst segment and its cause', () => {
    const v = verdict(
      { splits: [300, 600, 925, 1225, 1525, 1825], finishTick: 1825, dnf: false, hitKinds: [[], [], ['beam', 'beam', 'hurdle'], [], [], []] },
      rival,
    );
    expect(v.kind).toBe('loss');
    expect(verdictText(v.parts)).toBe('You lost 0.42 s at Gate 3: 2 hits on the Switch Beam.');
  });

  it('a clean loss blames the line, not a hit', () => {
    const v = verdict({ splits: [300, 600, 900, 1230, 1530, 1830], finishTick: 1830, dnf: false, hitKinds: [[], [], [], [], [], []] }, rival);
    expect(verdictText(v.parts)).toBe('You lost 0.50 s at Gate 4: slower line through the Pits.');
  });

  it('within 0.02 s is a dead heat', () => {
    const v = verdict({ splits: [301, 600, 900, 1200, 1500, 1801], finishTick: 1801, dnf: false }, rival);
    expect(v.kind).toBe('tie');
    expect(verdictText(v.parts)).toBe('Dead heat with ABC. Settle it.');
  });
});

describe('initials', () => {
  it('blocks a few words and pads short input', () => {
    expect(cleanInitials('abc')).toBe('ABC');
    expect(cleanInitials('ASS')).toBe('???');
    expect(cleanInitials('AB')).toBe('???');
  });
  it('cycles letters both ways', () => {
    expect(cycleLetter('A', -1)).toBe('Z');
    expect(cycleLetter('Z', 1)).toBe('A');
  });
});
