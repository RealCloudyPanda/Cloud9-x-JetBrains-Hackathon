import { expect, it } from 'vitest';
import { MemoryKV } from '../src/booth/memoryKv';
import { SessionKV } from '../src/booth/sessionKv';
import { META_KEY } from '../src/booth/storage';

it('keeps the relay and initials in memory after storage starts rejecting writes', () => {
  const backing = new MemoryKV();
  backing.setItem(META_KEY, 'saved');
  const store = new SessionKV(backing);
  expect(store.persistent).toBe(true);
  backing.setItem = () => { throw new Error('QuotaExceededError'); };
  store.setItem(META_KEY, 'finished');
  store.setItem(META_KEY, 'initials');
  expect(store.getItem(META_KEY)).toBe('initials');
  expect(store.persistent).toBe(false);
  expect(backing.getItem(META_KEY)).toBe('saved');
});
it('starts in session mode when access is denied', () => {
  const store = new SessionKV(null);
  store.setItem(META_KEY, 'next');
  expect(store.getItem(META_KEY)).toBe('next');
  expect(store.persistent).toBe(false);
});
