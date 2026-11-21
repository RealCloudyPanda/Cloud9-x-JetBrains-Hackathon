import { expect, it } from 'vitest';
import { operatorStatus } from '../src/game/screens/operator';
import { DEFAULT_SETTINGS } from '../src/booth/storage';

it('announces selected operator values and destructive confirmation', () => {
  expect(operatorStatus(DEFAULT_SETTINGS, 0, false)).toContain('1 of 6 · Start new day');
  expect(operatorStatus(DEFAULT_SETTINGS, 0, true)).toContain('Press Enter again to clear today');
  expect(operatorStatus({ ...DEFAULT_SETTINGS, sound: false }, 1, false)).toContain('Sound · OFF');
  expect(operatorStatus({ ...DEFAULT_SETTINGS, sound: true }, 1, false)).toContain('Sound · ON');
  expect(operatorStatus(DEFAULT_SETTINGS, 5, false)).toContain('Close');
});
