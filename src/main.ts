import '@fontsource/chakra-petch/600.css';
import '@fontsource/chakra-petch/700.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/600.css';
import '@fontsource/jetbrains-mono/700.css';
import { setupCanvas } from './game/canvas';
import { Input } from './game/input';
import { startLoop } from './game/loop';
import { App } from './game/app';
import { applyScene } from './game/scenes';
import { saveBoothStatus } from './booth/broadcast';
import { browserStorage } from './booth/sessionKv';
import { MemoryKV } from './booth/memoryKv';
import { operatorStatus } from './game/screens/operator';

const params = new URLSearchParams(location.search);
const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = setupCanvas(canvas);
const input = new Input(canvas);

if (params.get('booth') === '1') {
  document.body.classList.add('booth');
  window.addEventListener('keydown', (e) => {
    if (e.key === 'F5' || (e.ctrlKey && ['r', 'w', 'l', 'p', 's'].includes(e.key.toLowerCase()) && !e.shiftKey)) e.preventDefault();
  });
  window.addEventListener('beforeunload', (e) => e.preventDefault());
}

async function boot(): Promise<void> {
  try {
    await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);
  } catch {
  }
  const scene = params.get('scene');
  const store = scene ? new MemoryKV() : browserStorage();
  const app = new App(ctx, input, store, () => performance.now(), !scene);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  app.reducedMotion = motion.matches;
  motion.addEventListener('change', () => { app.reducedMotion = motion.matches; app.applySettings(); });
  app.applySettings();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) app.booth.hidden();
  });
  window.addEventListener('pagehide', () => app.booth.hidden());
  if (!scene) setInterval(() => saveBoothStatus(store, { state: document.hidden ? 'hidden' : app.booth.state, day: app.meta.currentDay, updatedAt: Date.now(), persistent: app.persistent }), 1000);
  document.getElementById('operator')?.addEventListener('click', () => {
    app.booth.openOperator();
    if (app.booth.state === 'operator') canvas.focus({ preventScroll: true });
  });
  const status = document.getElementById('game-status')!;
  const storage = document.getElementById('storage-status')!;
  let previous = '';
  const announce = () => {
    const state = app.booth.state;
    const next = state === 'attract' ? `Ready · ${app.rival.kind === 'house' ? 'Starter house ghost' : 'Last player'} ${app.rival.record.initials}`
      : state === 'submitted' ? `Relay handed to ${app.result?.record.initials}. Next player races your ghost.`
      : state === 'initials' ? `Sign your ghost · ${app.initials.text} · letter ${app.initials.slot + 1}`
      : state === 'results' ? app.result?.verdict.map(p => p.text).join('') ?? 'Results'
      : state === 'operator' ? operatorStatus(app.meta.settings, app.operator.focus, app.operator.confirm)
      : state === 'countdown' ? 'Get ready · lime is YOU · cyan is your rival' : 'Running · lime is YOU';
    if (next !== previous) { status.textContent = next; previous = next; }
    storage.textContent = app.persistent ? '' : 'SESSION ONLY · runs survive here until this tab closes. Export in Operator. Spectator sync unavailable.';
  };
  if (scene) applyScene(app, scene);
  startLoop({ tick: () => (app.frozenNow === null ? (app.tick(), announce()) : undefined), frame: (a, dt) => app.frame(a, dt) });
}
void boot();
