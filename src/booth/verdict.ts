import { obstacleName } from '../sim/obstacles';
import { segmentDeltas } from '../sim/splits';

export interface VerdictPart {
  text: string;
  strong?: boolean;
}

export interface VerdictRun {
  splits: number[];
  finishTick: number;
  dnf: boolean;
  hitKinds?: string[][];
}

export type VerdictKind = 'dnf' | 'tie' | 'win' | 'loss';

const SEGMENT_LINE = ['the warm-up', 'the Double Hurdles', 'the Switch Beams', 'the Pits', 'the mixed section', 'the final sprint'];

/** Ties within 0.02 s (one Tick) are a dead heat. */
export const TIE_TICKS = 1;

function gateName(i: number, count: number): string {
  return i === count - 1 ? 'the Finish' : `Gate ${i + 1}`;
}

function secs(ticks: number): string {
  return (Math.abs(ticks) / 60).toFixed(2);
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/** The one-sentence Verdict shown on Results (SPEC §6.4). */
export function verdict(player: VerdictRun, rival: VerdictRun & { initials: string }): { kind: VerdictKind; parts: VerdictPart[] } {
  const n = player.splits.length;
  if (player.dnf) {
    const missed = player.splits.findIndex((s) => s < 0);
    return {
      kind: 'dnf',
      parts: [{ text: `Time ran out before ${gateName(missed < 0 ? n - 1 : missed, n)}. The course is still there for you.` }],
    };
  }
  const diff = rival.dnf ? -Infinity : player.finishTick - rival.finishTick;
  if (Math.abs(diff) <= TIE_TICKS) {
    return { kind: 'tie', parts: [{ text: 'Dead heat with ' }, { text: rival.initials, strong: true }, { text: '. Settle it.' }] };
  }
  const deltas = segmentDeltas(player.splits, rival.splits);
  if (diff < 0) {
    let best = -1;
    deltas.forEach((d, i) => {
      if (d !== null && (best < 0 || d < (deltas[best] ?? 0))) best = i;
    });
    const by = rival.dnf ? '' : ` by ${secs(diff)} s`;
    const parts: VerdictPart[] = [{ text: 'You beat ' }, { text: rival.initials, strong: true }, { text: `${by}.` }];
    if (best >= 0 && (deltas[best] ?? 0) < 0) {
      parts.push({ text: ' Biggest gain: ' }, { text: `${gateName(best, n)} (−${secs(deltas[best]!)} s)`, strong: true }, { text: '.' });
    }
    parts.push({ text: ' Your ghost runs next.' });
    return { kind: 'win', parts };
  }
  let worst = 0;
  deltas.forEach((d, i) => {
    if (d !== null && d > (deltas[worst] ?? -Infinity)) worst = i;
  });
  const lost = deltas[worst] ?? diff;
  const kinds = player.hitKinds?.[worst] ?? [];
  let cause: string;
  if (kinds.length) {
    const counts = new Map<string, number>();
    for (const k of kinds) counts.set(k, (counts.get(k) ?? 0) + 1);
    const [kind, count] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    cause = `${plural(count, 'hit')} on the ${obstacleName(kind)}`;
  } else {
    cause = `slower line through ${SEGMENT_LINE[worst] ?? 'that stretch'}`;
  }
  return {
    kind: 'loss',
    parts: [{ text: 'You lost ' }, { text: `${secs(lost)} s at ${gateName(worst, n)}`, strong: true }, { text: `: ${cause}.` }],
  };
}

export function verdictText(parts: VerdictPart[]): string {
  return parts.map((p) => p.text).join('');
}
