import { memo, useMemo } from 'react';
import { seeded } from '../../lib/motion';
import { quadPoint } from '../../lib/shapes';
import { TwinkleLayers } from './TwinkleLayers';

const LEAF = 'M0 0 C9 10 10 28 0 44 C-10 28 -9 10 0 0Z';
const BELL = 'M-5 0 H5 L6 3 C8 4 9 9 9 13 H-9 C-9 9 -8 4 -6 3Z';

/** Toran: marigold strands and mango leaves hung across a doorway. */
export const Toran = memo(function Toran({ className = '' }) {
  const strands = useMemo(() => {
    const rand = seeded(11);
    const pattern = [8, 4, 6, 3, 9, 4, 6, 3];
    const out = [];
    for (let i = 0, x = 24; x < 1600; i++, x += 56) {
      out.push({
        x,
        n: pattern[i % pattern.length],
        dur: 4.5 + rand() * 3,
        delay: -rand() * 5,
        sway: 1 + rand() * 1.4,
        start: i % 2 ? 'mg-y' : 'mg-o',
      });
    }
    return out;
  }, []);

  return (
    <svg viewBox="0 0 1600 240" preserveAspectRatio="xMidYMin slice" className={className} aria-hidden="true">
      {/* rope */}
      <path d="M0 10 H1600" stroke="url(#brass)" strokeWidth="3" />
      <path d="M0 13 H1600" stroke="#000" strokeOpacity="0.4" strokeWidth="1" />
      {/* mango leaves */}
      {strands.map((s, i) => (
        <g key={`l${i}`} transform={`translate(${s.x + 28} 12)`}>
          <g className="sway" style={{ '--dur': `${s.dur + 1}s`, '--delay': `${s.delay}s`, '--sway': '3deg' }}>
            <path d={LEAF} fill="url(#leaf)" transform="rotate(14)" />
            <path d="M0 2 L0 40" stroke="#9ccf6a" strokeOpacity="0.35" strokeWidth="0.8" transform="rotate(14)" />
            <path d={LEAF} fill="url(#leaf)" transform="rotate(-12) scale(0.9)" />
            <path d="M0 2 L0 38" stroke="#9ccf6a" strokeOpacity="0.35" strokeWidth="0.8" transform="rotate(-12)" />
          </g>
        </g>
      ))}
      {/* marigold strands */}
      {strands.map((s, i) => (
        <g key={`s${i}`} transform={`translate(${s.x} 10)`}>
          <g className="sway" style={{ '--dur': `${s.dur}s`, '--delay': `${s.delay}s`, '--sway': `${s.sway}deg` }}>
            <line x1="0" y1="0" x2="0" y2={s.n * 19 + 8} stroke="#5a3a10" strokeWidth="1" />
            {Array.from({ length: s.n }, (_, j) => (
              <use
                key={j}
                href={`#${(j % 2 === 0) === (s.start === 'mg-o') ? 'mg-o' : 'mg-y'}`}
                x={-11}
                y={10 + j * 19 - 11}
                width="22"
                height="22"
              />
            ))}
            <g transform={`translate(0 ${s.n * 19 + 6})`}>
              <path d={BELL} fill="url(#brass)" />
              <circle cx="0" cy="15" r="2" fill="#c58a2c" />
            </g>
          </g>
        </g>
      ))}
    </svg>
  );
});

/** Strings of warm bulbs hanging in catenary-like curves. */
export const FairyLights = memo(function FairyLights({ className = '', strings = 2, seed = 5 }) {
  const lines = useMemo(() => {
    const rand = seeded(seed);
    return Array.from({ length: strings }, (_, k) => {
      const y0 = 30 + k * 70;
      const sag = 90 + k * 40;
      const p0 = [-20, y0];
      const p1 = [800, y0 + sag * 2];
      const p2 = [1620, y0 + 10];
      const bulbs = [];
      const n = 46;
      for (let i = 1; i < n; i++) {
        const [x, y] = quadPoint(p0, p1, p2, i / n);
        bulbs.push({
          x,
          y,
          c: ['#fff1c8', '#ffd76a', '#ffb547', '#ff9a4a'][(rand() * 4) | 0],
          dur: 1.8 + rand() * 3.2,
          delay: -rand() * 4,
        });
      }
      return { d: `M${p0[0]} ${p0[1]} Q${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]}`, bulbs };
    });
  }, [strings, seed]);

  const bulbs = useMemo(() => lines.flatMap((l) => l.bulbs), [lines]);
  const view = '0 0 1600 420';
  const par = 'xMidYMin slice';

  // Wires and caps are static; only the glowing glass twinkles, in composited layers.
  return (
    <div className={className} aria-hidden="true">
      <svg viewBox={view} preserveAspectRatio={par} className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="bulb-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffd38a" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ff9a40" stopOpacity="0" />
          </radialGradient>
        </defs>
        {lines.map((l, k) => (
          <path key={k} d={l.d} fill="none" stroke="#1e1a14" strokeWidth="1.4" />
        ))}
      </svg>
      <TwinkleLayers
        items={bulbs}
        layers={5}
        min={0.45}
        speed={0.9}
        viewBox={view}
        preserveAspectRatio={par}
        render={(b, i) => (
          <g key={i}>
            <circle cx={b.x} cy={b.y + 5} r="16" fill="url(#bulb-halo)" />
            <ellipse cx={b.x} cy={b.y + 5} rx="2.6" ry="3.6" fill={b.c} />
            <rect x={b.x - 1.5} y={b.y - 1} width="3" height="3" fill="#3a2a14" />
          </g>
        )}
      />
    </div>
  );
});

/** Akash kandil: a folded-paper star lantern with paper tails. */
export function Kandil({ className = '', style, width = 120, cord = 120, tone = 1, dur = 6, delay = 0 }) {
  const paper = tone === 1 ? 'url(#kandil-paper)' : 'url(#kandil-paper-2)';
  const pts = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 ? 30 : 56;
    pts.push([60 + Math.cos(a) * r, 130 + Math.sin(a) * r]);
  }
  const star = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('') + 'Z';
  const tailColors = ['#c8342a', '#ffb547', '#e2541b', '#ffd76a', '#c8342a'];

  return (
    <div
      className={`sway pointer-events-none absolute ${className}`}
      style={{
        width,
        height: (width * (cord + 330)) / 120,
        '--dur': `${dur}s`,
        '--delay': `${delay}s`,
        '--sway': '2.4deg',
        transformOrigin: '50% 0',
        ...style,
      }}
      aria-hidden="true"
    >
      <svg viewBox={`0 ${-cord} 120 ${cord + 330}`} className="h-full w-full overflow-visible">
        <line x1="60" y1={-cord} x2="60" y2="70" stroke="#4a3418" strokeWidth="1.2" />
        <circle cx="60" cy="130" r="120" fill="url(#bulb-halo-k)" />
        <defs>
          <radialGradient id="bulb-halo-k" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffb456" stopOpacity="0.4" />
            <stop offset="0.5" stopColor="#ff7a2a" stopOpacity="0.1" />
            <stop offset="1" stopColor="#ff7a2a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d="M52 66 H68 L72 76 H48Z" fill="url(#brass)" />
        <path d={star} fill={paper} stroke="#ffd76a" strokeWidth="1.2" strokeOpacity="0.8" />
        {/* folds: shade one side of every point */}
        {pts.map((p, i) =>
          i % 2 === 0 ? (
            <path
              key={i}
              d={`M60 130 L${p[0].toFixed(1)} ${p[1].toFixed(1)} L${pts[(i + 1) % 12][0].toFixed(1)} ${pts[(i + 1) % 12][1].toFixed(1)}Z`}
              fill="#3a0806"
              opacity="0.28"
            />
          ) : null
        )}
        <circle cx="60" cy="130" r="18" fill="#fff4cf" opacity="0.85" />
        <circle cx="60" cy="130" r="26" fill="none" stroke="#ffd76a" strokeOpacity="0.55" strokeDasharray="2 4" />
        {/* tails */}
        <g className="sway" style={{ '--dur': `${dur * 0.7}s`, '--delay': `${delay - 1}s`, '--sway': '4deg' }}>
          {tailColors.map((c, i) => {
            const x = 44 + i * 8;
            const len = 120 + Math.abs(2 - i) * -18 + 30;
            return <path key={i} d={`M${x} 186 q3 ${len / 2} 0 ${len}`} stroke={c} strokeWidth="5" fill="none" opacity="0.9" />;
          })}
          <path d="M40 180 H80 L76 190 H44Z" fill="url(#brass)" />
        </g>
      </svg>
    </div>
  );
}

/** Marigold petals drifting down. CSS-only, cheap, paused off-screen by parent. */
export const PetalRain = memo(function PetalRain({ count = 14, className = '' }) {
  const petals = useMemo(() => {
    const rand = seeded(23);
    return Array.from({ length: count }, () => ({
      left: rand() * 100,
      size: 8 + rand() * 10,
      dur: 12 + rand() * 10,
      delay: -rand() * 20,
      drift: (rand() - 0.5) * 160,
      spin: 360 + rand() * 540,
      sway: 2 + rand() * 2,
      color: rand() > 0.5 ? '#ff9a2a' : '#ffc23a',
    }));
  }, [count]);
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {petals.map((p, i) => (
        <span
          key={i}
          className="absolute top-0"
          style={{
            left: `${p.left}%`,
            animation: `petal-fall ${p.dur}s linear ${p.delay}s infinite`,
            '--drift': `${p.drift}px`,
            '--spin': `${p.spin}deg`,
          }}
        >
          <span className="block" style={{ animation: `petal-sway ${p.sway}s ease-in-out ${p.delay}s infinite alternate` }}>
            <svg width={p.size} height={p.size * 1.3} viewBox="0 0 10 13">
              <path d="M5 0 C9 3 10 8 5 13 C0 8 1 3 5 0Z" fill={p.color} opacity="0.85" />
              <path d="M5 1 L5 12" stroke="#a8460a" strokeOpacity="0.3" strokeWidth="0.5" />
            </svg>
          </span>
        </span>
      ))}
    </div>
  );
});
