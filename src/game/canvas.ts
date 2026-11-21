export const W = 1280;
export const H = 720;
export const GROUND_Y = 600;

export function setupCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d', { alpha: false })!;
  const fit = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const scale = Math.min(window.innerWidth / W, window.innerHeight / H);
    const cssW = Math.floor(W * scale);
    const cssH = Math.floor(H * scale);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  };
  fit();
  window.addEventListener('resize', fit);
  return ctx;
}
