import { gsap, prefersReducedMotion } from './motion';

/**
 * One shared ticker drives every flame on the page.
 * Each flame gets its own seed and speed, and its motion is a sum of
 * incommensurate sine waves plus a rare "gust", which reads as organic
 * flicker without ever visibly repeating.
 */
const flames = new Set();
let started = false;
let observer = null;

function noise(t, s) {
  return (
    Math.sin(t * 1.93 + s) * 0.5 +
    Math.sin(t * 3.71 + s * 1.7) * 0.3 +
    Math.sin(t * 8.9 + s * 2.3) * 0.2
  );
}

function apply(f, time) {
  const t = time * f.speed + f.seed;
  const still = f.reduced;
  const n1 = still ? 0 : noise(t, f.seed);
  const n2 = still ? 0 : Math.sin(t * 1.27 + 2.1) * 0.6 + Math.sin(t * 5.3 + f.seed) * 0.4;
  const n3 = still ? 0 : Math.sin(t * 2.31 + 4) * 0.5 + Math.sin(t * 11.7 + f.seed) * 0.25 + Math.sin(t * 17.3) * 0.25;
  const gust = still ? 0 : Math.pow(Math.max(0, Math.sin(t * 0.41 + f.seed * 3)), 10);

  const p = f.power;
  const b = f.boost;
  const sy = p * (1 + n1 * 0.075 + gust * 0.14 + b * 0.55);
  const sx = p * (1 - n1 * 0.035 + n3 * 0.018 + b * 0.18);
  const skew = n2 * 3.4 + gust * 7 * f.lean;
  const dx = n2 * 0.5 * f.scale;

  f.flame.style.transform = `translate3d(${dx.toFixed(2)}px,0,0) skewX(${skew.toFixed(2)}deg) scale(${Math.max(0, sx).toFixed(4)},${Math.max(0, sy).toFixed(4)})`;

  const light = p * (0.84 + n3 * 0.08 + n1 * 0.06 - gust * 0.12 + b * 0.6);
  if (f.glow) {
    f.glow.style.opacity = Math.max(0, Math.min(1, light)).toFixed(3);
    f.glow.style.transform = `translate(-50%,-50%) scale(${(0.9 + p * 0.1 + n3 * 0.025 + b * 0.25).toFixed(4)})`;
  }
  if (f.cast) f.cast.style.opacity = Math.max(0, Math.min(1, light * 0.95)).toFixed(3);
  if (f.lit) f.lit.style.opacity = Math.max(0, Math.min(1, light)).toFixed(3);
}

function tick(time) {
  for (const f of flames) {
    if (!f.visible) continue;
    // an unlit lamp looks the same every frame: write its styles once, then skip
    const dark = f.power <= 0 && f.boost <= 0;
    if (dark && f.idle && !f.dirty) continue;
    if (f.reduced && !f.dirty) continue;
    apply(f, time);
    f.dirty = false;
    f.idle = dark;
  }
}

function ensureStarted() {
  if (started) return;
  started = true;
  gsap.ticker.add(tick);
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const f = e.target.__flame;
        if (f) f.visible = e.isIntersecting;
      }
    },
    { rootMargin: '200px' }
  );
}

export function registerFlame({ root, flame, glow, cast, lit, scale = 1, power = 0 }) {
  ensureStarted();
  const f = {
    root,
    flame,
    glow,
    cast,
    lit,
    scale,
    power,
    boost: 0,
    seed: Math.random() * 100,
    speed: 0.85 + Math.random() * 0.4,
    lean: Math.random() > 0.5 ? 1 : -1,
    visible: true,
    reduced: prefersReducedMotion(),
    dirty: true,
  };
  root.__flame = f;
  flames.add(f);
  observer.observe(root);
  apply(f, gsap.ticker.time);
  return f;
}

export function unregisterFlame(f) {
  if (!f) return;
  flames.delete(f);
  observer?.unobserve(f.root);
  delete f.root.__flame;
}

/** Mark a flame for redraw (used when tweening power under reduced motion). */
export function touchFlame(f) {
  if (f) f.dirty = true;
}
