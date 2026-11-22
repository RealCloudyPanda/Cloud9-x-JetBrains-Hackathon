import { expect, it } from 'vitest';
import { OperatorMenu } from '../src/game/operatorMenu';
import type { Press } from '../src/game/input';

const key = (code: string): Press => ({ kind: 'other', code, ctrl: false, shift: false, mask: 0 });

it('needs two confirms before starting a new day', () => {
  const menu = new OperatorMenu();
  expect(menu.press(key('Enter'))).toBeNull();
  expect(menu.confirm).toBe(true);
  expect(menu.press(key('Enter'))).toBe('newday');
  expect(menu.confirm).toBe(false);
});

it('drops a pending confirm when focus moves and wraps around the list', () => {
  const menu = new OperatorMenu();
  menu.press(key('Enter'));
  menu.press(key('ArrowUp'));
  expect(menu.confirm).toBe(false);
  expect(menu.focused).toBe('close');
  expect(menu.press(key('Space'))).toBe('close');
});

it('closes on Escape from any item', () => {
  const menu = new OperatorMenu();
  menu.press(key('ArrowDown'));
  expect(menu.press(key('Escape'))).toBe('close');
});
