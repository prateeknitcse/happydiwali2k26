import { memo, useEffect, useMemo, useRef } from 'react';
import { gsap, prefersReducedMotion, seeded } from '../../lib/motion';
import { TwinkleLayers } from './TwinkleLayers';

const VIEW = '0 0 1600 900';
const PAR = 'xMidYMid slice';

/**
 * New-moon sky: Diwali falls on Amavasya, so the stars are the only other lights.
 * The wrapper must be positioned by the caller (absolute or relative).
 */
export const Stars = memo(function Stars({ count = 140, seed = 7, className = '' }) {
  const stars = useMemo(() => {
    const rand = seeded(seed);
    return Array.from({ length: count }, () => {
      const y = Math.pow(rand(), 1.6) * 640;
      return {
        x: rand() * 1600,
        y,
        r: 0.4 + Math.pow(rand(), 3) * 1.6,
        o: 0.25 + rand() * 0.6 * (1 - y / 800),
        tw: rand() > 0.72,
        dur: 2 + rand() * 5,
        delay: -rand() * 6,
      };
    });
  }, [count, seed]);
  const fill = (i) => (i % 5 ? '#fff6e2' : '#ffd9a0');
  const steady = stars.map((s, i) => ({ ...s, i })).filter((s) => !s.tw);
  const twinkling = stars.map((s, i) => ({ ...s, i })).filter((s) => s.tw);
  return (
    <div className={className} aria-hidden="true">
      <svg viewBox={VIEW} preserveAspectRatio={PAR} className="absolute inset-0 h-full w-full">
        {steady.map((s) => (
          <circle key={s.i} cx={s.x} cy={s.y} r={s.r} fill={fill(s.i)} opacity={s.o} />
        ))}
      </svg>
      <TwinkleLayers
        items={twinkling}
        layers={5}
        min={0.15}
        speed={1.15}
        viewBox={VIEW}
        preserveAspectRatio={PAR}
        render={(s) => <circle key={s.i} cx={s.x} cy={s.y} r={s.r} fill={fill(s.i)} />}
      />
    </div>
  );
});

const BEAMS = [
  { a: -34, w: 9, o: 0.5 },
  { a: -19, w: 14, o: 0.7 },
  { a: -6, w: 7, o: 0.55 },
  { a: 5, w: 16, o: 0.8 },
  { a: 17, w: 8, o: 0.5 },
  { a: 31, w: 12, o: 0.6 },
];

/** Volumetric light falling from above; each beam breathes on its own cycle. */
export const LightRays = memo(function LightRays({ className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.beam', ref.current).forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0.25 },
          { opacity: 1, duration: 5 + i * 1.3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.7 }
        );
      });
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <div ref={ref} className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div className="absolute left-1/2 top-[-8%] h-0 w-0">
        {BEAMS.map((b, i) => (
          <div key={i} className="absolute left-0 top-0" style={{ transform: `rotate(${b.a}deg)`, transformOrigin: '0 0' }}>
            <div
              className="beam absolute"
              style={{
                left: `${-b.w / 2}vw`,
                width: `${b.w}vw`,
                height: '125vh',
                opacity: b.o,
                filter: 'blur(22px)',
                // own layer: the blur is rasterised once, the opacity tween is composited
                willChange: 'opacity',
                mixBlendMode: 'screen',
                clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)',
                background: `linear-gradient(to bottom, rgba(255,222,150,${0.2 * b.o}), rgba(255,180,90,${0.09 * b.o}) 45%, transparent 88%)`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

/** Small gold ornament used as a typographic divider. */
export function Ornament({ className = '' }) {
  return (
    <svg viewBox="0 0 220 24" className={className} aria-hidden="true">
      <g fill="none" stroke="#ffd76a" strokeWidth="1" opacity="0.75">
        <path d="M0 12 H86" strokeOpacity="0.5" />
        <path d="M134 12 H220" strokeOpacity="0.5" />
        <path d="M110 2 C116 8 120 12 110 22 C100 12 104 8 110 2Z" fill="#ffd76a" fillOpacity="0.85" stroke="none" />
        <path d="M96 12 C100 8 104 8 106 12 C104 16 100 16 96 12Z" />
        <path d="M124 12 C120 8 116 8 114 12 C116 16 120 16 124 12Z" />
        <circle cx="90" cy="12" r="1.6" fill="#ffd76a" stroke="none" />
        <circle cx="130" cy="12" r="1.6" fill="#ffd76a" stroke="none" />
      </g>
    </svg>
  );
}
