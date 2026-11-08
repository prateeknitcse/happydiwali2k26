import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { prefersReducedMotion } from '../lib/motion';
import { playBurst } from '../lib/sound';

const PALETTE = [
  { rgb: [255, 214, 120], w: 5 }, // gold
  { rgb: [255, 170, 70], w: 4 }, // amber
  { rgb: [255, 120, 50], w: 3 }, // saffron
  { rgb: [255, 82, 70], w: 2 }, // vermilion
  { rgb: [255, 246, 226], w: 2 }, // white
  { rgb: [255, 128, 168], w: 1 }, // rose
  { rgb: [178, 146, 255], w: 0.6 }, // violet
  { rgb: [120, 226, 205], w: 0.5 }, // teal
];
// fixed colours used by willow stars, embers and rocket sparks
const WILLOW = PALETTE.length;
const EMBER = WILLOW + 1;
const TRAIL = WILLOW + 2;
const COLORS = [...PALETTE.map((c) => c.rgb), [255, 196, 110], [255, 230, 180], [255, 190, 110]];

const TOTAL_W = PALETTE.reduce((a, c) => a + c.w, 0);
const pickColor = () => {
  let r = Math.random() * TOTAL_W;
  for (let i = 0; i < PALETTE.length; i++) {
    r -= PALETTE[i].w;
    if (r <= 0) return i;
  }
  return 0;
};
const TYPES = ['peony', 'peony', 'willow', 'ring', 'chrysanthemum', 'crackle'];

/*
 * Sparks are drawn in batches instead of one stroke() each. Every spark is
 * sorted into a bucket by colour, "heat" (white-hot core), alpha and width,
 * then each bucket is stroked once. Quantising to these few levels is
 * invisible at spark scale and turns ~2000 draw calls into a few dozen.
 */
const HEAT = 4;
const ALPHA = 12;
const WIDTHS = [0.8, 1.3, 1.9, 2.6];
const BUCKETS = COLORS.length * HEAT * ALPHA * WIDTHS.length;
const STYLE = [];
for (const [r, g, b] of COLORS) {
  for (let h = 0; h < HEAT; h++) {
    const k = h / (HEAT - 1);
    STYLE.push(`rgb(${Math.round(r + (255 - r) * k)},${Math.round(g + (255 - g) * k)},${Math.round(b + (255 - b) * k)})`);
  }
}
const widthLevel = (lw) => (lw < 1.05 ? 0 : lw < 1.6 ? 1 : lw < 2.25 ? 2 : 3);

const MAX_SPARKS = 2400;

/**
 * Canvas fireworks: rockets with ember trails, several burst shapes,
 * gravity + drag physics, a sky flash written to `flashRef`, and a
 * synthesised burst sound for every shell.
 */
const Fireworks = forwardRef(function Fireworks({ auto = true, flashRef, className = '' }, ref) {
  const canvasRef = useRef(null);
  const api = useRef({ launch: () => {}, salvo: () => {} });
  useImperativeHandle(ref, () => ({
    launch: (...a) => api.current.launch(...a),
    salvo: (...a) => api.current.salvo(...a),
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reduced = prefersReducedMotion();
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let running = false;
    let visible = false;
    let last = 0;
    let nextAuto = 0;
    let flash = 0;
    let flashShown = -1;
    const rockets = [];
    const sparks = [];
    const timers = new Set();

    // per-frame batching state, allocated once
    const bucketPts = Array.from({ length: BUCKETS }, () => []);
    const bucketLen = new Uint16Array(BUCKETS);
    const active = [];

    const glow = document.createElement('canvas');
    glow.width = glow.height = 64;
    {
      const g = glow.getContext('2d');
      const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grd.addColorStop(0, 'rgba(255,255,255,1)');
      grd.addColorStop(0.25, 'rgba(255,220,150,0.5)');
      grd.addColorStop(1, 'rgba(255,160,60,0)');
      g.fillStyle = grd;
      g.fillRect(0, 0, 64, 64);
    }

    const later = (fn, ms) => {
      const id = setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const addSpark = (s) => {
      if (sparks.length >= MAX_SPARKS) {
        // recycle the oldest-looking slot instead of shifting the whole array
        sparks[(Math.random() * sparks.length) | 0] = s;
      } else sparks.push(s);
    };

    const launch = (tx, ty) => {
      if (reduced) return;
      const x0 = tx != null ? tx + (Math.random() - 0.5) * w * 0.15 : w * (0.15 + Math.random() * 0.7);
      const targetX = tx ?? x0 + (Math.random() - 0.5) * w * 0.12;
      const targetY = ty ?? h * (0.12 + Math.random() * 0.3);
      rockets.push({
        x: x0,
        y: h + 8,
        sx: x0,
        sy: h + 8,
        tx: targetX,
        ty: Math.min(targetY, h * 0.75),
        t: 0,
        dur: 70 + Math.random() * 30,
        px: x0,
        py: h + 8,
        color: pickColor(),
        type: TYPES[(Math.random() * TYPES.length) | 0],
      });
    };

    const explode = (r) => {
      const { x, y, color, type } = r;
      const second = Math.random() > 0.6 ? pickColor() : -1;
      const base = (Math.min(w, h) / 900) * (type === 'willow' ? 3.2 : 4.6) + 1.2;
      let n = type === 'ring' ? 70 : type === 'willow' ? 110 : 140;
      if (w < 640) n = Math.round(n * 0.6);
      const tilt = Math.random() * Math.PI;
      const squash = 0.35 + Math.random() * 0.5;
      const willow = type === 'willow';
      for (let i = 0; i < n; i++) {
        let vx;
        let vy;
        if (type === 'ring') {
          const a = (i / n) * Math.PI * 2;
          const rx = Math.cos(a) * base;
          const ry = Math.sin(a) * base * squash;
          vx = rx * Math.cos(tilt) - ry * Math.sin(tilt);
          vy = rx * Math.sin(tilt) + ry * Math.cos(tilt);
        } else {
          // projected sphere: dense rim, softer centre, reads as 3D
          const a = Math.random() * Math.PI * 2;
          const u = Math.random() * 2 - 1;
          const sp = base * Math.sqrt(1 - u * u) * (0.92 + Math.random() * 0.12);
          vx = Math.cos(a) * sp;
          vy = Math.sin(a) * sp;
        }
        addSpark({
          x,
          y,
          px: x,
          py: y,
          vx,
          vy,
          life: 1,
          decay: willow ? 0.0055 + Math.random() * 0.003 : 0.011 + Math.random() * 0.008,
          drag: willow ? 0.955 : 0.968,
          grav: willow ? 0.028 : 0.036,
          color: willow ? WILLOW : second >= 0 && i % 2 ? second : color,
          size: willow ? 1.3 : 1.7 + Math.random() * 0.6,
          strobe: type === 'crackle' || (type === 'chrysanthemum' && Math.random() > 0.5),
          trail: willow || type === 'chrysanthemum',
        });
      }
      // a few embers that drift and fall slowly
      for (let i = 0; i < 18; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = Math.random() * base * 0.3;
        addSpark({
          x, y, px: x, py: y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 1, decay: 0.008, drag: 0.96, grav: 0.02,
          color: EMBER, size: 1.1, strobe: true, trail: false,
        });
      }

      playBurst({ pan: (x / w) * 1.6 - 0.8, size: 0.75 + (1 - y / h) * 0.5 + (w < 640 ? -0.15 : 0), type });

      flash = Math.min(1, flash + 0.55);
      if (flashRef?.current) {
        const [cr, cg, cb] = COLORS[color];
        flashRef.current.style.background = `radial-gradient(60% 55% at ${((x / w) * 100).toFixed(1)}% ${((y / h) * 100).toFixed(1)}%, rgba(${cr},${cg},${cb},0.28), rgba(${cr},${cg},${cb},0.08) 45%, transparent 75%)`;
      }
    };

    const salvo = (count = 5) => {
      for (let i = 0; i < count; i++) {
        later(() => launch(w * (0.15 + (0.7 * (i + 0.5)) / count), h * (0.12 + Math.random() * 0.22)), i * 260);
      }
    };

    api.current.launch = launch;
    api.current.salvo = salvo;

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(2.5, (now - last) / 16.667 || 1);
      last = now;

      // fade the previous frame toward transparent -> motion trails.
      // Exponent keeps trail length identical at 60, 90, 120 or 144 Hz.
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 1 - Math.pow(0.78, dt);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';

      if (auto && now > nextAuto) {
        launch();
        if (Math.random() > 0.75) later(launch, 180);
        nextAuto = now + 900 + Math.random() * 1500;
      }

      // rockets: only a handful, drawn directly
      ctx.lineWidth = 1.6;
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.t += dt;
        const k = Math.min(1, r.t / r.dur);
        const e = 1 - Math.pow(1 - k, 3);
        r.px = r.x;
        r.py = r.y;
        r.x = r.sx + (r.tx - r.sx) * e + Math.sin(r.t * 0.3) * 0.4;
        r.y = r.sy + (r.ty - r.sy) * e;
        ctx.strokeStyle = `rgba(255,214,150,${(0.9 - k * 0.4).toFixed(2)})`;
        ctx.beginPath();
        ctx.moveTo(r.px, r.py);
        ctx.lineTo(r.x, r.y);
        ctx.stroke();
        ctx.globalAlpha = 0.6;
        ctx.drawImage(glow, r.x - 7, r.y - 7, 14, 14);
        ctx.globalAlpha = 1;
        if (Math.random() < 0.5 * dt) {
          addSpark({
            x: r.x, y: r.y, px: r.x, py: r.y,
            vx: (Math.random() - 0.5) * 0.6, vy: Math.random() * 0.8,
            life: 0.7, decay: 0.03, drag: 0.95, grav: 0.03,
            color: TRAIL, size: 1, strobe: false, trail: false,
          });
        }
        if (k >= 1) {
          rockets[i] = rockets[rockets.length - 1];
          rockets.pop();
          explode(r);
        }
      }

      // sparks: integrate, then sort into buckets
      active.length = 0;
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.life -= p.decay * dt;
        if (p.life <= 0) {
          // swap-remove: O(1) instead of splice's O(n)
          sparks[i] = sparks[sparks.length - 1];
          sparks.pop();
          continue;
        }
        const drag = Math.pow(p.drag, dt);
        p.vx *= drag;
        p.vy = p.vy * drag + p.grav * dt;
        p.px = p.x;
        p.py = p.y;
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        let a = Math.pow(p.life, 0.7);
        if (p.strobe && p.life < 0.55 && Math.random() > 0.5) a *= 0.1;
        const al = Math.min(ALPHA - 1, (a * ALPHA) | 0);
        if (al > 0 || a > 0.04) {
          const heat = Math.min(HEAT - 1, Math.round(Math.max(0, p.life - 0.75) * 4 * (HEAT - 1)));
          const wl = widthLevel(p.size * (0.6 + p.life * 0.6));
          const key = ((p.color * HEAT + heat) * ALPHA + al) * WIDTHS.length + wl;
          const pts = bucketPts[key];
          let n = bucketLen[key];
          if (n === 0) active.push(key);
          const stretch = p.trail ? 2.6 : 1.4;
          pts[n++] = p.x - (p.x - p.px) * stretch;
          pts[n++] = p.y - (p.y - p.py) * stretch;
          pts[n++] = p.x;
          pts[n++] = p.y;
          bucketLen[key] = n;
        }
        if (p.life > 0.82) {
          ctx.globalAlpha = (p.life - 0.82) * 2.5;
          ctx.drawImage(glow, p.x - 6, p.y - 6, 12, 12);
        }
      }
      ctx.globalAlpha = 1;

      for (let b = 0; b < active.length; b++) {
        const key = active[b];
        const pts = bucketPts[key];
        const n = bucketLen[key];
        const wl = key % WIDTHS.length;
        const rest = (key - wl) / WIDTHS.length;
        const al = rest % ALPHA;
        const styleIdx = (rest - al) / ALPHA;
        ctx.strokeStyle = STYLE[styleIdx];
        ctx.globalAlpha = (al + 1) / ALPHA;
        ctx.lineWidth = WIDTHS[wl];
        ctx.beginPath();
        for (let j = 0; j < n; j += 4) {
          ctx.moveTo(pts[j], pts[j + 1]);
          ctx.lineTo(pts[j + 2], pts[j + 3]);
        }
        ctx.stroke();
        bucketLen[key] = 0;
      }
      ctx.globalAlpha = 1;

      flash *= Math.pow(0.9, dt);
      if (flash < 0.004) flash = 0;
      if (flashRef?.current && flash !== flashShown) {
        flashShown = flash;
        flashRef.current.style.opacity = flash.toFixed(3);
      }
    };

    const start = () => {
      if (running || reduced || !visible || document.hidden) return;
      running = true;
      last = performance.now();
      nextAuto = last + 600;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const onVis = () => (document.hidden ? stop() : start());

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        visible ? start() : stop();
      },
      { threshold: 0.15 }
    );
    io.observe(canvas);
    document.addEventListener('visibilitychange', onVis);
    resize();

    return () => {
      stop();
      timers.forEach(clearTimeout);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [auto, flashRef]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 h-full w-full ${className}`}
      style={{ willChange: 'transform' }}
      aria-hidden="true"
    />
  );
});

export default Fireworks;
