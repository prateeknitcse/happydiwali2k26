import { memo, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion';
import { registerFlame, touchFlame, unregisterFlame } from '../lib/flameEngine';

const OUTER = 'M20 2 C23 18 34 36 35 58 C36 80 29 96 20 96 C11 96 4 80 5 58 C6 36 17 18 20 2 Z';
const MID = 'M20 24 C22 36 30 49 30 65 C30 82 26 93 20 93 C14 93 10 82 10 65 C10 49 18 36 20 24 Z';
const CORE = 'M20 54 C21.5 61 25.5 69 25.5 78 C25.5 88 23.5 92 20 92 C16.5 92 14.5 88 14.5 78 C14.5 69 18.5 61 20 54 Z';

const BODY = 'M20 40 C25 80 60 98 100 98 C140 98 175 80 180 40 Z';
const WICK = 'M100 44 C98.6 38 101.2 32 100 26.5';
const FOOT = 'M76 95 C79 102 77 106 71 110 L129 110 C123 106 121 102 124 95 Z';

/**
 * A clay or brass diya with a living flame.
 * The flame's per-frame motion is handled by the shared flame engine;
 * this component only orchestrates ignition, flares and layout.
 */
function Diya({
  size = 120,
  lit = false,
  delay = 0,
  variant = 'terracotta',
  glowScale = 5.4,
  flareKey = 0,
  flareDelay = 0,
  hint = false,
  interactive = true,
  label = 'Diya',
  onIgnite,
  onActivate,
  className = '',
  style,
}) {
  const root = useRef(null);
  const flame = useRef(null);
  const glow = useRef(null);
  const cast = useRef(null);
  const litLayer = useRef(null);
  const flash = useRef(null);
  const sparkHost = useRef(null);
  const entry = useRef(null);
  const igniteTl = useRef(null);
  const wasLit = useRef(false);
  const firstFlare = useRef(true);
  const cb = useRef({ onIgnite, onActivate });
  cb.current = { onIgnite, onActivate };

  const v = variant === 'brass' ? 'b' : 't';

  useLayoutEffect(() => {
    entry.current = registerFlame({
      root: root.current,
      flame: flame.current,
      glow: glow.current,
      cast: cast.current,
      lit: litLayer.current,
      scale: size / 120,
    });
    return () => {
      igniteTl.current?.kill();
      gsap.killTweensOf(entry.current);
      unregisterFlame(entry.current);
      entry.current = null;
      wasLit.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (entry.current) entry.current.scale = size / 120;
  }, [size]);

  const emitSparks = useCallback(() => {
    const host = sparkHost.current;
    if (!host) return;
    const n = 9;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      const d = 2 + Math.random() * 2.5;
      s.style.cssText = `position:absolute;left:0;top:0;width:${d}px;height:${d}px;border-radius:50%;background:#fff3c8;box-shadow:0 0 6px 2px rgba(255,180,80,.8);pointer-events:none;`;
      host.appendChild(s);
      const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
      const dist = size * (0.25 + Math.random() * 0.35);
      gsap.fromTo(
        s,
        { x: 0, y: 0, opacity: 1, scale: 1 },
        {
          x: Math.cos(a) * dist,
          y: Math.sin(a) * dist + size * 0.1,
          opacity: 0,
          scale: 0.2,
          duration: 0.7 + Math.random() * 0.6,
          ease: 'power2.out',
          onComplete: () => s.remove(),
        }
      );
    }
  }, [size]);

  const ignite = useCallback(() => {
    const f = entry.current;
    if (!f) return;
    gsap.killTweensOf(f);
    if (prefersReducedMotion()) {
      gsap.delayedCall(delay, () => {
        f.power = 1;
        f.boost = 0;
        touchFlame(f);
        cb.current.onIgnite?.(root.current);
      });
      return;
    }
    igniteTl.current?.kill();
    const tl = gsap.timeline({ delay });
    igniteTl.current = tl;
    tl.call(() => {
      emitSparks();
      cb.current.onIgnite?.(root.current);
    })
      .fromTo(flash.current, { scale: 0.1, opacity: 1 }, { scale: 1, opacity: 0, duration: 1.3, ease: 'expo.out' }, 0)
      .fromTo(f, { power: 0, boost: 0.85 }, { power: 1, duration: 1.5, ease: 'expo.out' }, 0.03)
      .to(f, { boost: 0, duration: 1.8, ease: 'power2.out' }, 0.08);
  }, [delay, emitSparks]);

  const extinguish = useCallback(() => {
    const f = entry.current;
    if (!f) return;
    igniteTl.current?.kill();
    gsap.set(flash.current, { opacity: 0 });
    gsap.killTweensOf(f);
    gsap.to(f, {
      power: 0,
      boost: 0,
      duration: prefersReducedMotion() ? 0 : 0.7,
      ease: 'power2.in',
      onUpdate: () => touchFlame(f),
    });
  }, []);

  const flare = useCallback(
    (d = 0, amount = 0.45) => {
      const f = entry.current;
      if (!f || f.power < 0.5 || prefersReducedMotion()) return;
      gsap.killTweensOf(f, 'boost');
      gsap.fromTo(f, { boost: 0 }, { boost: amount, duration: 0.25, delay: d, ease: 'power2.out', yoyo: true, repeat: 1, repeatDelay: 0.05 });
    },
    []
  );

  useEffect(() => {
    if (lit && !wasLit.current) ignite();
    else if (!lit && wasLit.current) extinguish();
    wasLit.current = lit;
  }, [lit, ignite, extinguish]);

  useEffect(() => {
    if (firstFlare.current) {
      firstFlare.current = false;
      return;
    }
    if (lit) flare(flareDelay, 0.7);
  }, [flareKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleActivate = (e) => {
    if (!interactive) return;
    e.stopPropagation();
    if (lit) flare();
    cb.current.onActivate?.(root.current);
  };

  const s = size;
  const fw = s * 0.17;
  const fh = s * 0.42;

  return (
    <div
      ref={root}
      className={`absolute select-none ${interactive ? 'cursor-pointer' : 'pointer-events-none'} ${className}`}
      style={{ width: s, height: s * 0.6, ...style }}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? (lit ? `${label}, lit` : `Light the ${label.toLowerCase()}`) : undefined}
      aria-pressed={interactive ? lit : undefined}
      onClick={handleActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleActivate(e);
        }
      }}
    >
      {/* light thrown onto the ground */}
      <div
        ref={cast}
        className="diya-cast pointer-events-none absolute"
        style={{ left: '50%', top: s * 0.36, width: s * 3, height: s * 0.62, marginLeft: -s * 1.5, opacity: 0 }}
      />
      {/* atmospheric glow */}
      <div
        ref={glow}
        className="diya-glow pointer-events-none absolute rounded-full"
        style={{ left: '50%', top: s * 0.02, width: s * glowScale, height: s * glowScale, opacity: 0 }}
      />

      {/* body */}
      <svg viewBox="0 0 200 120" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <ellipse cx="100" cy="111" rx="62" ry="6" fill="url(#diya-contact)" />
        <path d={FOOT} fill={`url(#diya-foot-${v})`} />
        <path d={BODY} fill={`url(#diya-body-${v})`} />
        {v === 't' ? (
          <g>
            <path d="M30 58 Q100 92 170 58" fill="none" stroke="#9e2116" strokeWidth="6" opacity="0.9" />
            <path d="M30 58 Q100 92 170 58" fill="none" stroke="#ffe1a6" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="0.1 7.4" />
            <path d="M42 72 Q100 100 158 72" fill="none" stroke="#f5c77a" strokeWidth="1" opacity="0.55" />
            <path d="M52 80 Q100 103 148 80" fill="none" stroke="#ffe1a6" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="0.1 9" opacity="0.6" />
          </g>
        ) : (
          <g>
            <path d="M30 58 Q100 92 170 58" fill="none" stroke="#fff1c2" strokeWidth="1.2" opacity="0.6" />
            <path d="M38 66 Q100 98 162 66" fill="none" stroke="#6b3f0c" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="0.1 6" opacity="0.7" />
          </g>
        )}
        <path d={BODY} fill="url(#diya-shade)" />
        <ellipse cx="100" cy="40" rx="80" ry="15" fill={`url(#diya-rim-${v})`} />
        <ellipse cx="100" cy="41.5" rx="71" ry="10.5" fill="url(#diya-oil)" />
        <ellipse cx="100" cy="41.5" rx="71" ry="10.5" fill="none" stroke="#000" strokeOpacity="0.35" strokeWidth="1.5" />
        <path d={WICK} fill="none" stroke="#2b1709" strokeWidth="3.4" strokeLinecap="round" />
      </svg>
      {/* light from the flame: a separate layer so its per-frame opacity is
          composited instead of repainting the whole body SVG */}
      <svg
        ref={litLayer}
        viewBox="0 0 200 120"
        className="diya-lit pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        style={{ opacity: 0 }}
        aria-hidden="true"
      >
        <path d={BODY} fill="url(#diya-bodylight)" />
        <ellipse cx="100" cy="40" rx="80" ry="15" fill="url(#diya-rimlight)" />
        <ellipse cx="100" cy="42" rx="30" ry="5" fill="url(#diya-oilglint)" />
        <circle cx="100" cy="27" r="2.4" fill="#ffb347" />
        <path d={WICK} fill="none" stroke="#2b1709" strokeWidth="3.4" strokeLinecap="round" />
      </svg>

      {/* flame */}
      <div
        className="pointer-events-none absolute"
        style={{ left: '50%', top: s * 0.13 - fh * 0.965, width: fw, height: fh, marginLeft: -fw / 2 }}
      >
        <div ref={flame} className="diya-flame absolute inset-0" style={{ transform: 'scale(0)' }}>
          <div
            className="absolute rounded-full"
            style={{
              left: '-90%',
              right: '-90%',
              top: '18%',
              bottom: '-8%',
              background: 'radial-gradient(50% 50% at 50% 62%, rgba(255,170,70,.55), rgba(255,120,40,.18) 55%, transparent 75%)',
            }}
          />
          <svg viewBox="0 0 40 100" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
            <path d={OUTER} fill="url(#flame-outer)" />
            <path d={MID} fill="url(#flame-mid)" />
            <path d={CORE} fill="url(#flame-core)" />
            <ellipse cx="20" cy="91" rx="6.5" ry="5" fill="url(#flame-blue)" />
          </svg>
        </div>
        {/* ignition flash */}
        <div
          ref={flash}
          className="absolute rounded-full"
          style={{
            left: '50%',
            top: '78%',
            width: s * 1.6,
            height: s * 1.6,
            marginLeft: -s * 0.8,
            marginTop: -s * 0.8,
            opacity: 0,
            mixBlendMode: 'screen',
            background: 'radial-gradient(circle, rgba(255,250,225,.95), rgba(255,200,110,.45) 22%, rgba(255,140,50,.12) 45%, transparent 65%)',
          }}
        />
        <div ref={sparkHost} className="absolute" style={{ left: '50%', top: '90%' }} />
      </div>

      {hint && !lit && (
        <span
          className="twinkle pointer-events-none absolute rounded-full"
          style={{
            left: '50%',
            top: s * 0.13,
            width: s * 0.5,
            height: s * 0.5,
            marginLeft: -s * 0.25,
            marginTop: -s * 0.25,
            '--min': 0.15,
            '--dur': '2.4s',
            background: 'radial-gradient(circle, rgba(255,215,106,.55), rgba(255,170,70,.15) 40%, transparent 70%)',
          }}
        />
      )}

      {/* generous hit area that includes the flame */}
      {interactive && <span className="absolute" style={{ left: '10%', right: '10%', top: -s * 0.45, height: s * 0.5 }} />}
    </div>
  );
}

export default memo(Diya);
