import { forwardRef, memo } from 'react';

const rot = (n, fn) => Array.from({ length: n }, (_, i) => fn((360 / n) * i, i));

const P_INNER = 'M0 -90 C20 -78 23 -58 0 -44 C-23 -58 -20 -78 0 -90Z';
const P_BIG = 'M0 -184 C64 -162 68 -118 0 -100 C-68 -118 -64 -162 0 -184Z';
const P_BIG_IN = 'M0 -170 C34 -154 36 -126 0 -114 C-36 -126 -34 -154 0 -170Z';
const DIAMOND = 'M0 -162 L10 -146 L0 -130 L-10 -146Z';
const P_LOTUS = 'M0 -274 C34 -252 40 -224 0 -198 C-40 -224 -34 -252 0 -274Z';
const P_LOTUS_IN = 'M0 -258 C16 -246 18 -230 0 -214 C-18 -230 -16 -246 0 -258Z';
const DROP = 'M0 -262 C7 -252 7 -244 0 -238 C-7 -244 -7 -252 0 -262Z';

const IVORY = '#fbf1dc';

/** Each shape is outlined with `.rg` so it can be "poured" (stroke) then "filled" (powder). */
function Shape({ d, fill, a = 0, sw = 1.4, stroke = IVORY }) {
  return (
    <path
      className="rg"
      d={d}
      transform={`rotate(${a})`}
      pathLength="1"
      fill={fill}
      stroke={stroke}
      strokeWidth={sw}
      strokeLinejoin="round"
      strokeDasharray="1"
      strokeDashoffset="1"
      style={{ fillOpacity: 0 }}
    />
  );
}

function Ring({ r, stroke = IVORY, sw = 2, fill = 'none' }) {
  return (
    <circle
      className="rg"
      r={r}
      pathLength="1"
      fill={fill}
      stroke={stroke}
      strokeWidth={sw}
      strokeDasharray="1"
      strokeDashoffset="1"
      transform="rotate(-90)"
      style={{ fillOpacity: 0 }}
    />
  );
}

/** Order is centre -> outward, matching how rangoli is laid by hand. */
const Rangoli = forwardRef(function Rangoli({ className = '' }, ref) {
  return (
    <svg ref={ref} viewBox="-300 -300 600 600" className={className} aria-hidden="true">
      <g>
        <Ring r={38} fill="url(#rg-red)" sw={2} />
        <Ring r={24} fill="url(#rg-gold)" sw={1.4} />
        <Ring r={10} fill={IVORY} sw={1} />
        {rot(8, (a) => (
          <circle key={a} className="rg-dot" cx="0" cy="-31" r="2.6" fill={IVORY} transform={`rotate(${a})`} />
        ))}
        {rot(12, (a, i) => (
          <Shape key={a} d={P_INNER} a={a} fill={i % 2 ? 'url(#rg-saffron)' : 'url(#rg-gold)'} />
        ))}
        <Ring r={96} stroke="#ff9a3a" sw={9} />
        {rot(24, (a) => (
          <circle key={a} className="rg-dot" cx="0" cy="-96" r="2.2" fill={IVORY} transform={`rotate(${a + 7.5})`} />
        ))}
        {rot(8, (a, i) => (
          <g key={a}>
            <Shape d={P_BIG} a={a} fill={i % 2 ? 'url(#rg-teal)' : 'url(#rg-magenta)'} sw={1.6} />
            <Shape d={P_BIG_IN} a={a} fill="url(#rg-gold)" sw={1} />
            <circle className="rg-dot" cx="0" cy="-140" r="4" fill={IVORY} transform={`rotate(${a})`} />
          </g>
        ))}
        {rot(8, (a) => (
          <Shape key={a} d={DIAMOND} a={a + 22.5} fill="url(#rg-saffron)" sw={1} />
        ))}
        <Ring r={190} sw={3} />
        <Ring r={184} stroke="#ffd76a" sw={1} />
        {rot(16, (a, i) => (
          <g key={a}>
            <Shape d={P_LOTUS} a={a} fill={i % 2 ? 'url(#rg-red)' : 'url(#rg-saffron)'} sw={1.5} />
            <Shape d={P_LOTUS_IN} a={a} fill={i % 2 ? 'url(#rg-gold)' : 'url(#rg-red)'} sw={0.8} />
          </g>
        ))}
        {rot(16, (a) => (
          <Shape key={a} d={DROP} a={a + 11.25} fill="url(#rg-gold)" sw={0.8} />
        ))}
        <Ring r={282} stroke="#ffd76a" sw={1} />
        {rot(72, (a) => (
          <circle key={a} className="rg-dot" cx="0" cy="-290" r="2.4" fill={IVORY} transform={`rotate(${a})`} />
        ))}
      </g>
    </svg>
  );
});

export default memo(Rangoli);
