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
import { MemoryKV } from './booth/memoryKv';

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
    /* fonts are optional */
  }
  const scene = params.get('scene');
  const app = new App(ctx, input, scene ? new MemoryKV() : window.localStorage, () => performance.now(), !scene);
  app.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  app.applySettings();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) app.booth.hidden();
  });
  window.addEventListener('pagehide', () => app.booth.hidden());
  if (scene) applyScene(app, scene);
  startLoop({ tick: () => (app.frozenNow === null ? app.tick() : undefined), frame: (a, dt) => app.frame(a, dt) });
}
void boot();
