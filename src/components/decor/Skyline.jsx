import { memo, useMemo } from 'react';
import { archWindow, dome, minaret, parapet, rect, shikhara } from '../../lib/shapes';
import { seeded } from '../../lib/motion';
import { TwinkleLayers } from './TwinkleLayers';

const VIEW = '0 0 1600 360';
const PAR = 'xMidYMax slice';

/* A festive Indian cityscape: palace, minarets, temple towers and lit windows. */

const FAR =
  shikhara(150, 330, 120, 210) +
  rect(60, 260, 240, 80) +
  dome(420, 280, 90, 80) +
  rect(360, 280, 120, 60) +
  shikhara(1210, 330, 110, 190) +
  rect(1120, 270, 200, 70) +
  dome(1450, 270, 110, 96) +
  rect(1380, 270, 140, 70) +
  shikhara(1560, 330, 80, 140) +
  rect(0, 300, 1600, 60);

const NEAR =
  // left quarter
  rect(0, 258, 190, 102) +
  parapet(0, 258, 190) +
  dome(95, 252, 88, 76) +
  rect(70, 246, 50, 6) +
  minaret(214, 360, 20, 196) +
  rect(232, 276, 170, 84) +
  parapet(232, 276, 170, 7, 6, 5) +
  dome(276, 276, 40, 36) +
  dome(358, 276, 40, 36) +
  // palace
  rect(520, 222, 560, 138) +
  parapet(520, 222, 560, 9, 7, 7) +
  rect(640, 172, 320, 50) +
  parapet(640, 172, 320, 8, 6, 6) +
  rect(742, 136, 116, 36) +
  dome(800, 136, 176, 172) +
  dome(684, 166, 80, 72) +
  dome(916, 166, 80, 72) +
  dome(560, 216, 46, 40) +
  dome(1040, 216, 46, 40) +
  minaret(504, 360, 26, 250) +
  minaret(1096, 360, 26, 250) +
  // in-between houses
  rect(402, 296, 92, 64) +
  rect(1120, 290, 96, 70) +
  // right quarter
  rect(1216, 268, 170, 92) +
  parapet(1216, 268, 170) +
  dome(1301, 262, 70, 62) +
  minaret(1394, 360, 20, 180) +
  rect(1410, 244, 190, 116) +
  parapet(1410, 244, 190) +
  dome(1505, 238, 96, 84) +
  rect(0, 344, 1600, 16);

function buildWindows() {
  const w = [];
  for (let i = 0; i < 9; i++) w.push([548 + i * 58, 276, 20, 40]);
  for (let i = 0; i < 6; i++) w.push([664 + i * 50, 186, 14, 26]);
  w.push([786, 146, 28, 22]);
  for (let i = 0; i < 4; i++) w.push([18 + i * 44, 290, 14, 26]);
  for (let i = 0; i < 4; i++) w.push([248 + i * 40, 302, 12, 22]);
  for (let i = 0; i < 3; i++) w.push([1236 + i * 52, 300, 14, 26]);
  for (let i = 0; i < 4; i++) w.push([1430 + i * 44, 280, 14, 28]);
  w.push([420, 316, 12, 20], [452, 316, 12, 20], [1140, 312, 12, 20], [1176, 312, 12, 20]);
  return w;
}

function Skyline({ className = '', style, idPrefix = 'sky', lights = true }) {
  const { windows, bulbs } = useMemo(() => {
    const rand = seeded(42);
    const windows = buildWindows().map(([x, y, ww, hh]) => ({
      d: archWindow(x, y, ww, hh),
      cx: x + ww / 2,
      cy: y + hh / 2,
      r: Math.max(ww, hh) * 1.3,
      flicker: rand() > 0.6,
      dur: 2.5 + rand() * 4,
      delay: -rand() * 6,
      dim: 0.55 + rand() * 0.45,
    }));
    const bulbs = [];
    const lines = [
      [520, 1080, 216],
      [640, 960, 166],
      [0, 190, 252],
      [1216, 1386, 262],
      [1410, 1600, 238],
      [232, 402, 270],
    ];
    for (const [x0, x1, y] of lines) {
      for (let x = x0 + 6; x < x1; x += 13) bulbs.push({ x, y: y - 9, d: -rand() * 3, dur: 1.6 + rand() * 2.2 });
    }
    return { windows, bulbs };
  }, []);

  const p = idPrefix;
  const flickering = windows.filter((w) => w.flicker);
  return (
    <div className={className} style={style} aria-hidden="true">
    <svg viewBox={VIEW} preserveAspectRatio={PAR} className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id={`${p}-far`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#141833" />
          <stop offset="1" stopColor="#0b0d1e" />
        </linearGradient>
        <linearGradient id={`${p}-near`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b0c1a" />
          <stop offset="1" stopColor="#040409" />
        </linearGradient>
        <radialGradient id={`${p}-win`} cx="50%" cy="60%" r="60%">
          <stop offset="0" stopColor="#ffe6a8" />
          <stop offset="0.6" stopColor="#ffab45" />
          <stop offset="1" stopColor="#d2601c" />
        </radialGradient>
        <radialGradient id={`${p}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffb456" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ff8a30" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${p}-rim`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb766" stopOpacity="0.35" />
          <stop offset="0.12" stopColor="#ffb766" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={FAR} fill={`url(#${p}-far)`} opacity="0.9" />
      <path d={NEAR} fill={`url(#${p}-near)`} />
      {/* warm rim light catching the edges, as if lit from the street */}
      <path d={NEAR} fill={`url(#${p}-rim)`} style={{ mixBlendMode: 'screen' }} />
      {lights && (
        <>
          <g style={{ mixBlendMode: 'screen' }}>
            {windows.map((w, i) => (
              <circle key={i} cx={w.cx} cy={w.cy} r={w.r} fill={`url(#${p}-halo)`} opacity={w.dim} />
            ))}
          </g>
          {windows.map((w, i) =>
            w.flicker ? null : <path key={i} d={w.d} fill={`url(#${p}-win)`} opacity={w.dim} />
          )}
        </>
      )}
    </svg>
      {lights && (
        <>
          <TwinkleLayers
            items={flickering}
            layers={3}
            min={0.55}
            speed={1.4}
            viewBox={VIEW}
            preserveAspectRatio={PAR}
            render={(w, i) => <path key={i} d={w.d} fill={`url(#${p}-win)`} />}
          />
          <TwinkleLayers
            items={bulbs}
            layers={4}
            min={0.35}
            speed={0.85}
            viewBox={VIEW}
            preserveAspectRatio={PAR}
            render={(b, i) => <circle key={i} cx={b.x} cy={b.y} r="1.8" fill={i % 3 === 0 ? '#fff1c4' : '#ffc061'} />}
          />
        </>
      )}
    </div>
  );
}

export default memo(Skyline);
