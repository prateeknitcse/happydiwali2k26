import { useEffect, useLayoutEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { gsap, isFinePointer, prefersReducedMotion, scrollToId, useViewportWidth } from '../lib/motion';
import Diya from '../components/Diya';
import ParticleField from '../components/ParticleField';
import Mandala from '../components/decor/Mandala';
import Skyline from '../components/decor/Skyline';
import { LightRays, Stars } from '../components/decor/Atmosphere';
import { Magnetic, Words } from '../components/Typography';

// x = centre (% of width), b = bottom (% of height), s = base size, d = parallax depth
const LAMPS = [
  { x: 7, b: 9, s: 150, v: 'terracotta', d: 1, m: true },
  { x: 18, b: 4, s: 112, v: 'brass', d: 0.9, m: true },
  { x: 27.5, b: 13.5, s: 70, v: 'terracotta', d: 0.6 },
  { x: 39, b: 17.5, s: 44, v: 'brass', d: 0.4 },
  { x: 61, b: 18, s: 46, v: 'terracotta', d: 0.4 },
  { x: 72.5, b: 13, s: 76, v: 'brass', d: 0.6 },
  { x: 82, b: 3.5, s: 118, v: 'terracotta', d: 0.9, m: true },
  { x: 93, b: 8, s: 162, v: 'brass', d: 1, m: true },
];
const IGNITE_ORDER = [3, 4, 2, 5, 1, 6, 0, 7];

export default function Hero({ ready }) {
  const root = useRef(null);
  const vw = useViewportWidth();
  const mobile = vw < 768;
  const k = Math.min(1.12, Math.max(0.5, vw / 1440));

  // Hide everything until the intro hands over.
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.set('.h-char', { opacity: 0, yPercent: 55, rotateX: -75 });
      gsap.set('.h-sub .word', { yPercent: 110 });
      gsap.set(['.h-eyebrow', '.h-cta', '.h-cue'], { opacity: 0, y: 18 });
      gsap.set('.h-mandala', { opacity: 0, scale: 0.86 });
      gsap.set('.h-glowtext', { opacity: 0 });
      gsap.set('.h-dark', { opacity: 1 });
    }, root);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!ready || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.to('.h-dark', { opacity: 0, duration: 3.2, ease: 'power2.out' }, 0)
        .to('.h-mandala', { opacity: 1, scale: 1, duration: 4, ease: 'bloom' }, 0.1)
        .to('.h-eyebrow', { opacity: 1, y: 0, duration: 1.6, stagger: 0.12 }, 0.35)
        .to('.h-char', { opacity: 1, yPercent: 0, rotateX: 0, duration: 2, stagger: 0.065 }, 0.5)
        .to('.h-glowtext', { opacity: 1, duration: 3, ease: 'power2.out' }, 1.1)
        .to('.h-sub .word', { yPercent: 0, duration: 1.5, stagger: 0.04 }, 1.25)
        .to('.h-cta', { opacity: 1, y: 0, duration: 1.6 }, 1.7)
        .to('.h-cue', { opacity: 1, y: 0, duration: 1.6 }, 2.2);

      // scroll: the scene sinks and the title lifts away
      gsap.to('.h-content', {
        yPercent: -22,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom 20%', scrub: true },
      });
      gsap.to('.h-sky', {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, [ready]);

  // Mouse parallax across depth layers.
  useEffect(() => {
    if (prefersReducedMotion() || !isFinePointer()) return;
    const layers = [...root.current.querySelectorAll('[data-depth]')].map((el) => ({
      d: parseFloat(el.dataset.depth),
      x: gsap.quickTo(el, 'x', { duration: 1.6, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'y', { duration: 1.6, ease: 'power3.out' }),
    }));
    const onMove = (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      for (const l of layers) {
        l.x(-nx * 46 * l.d);
        l.y(-ny * 22 * l.d);
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  const lamps = LAMPS.filter((l) => !mobile || l.m);

  return (
    <section
      id="top"
      ref={root}
      className="relative h-[100svh] min-h-[620px] w-full overflow-hidden bg-night"
      aria-label="Happy Diwali"
    >
      {/* sky */}
      <div className="h-sky absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(90% 60% at 50% 100%, rgba(255,138,50,.28), rgba(140,50,30,.12) 40%, transparent 70%), radial-gradient(70% 50% at 50% 38%, rgba(255,200,110,.10), transparent 70%), linear-gradient(180deg, #04050b 0%, #0a0c1d 45%, #1a0f17 78%, #2a130d 100%)',
          }}
        />
        <div data-depth="0.08" className="absolute -inset-10">
          <Stars className="relative h-full w-full" />
        </div>
        <LightRays />
        <div data-depth="0.18" className="absolute inset-0 flex items-center justify-center">
          <div className="h-mandala relative" style={{ width: 'min(118vw, 1080px)', aspectRatio: '1', marginTop: '-6vh' }}>
            <div
              className="absolute inset-[18%] rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(255,190,100,.22), rgba(255,140,50,.06) 50%, transparent 70%)' }}
            />
            <Mandala className="absolute inset-0 h-full w-full opacity-[0.22]" />
          </div>
        </div>
        <div data-depth="0.32" className="absolute inset-x-[-4%] bottom-[19%] h-[34vh] min-h-[200px]">
          <Skyline className="relative h-full w-full" idPrefix="hero-sky" />
        </div>
      </div>

      <ParticleField density={7000} max={150} />

      {/* terrace in the foreground */}
      <div data-depth="0.7" className="absolute inset-x-[-4%] bottom-0 h-[22%]">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, #1b0f0b 0%, #120907 30%, #070404 100%)',
            boxShadow: '0 -1px 0 rgba(255,190,110,.18), 0 -30px 60px rgba(0,0,0,.6)',
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,200,120,.45), transparent)' }} />
      </div>

      {/* diyas */}
      <div className="absolute inset-0" aria-label="Diyas">
        {lamps.map((l, i) => {
          const size = Math.round(l.s * k * (mobile ? 1.05 : 1));
          const order = IGNITE_ORDER.indexOf(LAMPS.indexOf(l));
          return (
            <div key={l.x} data-depth={l.d} className="absolute" style={{ left: `${l.x}%`, bottom: `${l.b}%`, zIndex: Math.round(l.s) }}>
              <Diya
                size={size}
                lit={ready}
                delay={0.35 + order * 0.22}
                variant={l.v}
                label={`Diya ${i + 1}`}
                style={{ left: -size / 2, bottom: 0 }}
              />
            </div>
          );
        })}
      </div>

      {/* initial darkness that the lamps push back */}
      <div className="h-dark pointer-events-none absolute inset-0 bg-night opacity-0" />
      <div className="vignette pointer-events-none absolute inset-0" />

      {/* copy */}
      <div className="h-content pointer-events-none relative z-[300] flex h-full flex-col items-center justify-center px-6 pb-[16vh] text-center">
        <p className="h-eyebrow font-deva text-xl text-gold/90 md:text-2xl">शुभ दीपावली</p>
        <p className="h-eyebrow eyebrow mt-3">Kartik Amavasya · Sunday, 8 November 2026</p>

        <h1 className="relative mt-7 font-display leading-[0.8] md:mt-9" > 
          <span className="sr-only">Happy Diwali</span>
          <span aria-hidden="true" style={{ perspective: '900px' }} className="block text-[clamp(2.6rem,7.4vw,6.8rem)] font-light italic text-ivory/90 md:-translate-x-[24%]">
            {'Happy'.split('').map((c, i) => (
              <span key={i} className="h-char inline-block" style={{ transformOrigin: '50% 100%' }}>
                {c}
              </span>
            ))}
          </span>
          <span aria-hidden="true" style={{ perspective: '900px' }} className="relative block text-[clamp(4.8rem,16vw,14rem)] font-normal tracking-[-0.025em] md:translate-x-[6%]">
            <span
              className="h-glowtext pointer-events-none absolute inset-0 select-none text-amber"
              style={{ filter: 'blur(28px)', opacity: 0.55, willChange: 'opacity' }}
            >
              Diwali
            </span>
            {'Diwali'.split('').map((c, i) => (
              <span
                key={i}
                className="h-char text-gilded relative inline-block"
                style={{ transformOrigin: '50% 100%', animationDelay: `${i * 0.35}s` }}
              >
                {c}
              </span>
            ))}
          </span>
        </h1>

        <p className="h-sub mt-8 max-w-xl font-display text-[clamp(1.2rem,2.1vw,1.7rem)] font-light italic leading-snug text-ivory/75 md:mt-10">
          <Words text="May your life shine brighter than a thousand diyas." />
        </p>

        <div className="h-cta pointer-events-auto mt-10 md:mt-12">
          <Magnetic>
            <button
              type="button"
              onClick={() => scrollToId('light')}
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-8 py-4 text-[0.72rem] font-medium uppercase tracking-[0.26em] text-ivory transition-[box-shadow,background-color] duration-700 ease-[var(--ease-silk)]"
              style={{
                background: 'radial-gradient(120% 140% at 50% 120%, rgba(255,170,70,.28), rgba(255,215,106,.05) 60%)',
                boxShadow: 'inset 0 0 0 1px rgba(255,215,106,.32), 0 10px 40px -10px rgba(255,150,50,.35)',
              }}
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(100deg,transparent_20%,rgba(255,236,190,.28)_50%,transparent_80%)] transition-transform duration-[1100ms] ease-[var(--ease-silk)] group-hover:translate-x-full" />
              <span className="pointer-events-none absolute inset-0 rounded-full opacity-0 shadow-[inset_0_0_0_1px_rgba(255,215,106,.7),0_0_50px_-6px_rgba(255,170,70,.7)] transition-opacity duration-700 group-hover:opacity-100" />
              <span className="relative">Celebrate the Light</span>
              <Sparkles className="relative h-4 w-4 text-gold transition-transform duration-700 ease-[var(--ease-silk)] group-hover:rotate-[20deg] group-hover:scale-125" strokeWidth={1.5} />
            </button>
          </Magnetic>
        </div>
      </div>

      {/* scroll cue */}
      <button
        type="button"
        onClick={() => scrollToId('wishes')}
        className="h-cue absolute bottom-6 left-1/2 z-[300] flex -translate-x-1/2 flex-col items-center gap-3 text-ivory/50 transition-colors hover:text-ivory"
        aria-label="Scroll to wishes"
      >
        <span className="eyebrow text-[0.6rem]">Scroll</span>
        <span className="relative block h-12 w-px overflow-hidden bg-ivory/15">
          <span className="absolute inset-x-0 top-0 block h-1/3 bg-gradient-to-b from-transparent via-gold to-transparent" style={{ animation: 'scroll-cue 2.4s cubic-bezier(.65,0,.35,1) infinite' }} />
        </span>
      </button>
    </section>
  );
}
