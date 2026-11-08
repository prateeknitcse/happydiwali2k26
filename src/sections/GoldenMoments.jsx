import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion, useViewportWidth } from '../lib/motion';
import Diya from '../components/Diya';
import Rangoli from '../components/decor/Rangoli';
import { FairyLights, Kandil, PetalRain, Toran } from '../components/decor/Festive';
import { SectionLabel, useFadeReveal, useWordReveal, Words } from '../components/Typography';

const NOTES = [
  {
    deva: 'रंगोली',
    name: 'Rangoli',
    text: 'Coloured powder poured by hand at the threshold, so the goddess of fortune knows which door to enter.',
  },
  {
    deva: 'तोरण',
    name: 'Toran',
    text: 'Marigold and mango leaves strung across the doorway: saffron for devotion, green for a new season.',
  },
  {
    deva: 'आकाश कंदील',
    name: 'Akash Kandil',
    text: 'Paper star lanterns hung high, guiding wandering souls and late-night guests safely home.',
  },
];

export default function GoldenMoments() {
  const section = useRef(null);
  const title = useRef(null);
  const art = useRef(null);
  const rangoli = useRef(null);
  const [ringLit, setRingLit] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const vw = useViewportWidth();
  const mobile = vw < 768;

  useWordReveal(title, { stagger: 0.05 });
  useFadeReveal(section);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(section.current);
    return () => io.disconnect();
  }, []);

  // The rangoli is poured as you scroll: outlines first, then powder.
  useEffect(() => {
    const svg = rangoli.current;
    if (!svg) return;
    if (prefersReducedMotion()) {
      gsap.set(svg.querySelectorAll('.rg'), { strokeDashoffset: 0, fillOpacity: 1 });
      setRingLit(true);
      return;
    }
    const ctx = gsap.context(() => {
      const shapes = svg.querySelectorAll('.rg');
      const dots = svg.querySelectorAll('.rg-dot');
      gsap.set(dots, { opacity: 0 });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: art.current,
          start: 'top 85%',
          end: 'center 45%',
          scrub: 1.2,
          onUpdate: (self) => setRingLit((v) => (self.progress > 0.92 ? true : self.progress < 0.5 ? false : v)),
        },
      });
      tl.to(shapes, { strokeDashoffset: 0, duration: 1, ease: 'power1.inOut', stagger: { each: 0.035 } }, 0)
        .to(shapes, { fillOpacity: 1, duration: 0.8, ease: 'power1.out', stagger: { each: 0.035 } }, 0.5)
        .to(dots, { opacity: 1, duration: 0.3, stagger: { each: 0.01, from: 'start' } }, 0.6);
      gsap.fromTo(
        art.current,
        { rotate: -18, scale: 0.92 },
        {
          rotate: 0,
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: art.current, start: 'top bottom', end: 'center 45%', scrub: true },
        }
      );
    }, section);
    return () => ctx.revert();
  }, []);

  const ringN = 8;
  const artSize = mobile ? Math.min(vw * 0.76, 420) : Math.min(vw * 0.44, 640);
  const diyaSize = Math.round(artSize * 0.13);

  return (
    <section
      id="moments"
      ref={section}
      className={`relative overflow-hidden pb-32 md:pb-44 ${onScreen ? '' : 'paused'}`}
      style={{ background: 'linear-gradient(180deg, #05060d 0%, #0b0a17 30%, #140c12 70%, #05060d 100%)' }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-90">
        <FairyLights className="relative h-full w-full" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[180px] md:h-[240px]">
        <Toran className="h-full w-full" />
      </div>
      <Kandil className="right-[6%] top-0 hidden md:block" width={110} cord={200} dur={7} />
      <Kandil className="right-[18%] top-0 hidden lg:block" width={76} cord={150} tone={2} dur={5.5} delay={-2} />
      <Kandil className="left-[4%] top-0 hidden lg:block" width={86} cord={170} tone={2} dur={6.3} delay={-1} />
      <PetalRain />

      <div className="relative mx-auto max-w-[1400px] px-6 pt-[260px] md:px-12 md:pt-[420px]">
        <div className="grid items-center gap-16 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <SectionLabel index="03">Golden Moments</SectionLabel>
            <h2 ref={title} className="mt-8 font-display text-[clamp(2.4rem,5vw,4.6rem)] font-light leading-[1.04] text-ivory">
              <Words parts={[{ t: 'The house remembers ' }, { t: 'how to glow.', className: 'italic text-gilded' }]} />
            </h2>
            <p data-reveal className="mt-6 max-w-md leading-relaxed text-sand/80">
              For one night the whole home becomes an offering. Floors are painted, doors are garlanded, and every
              ledge holds a flame.
            </p>

            <ul className="mt-14 space-y-10">
              {NOTES.map((n, i) => (
                <li key={n.name} data-reveal={i * 0.12} className="group grid grid-cols-[auto_1fr] gap-x-6">
                  <span className="mt-1 font-display text-sm italic text-gold/60">0{i + 1}</span>
                  <div>
                    <p className="flex flex-wrap items-baseline gap-x-3">
                      <span className="font-deva text-2xl text-ivory transition-colors duration-700 group-hover:text-gold">{n.deva}</span>
                      <span className="eyebrow">{n.name}</span>
                    </p>
                    <p className="mt-2 max-w-sm text-[0.94rem] leading-relaxed text-sand/75">{n.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex justify-center md:col-span-7">
            <div className="relative" style={{ width: artSize, height: artSize }}>
              <div
                className="pointer-events-none absolute -inset-[20%] rounded-full transition-opacity duration-[2000ms]"
                style={{
                  opacity: ringLit ? 1 : 0.35,
                  background: 'radial-gradient(circle, rgba(255,170,70,.18), rgba(255,120,40,.06) 45%, transparent 68%)',
                }}
              />
              <div ref={art} className="absolute inset-0">
                <Rangoli ref={rangoli} className="h-full w-full drop-shadow-[0_10px_30px_rgba(0,0,0,.5)]" />
              </div>
              {Array.from({ length: ringN }, (_, i) => {
                const a = (i / ringN) * Math.PI * 2 - Math.PI / 2;
                const r = artSize * 0.56;
                return (
                  <div
                    key={i}
                    className="absolute"
                    style={{
                      left: artSize / 2 + Math.cos(a) * r,
                      top: artSize / 2 + Math.sin(a) * r,
                      width: 0,
                      height: 0,
                      zIndex: Math.round(Math.sin(a) * 10 + 20),
                    }}
                  >
                    <Diya
                      size={diyaSize}
                      lit={ringLit}
                      delay={i * 0.12}
                      variant={i % 2 ? 'brass' : 'terracotta'}
                      glowScale={4.5}
                      label="Rangoli diya"
                      style={{ left: -diyaSize / 2, top: -diyaSize * 0.35 }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
