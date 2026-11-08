import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion, ScrollTrigger } from '../lib/motion';
import Diya from '../components/Diya';
import { Ornament } from '../components/decor/Atmosphere';
import { FlameMark } from '../components/Nav';
import { SectionLabel, useFadeReveal, useWordReveal, Words } from '../components/Typography';

const WISHES = [
  {
    deva: 'प्रकाश',
    name: 'Prakash',
    meaning: 'Light',
    text: 'May the lamps you light tonight keep burning somewhere inside you, long after the oil runs out.',
  },
  {
    deva: 'समृद्धि',
    name: 'Samriddhi',
    meaning: 'Abundance',
    text: 'May Lakshmi find her way to your door by the rangoli you drew, and decide to stay a while.',
  },
  {
    deva: 'आनंद',
    name: 'Anand',
    meaning: 'Joy',
    text: 'May the laughter in your home be louder than the crackers, and last longer than the sweets.',
  },
  {
    deva: 'प्रेम',
    name: 'Prem',
    meaning: 'Love',
    text: 'May the people you love be close tonight, and the ones far away feel near enough to touch.',
  },
];

const MARQUEE = ['Shubh Deepavali', 'Prakash', 'Samriddhi', 'Anand', 'Prem', 'Shanti'];

function Marquee() {
  const track = useRef(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = track.current;
    let x = 0;
    let speed = 1;
    let half = el.scrollWidth / 2;
    const ro = new ResizeObserver(() => (half = el.scrollWidth / 2));
    ro.observe(el);
    const tick = (_, dt) => {
      x -= 0.035 * speed * dt;
      if (-x >= half) x += half;
      el.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
      speed += (1 - speed) * 0.05;
    };
    gsap.ticker.add(tick);
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        speed = 1 + Math.min(8, Math.abs(self.getVelocity()) / 250);
      },
    });
    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      st.kill();
    };
  }, []);

  const row = (
    <>
      {MARQUEE.map((w, i) => (
        <span key={w} className="flex shrink-0 items-center">
          <span
            className={`px-8 font-display text-[clamp(3.2rem,8vw,7.5rem)] leading-none md:px-12 ${
              i % 2 ? 'italic text-gold/90' : 'text-transparent'
            }`}
            style={i % 2 ? undefined : { WebkitTextStroke: '1px rgba(255,215,106,.45)' }}
          >
            {w}
          </span>
          <FlameMark className="h-8 w-6 opacity-80" />
        </span>
      ))}
    </>
  );

  return (
    <div className="relative overflow-hidden py-6" aria-hidden="true">
      <div ref={track} className="flex w-max will-change-transform">
        {row}
        {row}
      </div>
    </div>
  );
}

function Wish({ w, i }) {
  return (
    <article data-reveal={(i % 2) * 0.15} className="group relative pt-8">
      <div className="hairline absolute inset-x-0 top-0 opacity-60" />
      <div className="flex items-start justify-between gap-6">
        <span className="font-display text-sm italic text-gold/60">0{i + 1}</span>
        <span className="eyebrow">{w.meaning}</span>
      </div>
      <h3 className="mt-6 flex items-end gap-4">
        <span className="font-deva text-[clamp(2.8rem,5vw,4.4rem)] leading-[1.1] text-ivory transition-[color,text-shadow] duration-700 ease-[var(--ease-silk)] group-hover:text-gold group-hover:[text-shadow:0_0_30px_rgba(255,180,80,.45)]">
          {w.deva}
        </span>
        <span className="mb-3 font-display text-xl italic text-ivory/55">{w.name}</span>
      </h3>
      <p className="mt-5 max-w-sm text-[0.98rem] leading-relaxed text-sand/85">{w.text}</p>
      <span className="absolute -left-1 top-[4.8rem] h-1.5 w-1.5 rounded-full bg-gold opacity-0 shadow-[0_0_14px_4px_rgba(255,180,80,.55)] transition-opacity duration-700 group-hover:opacity-100 md:-left-6" />
    </article>
  );
}

export default function Wishes() {
  const statement = useRef(null);
  const section = useRef(null);
  useWordReveal(statement, { stagger: 0.03 });
  useFadeReveal(section);

  return (
    <section id="wishes" ref={section} className="relative overflow-hidden bg-night pb-24 pt-32 md:pb-36 md:pt-48">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(50% 40% at 88% 18%, rgba(255,150,60,.10), transparent 70%), radial-gradient(40% 40% at 0% 80%, rgba(200,52,42,.08), transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-12">
        <SectionLabel index="01">
          Festival Wishes
        </SectionLabel>

        <div className="relative mt-14 grid gap-12 md:mt-20 md:grid-cols-12">
          <h2
            ref={statement}
            className="font-display text-[clamp(2.1rem,4.6vw,4.4rem)] font-light leading-[1.08] tracking-[-0.01em] text-ivory md:col-span-10"
          >
            <Words
              parts={[
                { t: 'This Diwali, may every doorway you cross be lit, every hand you hold be warm, and every quiet corner of your life hold ' },
                { t: 'a little light.', className: 'italic text-gilded' },
              ]}
            />
          </h2>
          <div className="relative hidden md:col-span-2 md:block">
            <div className="absolute bottom-6 left-1/2" style={{ width: 0 }}>
              <Diya size={120} lit variant="brass" glowScale={6.5} label="Brass diya" style={{ left: -60, bottom: 0 }} />
            </div>
          </div>
        </div>

        <Ornament className="mt-20 h-6 w-56 md:mt-28" />

        <div className="mt-16 grid gap-x-20 gap-y-16 md:mt-20 md:grid-cols-2 lg:gap-x-32">
          {WISHES.map((w, i) => (
            <div key={w.name} className={i % 2 ? 'md:translate-y-28' : ''}>
              <Wish w={w} i={i} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-28 md:mt-52">
        <Marquee />
      </div>
    </section>
  );
}
