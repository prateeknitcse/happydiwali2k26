import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { prefersReducedMotion } from '../lib/motion';

function makeSprite(rgb) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,252,236,1)');
  grd.addColorStop(0.18, `rgba(${rgb},0.9)`);
  grd.addColorStop(0.45, `rgba(${rgb},0.25)`);
  grd.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  return c;
}

/**
 * Golden dust and rising embers on a single canvas.
 * Particles drift with depth-based parallax and part around the cursor.
 * `ref.burst(x, y, count)` spawns a celebratory spray (coords in CSS px, relative to the canvas).
 */
const ParticleField = forwardRef(function ParticleField(
  { density = 9000, max = 160, interactive = true, rise = 1, className = '', warmth = 'gold' },
  ref
) {
  const canvasRef = useRef(null);
  const api = useRef({ burst: () => {} });

  useImperativeHandle(ref, () => ({ burst: (...a) => api.current.burst(...a) }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reduced = prefersReducedMotion();
    const sprites = [
      makeSprite(warmth === 'gold' ? '255,206,110' : '255,170,80'),
      makeSprite('255,150,60'),
      makeSprite('255,230,170'),
    ];

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let running = false;
    let visible = false;
    let last = performance.now();
    const pointer = { x: -9999, y: -9999, cx: 0, cy: 0, dirty: false, active: false, vx: 0, vy: 0 };
    let ambient = [];
    let bursts = [];

    const spawn = (p, anywhere) => {
      const depth = 0.25 + Math.random() * 0.75;
      p.x = Math.random() * w;
      p.y = anywhere ? Math.random() * h : h + 10 + Math.random() * 40;
      p.depth = depth;
      p.size = (1.2 + Math.random() * 3.2) * depth;
      p.vx = 0;
      p.vy = 0;
      p.drift = (0.06 + Math.random() * 0.22) * depth * rise;
      p.phase = Math.random() * Math.PI * 2;
      p.freq = 0.3 + Math.random() * 0.7;
      p.alpha = 0.25 + Math.random() * 0.6;
      p.tw = 0.6 + Math.random() * 2.2;
      p.sprite = sprites[(Math.random() * 3) | 0];
      return p;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rectAt = -1e9;
      const target = Math.min(max, Math.round((w * h) / density) * (reduced ? 0.5 : 1));
      while (ambient.length < target) ambient.push(spawn({}, true));
      ambient.length = target;
      if (reduced) draw(0, 0);
    };

    const draw = (dt, t) => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      const R = 150;
      // frame-rate independent easing, so motion is identical at 60 Hz and 120 Hz
      const ease = 1 - Math.pow(0.98, dt);
      for (const p of ambient) {
        if (dt) {
          // gentle buoyancy + sway
          p.vy += (-p.drift - p.vy) * ease;
          p.vx += (Math.sin(t * p.freq + p.phase) * 0.12 * p.depth - p.vx) * ease;
          if (interactive && pointer.active) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < R * R) {
              const d = Math.sqrt(d2) || 1;
              const f = (1 - d / R) ** 2 * 0.9 * p.depth;
              p.vx += (dx / d) * f + (-dy / d) * f * 0.6 + pointer.vx * 0.02 * f;
              p.vy += (dy / d) * f + (dx / d) * f * 0.6 + pointer.vy * 0.02 * f;
            }
          }
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.y < -20 || p.x < -40 || p.x > w + 40) spawn(p, false);
          if (p.y > h + 60) p.y = -10;
        }
        const tw = 0.55 + 0.45 * Math.sin(t * p.tw + p.phase);
        ctx.globalAlpha = p.alpha * tw;
        const s = p.size * 6;
        ctx.drawImage(p.sprite, p.x - s / 2, p.y - s / 2, s, s);
      }

      const bdrag = Math.pow(0.975, dt);
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.life -= b.decay * dt;
        if (b.life <= 0) {
          bursts[i] = bursts[bursts.length - 1];
          bursts.pop();
          continue;
        }
        b.vx *= bdrag;
        b.vy = b.vy * bdrag - 0.012 * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        ctx.globalAlpha = Math.min(1, b.life * 1.4);
        const s = b.size * 6 * (0.5 + b.life * 0.5);
        ctx.drawImage(b.sprite, b.x - s / 2, b.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };

    // Canvas position in page coordinates. Reading layout on every pointermove
    // can force a synchronous reflow, so it is cached and refreshed sparingly.
    let pageLeft = 0;
    let pageTop = 0;
    let rectAt = -1e9;
    const measure = (now) => {
      const rect = canvas.getBoundingClientRect();
      pageLeft = rect.left + window.scrollX;
      pageTop = rect.top + window.scrollY;
      rectAt = now;
    };

    const updatePointer = (now) => {
      if (!pointer.dirty) return;
      pointer.dirty = false;
      if (now - rectAt > 500) measure(now);
      const x = pointer.cx + window.scrollX - pageLeft;
      const y = pointer.cy + window.scrollY - pageTop;
      if (pointer.active) {
        pointer.vx = x - pointer.x;
        pointer.vy = y - pointer.y;
      }
      pointer.x = x;
      pointer.y = y;
      pointer.active = x >= 0 && y >= 0 && x <= w && y <= h;
    };

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(3, (now - last) / 16.667);
      last = now;
      if (interactive) updatePointer(now);
      const pd = Math.pow(0.9, dt);
      pointer.vx *= pd;
      pointer.vy *= pd;
      draw(dt, now / 1000);
    };

    const start = () => {
      if (running || reduced || !visible || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    api.current.burst = (x, y, count = 40, spread = 1) => {
      if (reduced) return;
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = (0.6 + Math.random() * 3.2) * spread;
        bursts.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 1.2 * spread,
          size: 0.8 + Math.random() * 2.2,
          life: 1,
          decay: 0.006 + Math.random() * 0.012,
          sprite: sprites[(Math.random() * 3) | 0],
        });
      }
      if (bursts.length > 900) bursts.splice(0, bursts.length - 900);
    };

    const onMove = (e) => {
      pointer.cx = e.clientX;
      pointer.cy = e.clientY;
      pointer.dirty = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const onVis = () => (document.hidden ? stop() : start());

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      visible ? start() : stop();
    });
    io.observe(canvas);
    if (interactive) {
      window.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('pointerleave', onLeave);
    }
    document.addEventListener('visibilitychange', onVis);
    resize();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [density, max, interactive, rise, warmth]);

  return <canvas ref={canvasRef} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden="true" />;
});

export default ParticleField;
