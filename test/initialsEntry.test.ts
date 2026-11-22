import { expect, it } from 'vitest';
import { InitialsEntry } from '../src/game/initialsEntry';
import type { Press, PressKind } from '../src/game/input';
import { MASK_JUMP, MASK_SLIDE } from '../src/sim/tuning';

const press = (kind: PressKind, code: string, mask = 0): Press => ({ kind, code, ctrl: false, shift: false, mask });

it('types letters, advances slots and submits on the last confirm', () => {
  const entry = new InitialsEntry();
  expect(entry.press(press('other', 'KeyJ'))).toBeNull();
  expect(entry.press(press('other', 'KeyB'))).toBeNull();
  expect(entry.slot).toBe(2);
  expect(entry.press(press('confirm', 'Enter'))).toBe('submit');
  expect(entry.text).toBe('JBA');
});

it('cycles letters with two buttons and confirms with both held', () => {
  const entry = new InitialsEntry();
  entry.press(press('slide', 'ArrowDown', MASK_SLIDE));
  entry.press(press('slide-release', 'ArrowDown'));
  expect(entry.letters[0]).toBe('B');
  entry.press(press('jump', 'ArrowUp', MASK_JUMP | MASK_SLIDE));
  entry.press(press('slide-release', 'ArrowDown'));
  expect(entry.slot).toBe(1);
  expect(entry.letters[0]).toBe('B');
});

it('steps back and resets to a fresh entry', () => {
  const entry = new InitialsEntry();
  entry.press(press('other', 'KeyZ'));
  entry.press(press('other', 'Backspace'));
  expect(entry.slot).toBe(0);
  entry.reset();
  expect(entry.text).toBe('AAA');
});
