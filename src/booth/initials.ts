export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const BLOCKED = new Set(['ASS', 'FUK', 'FUC', 'FCK', 'SEX', 'KKK', 'NIG', 'FAG', 'CUM', 'TIT', 'DIK', 'DIC', 'COK', 'JEW', 'NAZ', 'SHT', 'WTF', 'GAY', 'HOE', 'PUS', 'VAG', 'ANL', 'RAP']);

export function cleanInitials(text: string): string {
  const up = text.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
  if (up.length !== 3 || BLOCKED.has(up)) return '???';
  return up;
}

export function cycleLetter(letter: string, dir: 1 | -1): string {
  const i = ALPHABET.indexOf(letter);
  return ALPHABET[(i + dir + ALPHABET.length) % ALPHABET.length];
}
