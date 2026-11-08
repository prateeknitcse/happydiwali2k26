import { memo } from 'react';

const ring = (n, fn) => Array.from({ length: n }, (_, i) => fn((360 / n) * i, i));

const PETAL_S = 'M0 -92 C14 -112 16 -138 0 -158 C-16 -138 -14 -112 0 -92Z';
const ARCH = 'M-18 -166 C-18 -200 -6 -222 0 -246 C6 -222 18 -200 18 -166';
const LOTUS = 'M0 -330 C40 -350 52 -392 0 -428 C-52 -392 -40 -350 0 -330Z';
const LOTUS_IN = 'M0 -344 C22 -360 28 -386 0 -410 C-28 -386 -22 -360 0 -344Z';
const SCALLOP = 'M-22 -470 Q0 -500 22 -470';

const VB = '-520 -520 1040 1040';

/**
 * Fine-line gold mandala; the two halves counter-rotate very slowly.
 * Each half is its own <svg> so the rotation runs on the compositor
 * (rotating a <g> inside one SVG would re-rasterise it every frame).
 * The wrapper must be positioned by the caller (absolute or relative).
 */
function Mandala({ className = '', style }) {
  return (
    <div className={className} style={style} aria-hidden="true">
      <svg viewBox={VB} className="spin-layer" style={{ '--dur': '240s' }}>
        <g fill="none" stroke="#ffd76a" strokeWidth="1" vectorEffect="non-scaling-stroke">
          <circle r="500" opacity="0.25" />
          <circle r="470" opacity="0.4" />
          {ring(48, (a) => (
            <path key={a} d={SCALLOP} transform={`rotate(${a})`} opacity="0.5" />
          ))}
          {ring(96, (a) => (
            <circle key={a} cx="0" cy="-486" r="1.6" transform={`rotate(${a})`} fill="#ffd76a" stroke="none" opacity="0.55" />
          ))}
          {ring(16, (a) => (
            <g key={a} transform={`rotate(${a})`}>
              <path d={LOTUS} opacity="0.55" />
              <path d={LOTUS_IN} opacity="0.35" />
              <line x1="0" y1="-330" x2="0" y2="-300" opacity="0.4" />
            </g>
          ))}
          <circle r="330" opacity="0.45" />
          <circle r="300" opacity="0.25" strokeDasharray="2 6" />
        </g>
      </svg>
      <svg viewBox={VB} className="spin-layer" style={{ '--dur': '180s', '--dir': 'reverse' }}>
        <g fill="none" stroke="#ffd76a" strokeWidth="1" vectorEffect="non-scaling-stroke">
          {ring(36, (a) => (
            <circle key={a} cx="0" cy="-280" r="3" transform={`rotate(${a})`} opacity="0.5" />
          ))}
          <circle r="256" opacity="0.4" />
          {ring(24, (a) => (
            <path key={a} d={ARCH} transform={`rotate(${a})`} opacity="0.55" />
          ))}
          <circle r="166" opacity="0.5" />
          {ring(12, (a) => (
            <path key={a} d={PETAL_S} transform={`rotate(${a + 15})`} opacity="0.6" />
          ))}
          <circle r="92" opacity="0.5" />
          <circle r="60" opacity="0.3" strokeDasharray="1 5" />
          {ring(8, (a) => (
            <line key={a} x1="0" y1="-20" x2="0" y2="-88" transform={`rotate(${a})`} opacity="0.35" />
          ))}
          <circle r="18" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
}

export default memo(Mandala);
