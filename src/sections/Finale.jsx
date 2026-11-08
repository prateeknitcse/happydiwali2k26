import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ArrowUp, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { getSoundState, setSoundEnabled, subscribeSound } from '../lib/sound';
import { gsap, prefersReducedMotion, scrollToId, ScrollTrigger, useViewportWidth } from '../lib/motion';
import Diya from '../components/Diya';
import Fireworks from '../components/Fireworks';
import Skyline from '../components/decor/Skyline';
import { Stars } from '../components/decor/Atmosphere';
import { FlameMark } from '../components/Nav';
import { Magnetic, SectionLabel } from '../components/Typography';

/** Firework sound switch. Browsers keep audio silent until the first tap, so "locked" invites one. */
function SoundToggle() {
  const state = useSyncExternalStore(subscribeSound, getSoundState, () => 'locked');
  const on = state === 'on';
  const Icon = on ? Volume2 : VolumeX;
  const label = state === 'on' ? 'Sound on' : state === 'off' ? 'Sound off' : 'Tap for sound';
  // The press itself unlocks audio, which can flip the state to "on" before
  // the click lands. Act on what the user saw when they pressed.
  const pressed = useRef(null);
  const remember = () => (pressed.current = state);
  return (
    <button
      type="button"
      onPointerDown={remember}
      onKeyDown={remember}
      onClick={() => {
        const seen = pressed.current ?? state;
        pressed.current = null;
        setSoundEnabled(seen !== 'on');
      }}
      aria-pressed={on}
      aria-label={on ? 'Mute firework sounds' : 'Play firework sounds'}
      className="pointer-events-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.6rem] uppercase tracking-[0.24em] text-ivory/60 transition-colors duration-500 hover:text-ivory"
      style={{ boxShadow: 'inset 0 0 0 1px rgba(255,215,106,.22)' }}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
      {label}
    </button>
  );
}

export default function Finale() {
  const section = useRef(null);
  const fireworks = useRef(null);
  const flash = useRef(null);
  const [lit, setLit] = useState(false);
  const vw = useViewportWidth();
  const mobile = vw < 768;
  const count = mobile ? 7 : 13;
  const reduced = prefersReducedMotion();

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section.current,
        start: 'top 55%',
        once: true,
        onEnter: () => {
          setLit(true);
          if (!reduced) setTimeout(() => fireworks.current?.salvo(mobile ? 3 : 5), 900);
        },
      });
      if (reduced) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: section.current, start: 'top 50%', once: true } });
      tl.fromTo('.f-deva', { opacity: 0, y: 40, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 2.2, ease: 'expo.out' })
        .fromTo('.f-char', { opacity: 0, yPercent: 60 }, { opacity: 1, yPercent: 0, duration: 1.6, ease: 'expo.out', stagger: 0.05 }, 0.35)
        .fromTo('.f-fade', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.4, ease: 'power3.out', stagger: 0.15 }, 0.8);
    }, section);
    return () => ctx.revert();
  }, [mobile, reduced]);

  const onSky = (e) => {
    if (e.target.closest('button, a')) return;
    const r = section.current.getBoundingClientRect();
    fireworks.current?.launch(e.clientX - r.left, e.clientY - r.top);
  };

  const ds = mobile ? 46 : 58;

  return (
    <section
      id="celebrate"
      ref={section}
      onClick={onSky}
      className="relative flex min-h-[100svh] w-full flex-col overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #05060d 0%, #070818 40%, #140b14 75%, #241009 100%)' }}
      aria-label="Final celebration"
    >
      <Stars className="pointer-events-none absolute inset-0 h-full w-full opacity-70" seed={19} count={110} />
      <div ref={flash} className="pointer-events-none absolute inset-0 opacity-0" style={{ mixBlendMode: 'screen', willChange: 'opacity' }} />
      <Fireworks ref={fireworks} flashRef={flash} className="pointer-events-none" />

      <div className="pointer-events-none absolute inset-x-[-4%] bottom-[56px] h-[28vh] min-h-[170px]">
        <Skyline className="relative h-full w-full" idPrefix="finale-sky" />
      </div>
      {/* parapet with a row of lamps */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[64px]" style={{ background: 'linear-gradient(180deg,#140a08,#060303)', boxShadow: '0 -1px 0 rgba(255,190,110,.2)' }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-[52px]">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="absolute bottom-0" style={{ left: `${((i + 0.5) / count) * 100}%` }}>
            <Diya
              size={ds}
              lit={lit}
              delay={0.2 + Math.abs(i - (count - 1) / 2) * 0.15}
              variant={i % 2 ? 'brass' : 'terracotta'}
              interactive={false}
              glowScale={5}
              style={{ left: -ds / 2, bottom: 0 }}
            />
          </div>
        ))}
      </div>

      <div className="pointer-events-none relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-[34vh] pt-32 text-center">
        <SectionLabel index="04" className="f-fade justify-center">
          Final Celebration
        </SectionLabel>
        {/* The glow is a static blurred copy on its own layer. A drop-shadow
            filter on the shimmering text would be re-blurred on every frame. */}
        <p className="f-deva relative mt-10 font-deva text-[clamp(3.6rem,11vw,10rem)] leading-[1.15]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 select-none"
            style={{ color: 'rgb(255,160,60)', opacity: 0.35, filter: 'blur(20px)', willChange: 'transform' }}
          >
            शुभ दीपावली
          </span>
          <span className="text-gilded relative">शुभ दीपावली</span>
        </p>
        <h2 className="mt-2 font-display text-[clamp(2.2rem,5vw,4.4rem)] font-light italic text-ivory/90">
          <span className="sr-only">Happy Diwali</span>
          <span aria-hidden="true">
            {'Happy Diwali'.split('').map((c, i) => (
              <span key={i} className="f-char inline-block">
                {c === ' ' ? '\u00a0' : c}
              </span>
            ))}
          </span>
        </h2>
        <p className="f-fade mt-6 max-w-lg leading-relaxed text-sand/85">
          From our home to yours: may this year be generous with light, with laughter, and with the people you love.
        </p>
        <div className="f-fade pointer-events-auto mt-10 flex flex-col items-center gap-4">
          {!reduced && (
            <Magnetic>
              <button
                type="button"
                onClick={() => fireworks.current?.salvo(mobile ? 4 : 7)}
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-8 py-4 text-[0.72rem] font-medium uppercase tracking-[0.26em] text-night transition-shadow duration-700"
                style={{
                  background: 'linear-gradient(100deg, #f3c35f, #ffe7a6 45%, #ffbf5a)',
                  boxShadow: '0 10px 50px -8px rgba(255,170,60,.6), inset 0 1px 0 rgba(255,255,255,.6)',
                }}
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(100deg,transparent_20%,rgba(255,255,255,.55)_50%,transparent_80%)] transition-transform duration-[1100ms] ease-[var(--ease-silk)] group-hover:translate-x-full" />
                <span className="relative">Light up the sky</span>
                <Sparkles className="relative h-4 w-4 transition-transform duration-700 group-hover:rotate-[20deg] group-hover:scale-125" strokeWidth={1.6} />
              </button>
            </Magnetic>
          )}
          {!reduced && <p className="eyebrow text-[0.6rem] text-ivory/40">or tap anywhere in the sky</p>}
          {!reduced && <SoundToggle />}
        </div>
      </div>

      <footer className="relative z-10 mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-6 pb-4 text-[0.62rem] uppercase tracking-[0.24em] text-ivory/45 md:px-12">
        <span className="flex items-center gap-2">
          <FlameMark className="h-4 w-3" /> Diwali 2026
        </span>
        <button
          type="button"
          onClick={() => scrollToId('top')}
          className="group inline-flex items-center gap-2 transition-colors hover:text-ivory"
        >
          Back to the first light
          <ArrowUp className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-translate-y-0.5" strokeWidth={1.5} />
        </button>
      </footer>
    </section>
  );
}
