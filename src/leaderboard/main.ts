import '@fontsource/chakra-petch/600.css';
import '@fontsource/chakra-petch/700.css';
import '@fontsource/jetbrains-mono/600.css';
import '@fontsource/jetbrains-mono/700.css';
import './style.css';
import { dateKey, loadMeta, loadRuns, topRuns, META_KEY, RUNS_PREFIX } from '../booth/storage';
import { openChannel, type BoardMessage } from '../booth/broadcast';
import { formatDelta, formatTime } from '../sim/splits';

const root = document.getElementById('board')!;
const LABELS = ['G1', 'G2', 'G3', 'G4', 'G5', 'FIN'];
let live: { rival: string; deltas: (number | null)[] } | null = null;
let lastTopId = '';

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}

function gatesHtml(deltas: (number | null)[]): string {
  return `<div class="gates">${LABELS.map((l, i) => {
    const d = deltas[i];
    const cls = d === null || d === undefined ? '' : d < 0 ? 'ahead' : d > 0 ? 'behind' : '';
    return `<div class="gate ${cls}"><small>${l}</small>${d === null || d === undefined ? '·' : formatDelta(d)}</div>`;
  }).join('')}</div>`;
}

function render(): void {
  const meta = loadMeta(localStorage, dateKey(new Date()));
  const runs = loadRuns(localStorage, meta.currentDay);
  const top = topRuns(runs, 10);
  const last = runs[runs.length - 1];
  const freshId = top[0]?.id !== lastTopId ? top[0]?.id : '';
  lastTopId = top[0]?.id ?? '';
  const rows = top.length
    ? top.map((r, i) => `<li class="row ${i === 0 ? 'first' : ''} ${r.id === freshId ? 'fresh' : ''}"><span class="rank">${i + 1}</span><span class="ini">${esc(r.initials)}</span><span class="t">${formatTime(r.finishTick)}</span></li>`).join('')
    : '<li class="empty">No runs yet. Be the first ghost.</li>';
  let now: string;
  if (live) {
    now = `<section class="panel now"><h2>Now running</h2><div class="vs">CHALLENGER vs <span class="rival">${esc(live.rival)}</span></div>${gatesHtml(live.deltas)}</section>`;
  } else if (last) {
    const verdict = last.dnf ? 'DNF' : last.beatRival ? 'BEAT THEIR GHOST' : 'LOST TO THEIR GHOST';
    now = `<section class="panel now"><h2>Last run</h2><div class="vs">${esc(last.initials)} · ${last.dnf ? 'DNF' : formatTime(last.finishTick)}</div><div class="label">${verdict}</div></section>`;
  } else {
    now = `<section class="panel now"><h2>Last run</h2><div class="label">Waiting for the first player</div></section>`;
  }
  root.innerHTML = `
    <section><h1>Today's top 10</h1><ol>${rows}</ol></section>
    <section>${now}
      <div class="stats">
        <div><div class="label">Relay streak</div><div class="big">${meta.relayStreak}</div></div>
        <div><div class="label">Runs today</div><div class="big" style="color:var(--text)">${runs.length}</div></div>
      </div>
    </section>`;
}

const channel = openChannel();
channel?.addEventListener('message', (e: MessageEvent<BoardMessage>) => {
  const m = e.data;
  if (m.type === 'run-started') live = { rival: m.rivalInitials, deltas: [null, null, null, null, null, null] };
  else if (m.type === 'split' && live) live.deltas[m.gateIndex] = m.delta;
  else if (m.type === 'run-finished' || m.type === 'board-reset') live = null;
  else if (m.type === 'board-changed') live = null;
  render();
});
window.addEventListener('storage', (e) => {
  if (!e.key || e.key === META_KEY || e.key.startsWith(RUNS_PREFIX)) render();
});
document.addEventListener('visibilitychange', () => !document.hidden && render());
setInterval(render, 5000);
render();
