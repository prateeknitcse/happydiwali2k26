import { ruffle } from '../lib/shapes';

/**
 * Shared gradients referenced by every diya, flame and decoration.
 * Declared once so dozens of lamps don't duplicate <defs>.
 */
export default function SvgDefs() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs>
        {/* Flame */}
        <radialGradient id="flame-outer" cx="50%" cy="80%" r="75%" fx="50%" fy="88%">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset="0.3" stopColor="#ffc54d" />
          <stop offset="0.62" stopColor="#ff8a24" stopOpacity="0.92" />
          <stop offset="0.86" stopColor="#e3561a" stopOpacity="0.45" />
          <stop offset="1" stopColor="#c23a10" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="flame-mid" cx="50%" cy="82%" r="70%">
          <stop offset="0" stopColor="#fffdf2" />
          <stop offset="0.45" stopColor="#ffe594" />
          <stop offset="1" stopColor="#ffb238" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="flame-core" cx="50%" cy="70%" r="60%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#fff8e0" />
          <stop offset="1" stopColor="#ffeab0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="flame-blue" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#8aa6ff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#5470ff" stopOpacity="0" />
        </radialGradient>

        {/* Terracotta diya */}
        <linearGradient id="diya-body-t" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9763e" />
          <stop offset="0.38" stopColor="#ab4720" />
          <stop offset="0.75" stopColor="#6e2611" />
          <stop offset="1" stopColor="#3b1207" />
        </linearGradient>
        <linearGradient id="diya-rim-t" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2a56b" />
          <stop offset="0.5" stopColor="#c8643a" />
          <stop offset="1" stopColor="#8d3416" />
        </linearGradient>
        <linearGradient id="diya-foot-t" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a1c0b" />
          <stop offset="1" stopColor="#2a0b04" />
        </linearGradient>

        {/* Brass diya */}
        <linearGradient id="diya-body-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe08e" />
          <stop offset="0.3" stopColor="#d9a23f" />
          <stop offset="0.7" stopColor="#8a5714" />
          <stop offset="1" stopColor="#3e2406" />
        </linearGradient>
        <linearGradient id="diya-rim-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff1c2" />
          <stop offset="0.5" stopColor="#e2b052" />
          <stop offset="1" stopColor="#9a6418" />
        </linearGradient>
        <linearGradient id="diya-foot-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a4a10" />
          <stop offset="1" stopColor="#2e1804" />
        </linearGradient>

        {/* Shared shading */}
        <linearGradient id="diya-shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.62" />
          <stop offset="0.22" stopColor="#000" stopOpacity="0.08" />
          <stop offset="0.42" stopColor="#fff2d8" stopOpacity="0.1" />
          <stop offset="0.62" stopColor="#000" stopOpacity="0" />
          <stop offset="0.85" stopColor="#000" stopOpacity="0.3" />
          <stop offset="1" stopColor="#000" stopOpacity="0.7" />
        </linearGradient>
        <radialGradient id="diya-oil" cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="#8a5212" />
          <stop offset="0.55" stopColor="#4a2408" />
          <stop offset="1" stopColor="#1e0c03" />
        </radialGradient>
        <radialGradient id="diya-rimlight" cx="50%" cy="10%" r="75%">
          <stop offset="0" stopColor="#ffe2a0" stopOpacity="0.95" />
          <stop offset="0.5" stopColor="#ffb65c" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ff9a40" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="diya-bodylight" cx="50%" cy="0%" r="80%">
          <stop offset="0" stopColor="#ffc77a" stopOpacity="0.55" />
          <stop offset="0.6" stopColor="#ff9a48" stopOpacity="0.12" />
          <stop offset="1" stopColor="#ff9a48" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="diya-oilglint" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff1c0" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffb040" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="diya-contact" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#000" stopOpacity="0.75" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>

        {/* Marigold */}
        <radialGradient id="mari-o" cx="45%" cy="40%" r="65%">
          <stop offset="0" stopColor="#ffc35a" />
          <stop offset="0.55" stopColor="#ff8a1c" />
          <stop offset="1" stopColor="#b8460a" />
        </radialGradient>
        <radialGradient id="mari-y" cx="45%" cy="40%" r="65%">
          <stop offset="0" stopColor="#ffe788" />
          <stop offset="0.55" stopColor="#ffbe2e" />
          <stop offset="1" stopColor="#c27a0c" />
        </radialGradient>
        <linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4f8a33" />
          <stop offset="1" stopColor="#173a17" />
        </linearGradient>
        <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe9a8" />
          <stop offset="0.5" stopColor="#c58a2c" />
          <stop offset="1" stopColor="#5e3a0c" />
        </linearGradient>

        {/* Lantern paper */}
        <radialGradient id="kandil-paper" cx="50%" cy="50%" r="60%">
          <stop offset="0" stopColor="#fff2c6" />
          <stop offset="0.35" stopColor="#ffb14a" />
          <stop offset="0.8" stopColor="#d2401f" />
          <stop offset="1" stopColor="#7d1a10" />
        </radialGradient>
        <radialGradient id="kandil-paper-2" cx="50%" cy="50%" r="60%">
          <stop offset="0" stopColor="#fff5d4" />
          <stop offset="0.4" stopColor="#ffd76a" />
          <stop offset="0.85" stopColor="#e07a1c" />
          <stop offset="1" stopColor="#8a3b0c" />
        </radialGradient>

        {/* Rangoli powders */}
        <radialGradient id="rg-saffron" cx="50%" cy="50%" r="70%">
          <stop offset="0" stopColor="#ffb44d" />
          <stop offset="1" stopColor="#e9671a" />
        </radialGradient>
        <radialGradient id="rg-red" cx="50%" cy="50%" r="70%">
          <stop offset="0" stopColor="#e9503e" />
          <stop offset="1" stopColor="#a8221c" />
        </radialGradient>
        <radialGradient id="rg-magenta" cx="50%" cy="50%" r="70%">
          <stop offset="0" stopColor="#d6407a" />
          <stop offset="1" stopColor="#8a1748" />
        </radialGradient>
        <radialGradient id="rg-gold" cx="50%" cy="50%" r="70%">
          <stop offset="0" stopColor="#ffe28a" />
          <stop offset="1" stopColor="#d99a2b" />
        </radialGradient>
        <radialGradient id="rg-teal" cx="50%" cy="50%" r="70%">
          <stop offset="0" stopColor="#3fb3a2" />
          <stop offset="1" stopColor="#156b63" />
        </radialGradient>

        <Marigold id="mg-o" fill="url(#mari-o)" edge="#7a2a04" />
        <Marigold id="mg-y" fill="url(#mari-y)" edge="#7f4a04" />
      </defs>
    </svg>
  );
}

const R1 = ruffle(11.5, 13, 0.1, 3);
const R2 = ruffle(8.6, 11, 0.13, 7);
const R3 = ruffle(5.6, 9, 0.16, 11);

function Marigold({ id, fill, edge }) {
  return (
    <symbol id={id} viewBox="-14 -14 28 28" overflow="visible">
      <path d={R1} fill="#000" opacity="0.35" transform="translate(0.8 1.6)" />
      <path d={R1} fill={fill} stroke={edge} strokeOpacity="0.45" strokeWidth="0.6" />
      <path d={R2} fill={fill} stroke={edge} strokeOpacity="0.5" strokeWidth="0.6" transform="rotate(14)" />
      <path d={R3} fill={fill} stroke={edge} strokeOpacity="0.55" strokeWidth="0.5" transform="rotate(-8)" />
      <circle r="2.2" fill={edge} opacity="0.55" />
      <ellipse cx="-3.5" cy="-4.5" rx="3.5" ry="2" fill="#fff6d0" opacity="0.18" />
    </symbol>
  );
}
