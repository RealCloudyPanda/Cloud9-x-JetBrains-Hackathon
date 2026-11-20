import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const FORBIDDEN = [/Math\.random/, /\bDate\b/, /\bperformance\b/, /\bwindow\b/, /\bdocument\b/, /Math\.(sin|cos|tan|sqrt|atan2?|pow|exp|log)\b/, /from '\.\.\//];

describe('sim purity', () => {
  it('src/sim uses no clocks, randomness, DOM, trig or outside imports', () => {
    const dir = join(__dirname, '..', 'src', 'sim');
    const offenders: string[] = [];
    for (const file of readdirSync(dir)) {
      const text = readFileSync(join(dir, file), 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
      for (const re of FORBIDDEN) if (re.test(text)) offenders.push(`${file}: ${re}`);
    }
    expect(offenders).toEqual([]);
  });
});
