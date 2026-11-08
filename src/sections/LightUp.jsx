import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { gsap, isFinePointer, prefersReducedMotion, useViewportWidth } from '../lib/motion';
import Diya from '../components/Diya';
import ParticleField from '../components/ParticleField';
import Mandala from '../components/decor/Mandala';
import { SectionLabel, Words } from '../components/Typography';

const MAX_PLACED = 28;

function ring(n, mobile) {
  const cx = 50;
  const cy = mobile ? 62 : 58;
  const rx = mobile ? 38 : 36;
  const ry = mobile ? 14 : 17;
  return Array.from({ length: n }, (_, i) => {
    const a = Math.PI / 2 + (i / n) * Math.PI * 2;
    return {
      id: `ring-${i}`,
      x: cx + Math.cos(a) * rx,
      y: cy + Math.sin(a) * ry,
      initial: true,
      lit: false,
      variant: i % 3 === 1 ? 'brass' : 'terracotta',
    };
  });
}

const COPY = {
  idle: {
    title: [{ t: 'Light up ' }, { t: 'the night.', className: 'italic text-gilded' }],
    body: 'Every flame you light warms the courtyard a little more. Tap a diya to light it, or tap anywhere on the floor to place a new one.',
  },
  done: {
    title: [{ t: 'Every lamp ' }, { t: 'is glowing.', className: 'italic text-gilded' }],
    body: 'And so is the night. Keep placing diyas wherever the dark remains, or start the ritual again.',
  },
};

let uid = 0;

export default function LightUp() {
  const vw = useViewportWidth();
  const mobile = vw < 768;
  const n = mobile ? 7 : 10;
  const [lamps, setLamps] = useState(() => ring(n, mobile));
  const [flareKey, setFlareKey] = useState(0);
  const [done, setDone] = useState(false);
  const [toast, setToast] = useState('');
  const [size, setSize] = useState({ w: 1440, h: 900 });
  const [touched, setTouched] = useState(false);

  const stage = useRef(null);
  const particles = useRef(null);
  const cursor = useRef(null);
  const header = useRef(null);
  const bloom = useRef(null);
  const toastTimer = useRef(0);

  // re-seed the ring when crossing the mobile breakpoint
  useEffect(() => {
    setLamps(ring(n, mobile));
    setDone(false);
  }, [n, mobile]);

  useLayoutEffect(() => {
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(stage.current);
    return () => ro.disconnect();
  }, []);

  const base = mobile ? 96 : Math.min(170, Math.max(110, size.w * 0.1));
  const sizeFor = (y) => Math.round(base * (0.42 + 0.86 * (y / 100)));

  const initial = lamps.filter((l) => l.initial);
  const litInitial = initial.filter((l) => l.lit).length;
  const placed = lamps.length - initial.length;
  const litTotal = litInitial + placed;
  const allLit = initial.length > 0 && litInitial === initial.length;
  const warmth = lamps.length ? litTotal / Math.max(lamps.length, initial.length) : 0;

  /* ---------------------------------------------------------------- */

  const flamePoint = useCallback((el) => {
    const s = stage.current.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return [r.left + r.width / 2 - s.left, r.top + r.height * 0.18 - s.top];
  }, []);

  const onIgnite = useCallback(
    (el) => {
      if (!el) return;
      const [x, y] = flamePoint(el);
      particles.current?.burst(x, y, 26, 0.9);
    },
    [flamePoint]
  );

  const lightLamp = useCallback((id) => {
    setTouched(true);
    setLamps((ls) => ls.map((l) => (l.id === id && !l.lit ? { ...l, lit: true } : l)));
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2600);
  };

  const place = (e) => {
    if (e.target.closest('[data-ui]')) return;
    const r = stage.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    if (y < (mobile ? 34 : 30) || y > 95) {
      showToast('Place your diya on the courtyard floor');
      return;
    }
    if (placed >= MAX_PLACED) {
      showToast('The courtyard is full of light');
      return;
    }
    setTouched(true);
    setLamps((ls) => [
      ...ls,
      {
        id: `p-${uid++}`,
        x: Math.min(96, Math.max(4, x)),
        y,
        initial: false,
        lit: true,
        variant: Math.random() > 0.6 ? 'brass' : 'terracotta',
      },
    ]);
  };

  const reset = () => {
    const els = stage.current.querySelectorAll('.lamp-placed');
    const finish = () => {
      setLamps(ring(n, mobile));
      setDone(false);
    };
    if (prefersReducedMotion() || !els.length) return finish();
    gsap.to(els, { opacity: 0, y: 12, duration: 0.6, stagger: 0.02, ease: 'power2.in', onComplete: finish });
    setLamps((ls) => ls.map((l) => ({ ...l, lit: false })));
  };

  /* celebration ----------------------------------------------------- */

  useEffect(() => {
    if (!allLit || done) return;
    const t = setTimeout(() => {
      setDone(true);
      setFlareKey((k) => k + 1);
      if (prefersReducedMotion()) return;
      const s = stage.current.getBoundingClientRect();
      stage.current.querySelectorAll('[data-lamp]').forEach((el, i) => {
        const [x, y] = flamePoint(el.firstElementChild);
        setTimeout(() => particles.current?.burst(x, y, 55, 1.5), i * 70);
      });
      for (let i = 0; i < 6; i++) {
        setTimeout(() => particles.current?.burst(s.width * (0.2 + Math.random() * 0.6), s.height * 0.62, 70, 2.2), 300 + i * 160);
      }
      gsap.fromTo(bloom.current, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out', yoyo: true, repeat: 1, repeatDelay: 0.6 });
    }, 900);
    return () => clearTimeout(t);
  }, [allLit, done, flamePoint]);

  // when every lamp goes dark again after a reset, allow a new celebration
  useEffect(() => {
    if (!allLit && done) setDone(false);
  }, [allLit, done]);

  // header copy reveal: on first scroll-in, then on every state change
  const seen = useRef(false);
  useLayoutEffect(() => {
    if (prefersReducedMotion() || !header.current) return;
    const words = header.current.querySelectorAll('.word');
    const p = header.current.querySelector('.lu-body');
    const tl = gsap.timeline(
      seen.current
        ? {}
        : { scrollTrigger: { trigger: header.current, start: 'top 70%', once: true, onEnter: () => (seen.current = true) } }
    );
    tl.fromTo(words, { yPercent: 110 }, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.05 }).fromTo(
      p,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' },
      0.25
    );
    return () => tl.kill();
  }, [done]);

  /* custom ember cursor --------------------------------------------- */

  useEffect(() => {
    if (!isFinePointer() || prefersReducedMotion()) return;
    const el = cursor.current;
    const st = stage.current;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3.out' });
    let hovering = false;
    const move = (e) => {
      const r = st.getBoundingClientRect();
      xTo(e.clientX - r.left);
      yTo(e.clientY - r.top);
      const over = !!e.target.closest('[role="button"]');
      if (over !== hovering) {
        hovering = over;
        gsap.to(el.firstElementChild, { scale: over ? 2.2 : 1, duration: 0.6, ease: 'expo.out' });
      }
    };
    const enter = () => gsap.to(el, { opacity: 1, duration: 0.4 });
    const leave = () => gsap.to(el, { opacity: 0, duration: 0.4 });
    st.addEventListener('pointermove', move);
    st.addEventListener('pointerenter', enter);
    st.addEventListener('pointerleave', leave);
    st.style.cursor = 'none';
    return () => {
      st.removeEventListener('pointermove', move);
      st.removeEventListener('pointerenter', enter);
      st.removeEventListener('pointerleave', leave);
    };
  }, []);

  const copy = done ? COPY.done : COPY.idle;
  const firstUnlit = initial.find((l) => !l.lit)?.id;
  const rangoliW = size.w * (mobile ? 0.7 : 0.6);
  const rangoliRatio = Math.min(1, ((mobile ? 0.26 : 0.32) * size.h) / rangoliW) || 0.3;

  return (
    <section
      id="light"
      ref={stage}
      onClick={place}
      className="relative h-[100svh] min-h-[660px] w-full select-none overflow-hidden"
      aria-label="Light up the night: an interactive diya courtyard"
    >
      {/* courtyard */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #05060d 0%, #080915 28%, #120b10 55%, #1a0e0a 80%, #0c0605 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-[1600ms] ease-[var(--ease-silk)]"
        style={{
          opacity: 0.15 + warmth * 0.85,
          background:
            'radial-gradient(60% 45% at 50% 62%, rgba(255,150,60,.28), rgba(200,80,30,.10) 45%, transparent 75%), radial-gradient(90% 40% at 50% 100%, rgba(255,120,40,.18), transparent 70%)',
        }}
      />
      {/* chalk mandala on the floor, foreshortened */}
      <div
        className="pointer-events-none absolute left-1/2"
        style={{
          top: `${mobile ? 62 : 58}%`,
          width: rangoliW,
          height: rangoliW,
          marginLeft: -rangoliW / 2,
          marginTop: -rangoliW / 2,
          transform: `scaleY(${rangoliRatio.toFixed(3)})`,
        }}
      >
        <Mandala
          className="relative h-full w-full transition-opacity duration-[1600ms]"
          style={{ opacity: 0.12 + warmth * 0.28 }}
        />
      </div>

      <ParticleField ref={particles} density={9000} max={120} rise={0.8} />

      <div
        ref={bloom}
        className="pointer-events-none absolute inset-0 opacity-0"
        style={{
          mixBlendMode: 'screen',
          background: 'radial-gradient(70% 60% at 50% 60%, rgba(255,200,110,.32), rgba(255,140,50,.12) 45%, transparent 75%)',
        }}
      />

      {/* lamps */}
      {lamps.map((l) => {
        const s = sizeFor(l.y);
        return (
          <div
            key={l.id}
            data-lamp
            className={`absolute ${l.initial ? '' : 'lamp-placed'}`}
            style={{ left: `${l.x}%`, top: `${l.y}%`, width: 0, height: 0, zIndex: Math.round(l.y * 10) }}
            ref={(el) => {
              if (el && !l.initial && !el.dataset.in && !prefersReducedMotion()) {
                el.dataset.in = '1';
                gsap.fromTo(el, { opacity: 0, y: -28, scale: 0.85 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'expo.out' });
              }
            }}
          >
            <Diya
              size={s}
              lit={l.lit}
              delay={l.initial ? 0 : 0.35}
              variant={l.variant}
              hint={touched ? false : l.id === firstUnlit}
              flareKey={flareKey}
              flareDelay={(l.x / 100) * 0.8}
              label="Diya"
              onIgnite={onIgnite}
              onActivate={() => lightLamp(l.id)}
              style={{ left: -s / 2, top: -s * 0.4 }}
            />
          </div>
        );
      })}

      {/* header */}
      <div ref={header} data-ui className="pointer-events-none absolute inset-x-0 top-0 z-[1100] px-6 pt-24 md:px-12 md:pt-28">
        <div className="mx-auto max-w-[1400px]">
          <SectionLabel index="02">Light Up the Night</SectionLabel>
          <h2 key={done ? 'd' : 'i'} className="mt-6 max-w-3xl font-display text-[clamp(2.4rem,5.4vw,5rem)] font-light leading-[1.02] text-ivory">
            <Words parts={copy.title} />
          </h2>
          <p key={done ? 'pd' : 'pi'} className="lu-body mt-5 max-w-md text-[0.95rem] leading-relaxed text-sand/80">
            {copy.body}
          </p>
        </div>
      </div>

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1100] px-6 pb-7 md:px-12 md:pb-10">
        <div className="mx-auto flex max-w-[1400px] items-end justify-between gap-6">
          <div data-ui className="pointer-events-auto" aria-live="polite">
            <p className="eyebrow">Lamps glowing</p>
            <p className="mt-2 font-display text-5xl font-light leading-none text-ivory md:text-6xl">
              <span className="text-gilded">{String(litTotal).padStart(2, '0')}</span>
              <span className="mx-2 text-2xl text-ivory/30 md:text-3xl">/</span>
              <span className="text-2xl text-ivory/45 md:text-3xl">{String(lamps.length).padStart(2, '0')}</span>
            </p>
            <div className="mt-4 h-px w-40 bg-ivory/10 md:w-56">
              <div
                className="h-full bg-gradient-to-r from-saffron via-gold to-ivory shadow-[0_0_12px_rgba(255,190,90,.8)] transition-[width] duration-[1200ms] ease-[var(--ease-silk)]"
                style={{ width: `${(litInitial / Math.max(1, initial.length)) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col items-end gap-4 text-right">
            {(litTotal > 0 || placed > 0) && (
              <button
                type="button"
                data-ui
                onClick={reset}
                className="group pointer-events-auto inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-[0.66rem] uppercase tracking-[0.24em] text-ivory/70 transition-colors duration-500 hover:text-ivory"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(255,215,106,.22)' }}
              >
                <RotateCcw className="h-3.5 w-3.5 transition-transform duration-700 ease-[var(--ease-silk)] group-hover:-rotate-180" strokeWidth={1.5} />
                Begin again
              </button>
            )}
            <p className="eyebrow hidden max-w-[16rem] leading-loose md:block">
              {placed > 0 ? `${placed} diya${placed > 1 ? 's' : ''} placed by you` : 'Tap the floor to place a diya'}
            </p>
          </div>
        </div>
      </div>

      {/* toast */}
      <div
        className={`pointer-events-none absolute left-1/2 top-[30%] z-[1200] -translate-x-1/2 rounded-full px-5 py-2.5 text-xs tracking-wide text-ivory/90 transition-all duration-700 ease-[var(--ease-silk)] ${
          toast ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
        style={{ background: 'rgba(12,10,20,.72)', boxShadow: 'inset 0 0 0 1px rgba(255,215,106,.2)' }}
        role="status"
      >
        {toast}
      </div>

      {/* ember cursor */}
      <div ref={cursor} className="pointer-events-none absolute left-0 top-0 z-[1300] opacity-0" aria-hidden="true">
        <div
          className="-ml-3 -mt-3 h-6 w-6 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,250,230,1) 0%, rgba(255,200,110,.9) 18%, rgba(255,140,50,.35) 45%, transparent 70%)',
            mixBlendMode: 'screen',
          }}
        />
      </div>
    </section>
  );
}
