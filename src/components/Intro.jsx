import { useLayoutEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion';
import Diya from './Diya';

/**
 * Opening shot: darkness, a single diya catches, and its light blooms
 * outward to reveal the scene. Calls `onReveal` as the bloom peaks.
 */
export default function Intro({ onReveal }) {
  const root = useRef(null);
  const bloom = useRef(null);
  const caption = useRef(null);
  const lamp = useRef(null);
  const [lit, setLit] = useState(false);
  const [gone, setGone] = useState(false);
  const revealRef = useRef(onReveal);
  revealRef.current = onReveal;

  useLayoutEffect(() => {
    if (prefersReducedMotion()) {
      revealRef.current?.();
      setGone(true);
      return;
    }
    const html = document.documentElement;
    html.style.overflow = 'hidden';
    const tl = gsap.timeline({
      onComplete: () => {
        html.style.overflow = '';
        setGone(true);
      },
    });
    tl.fromTo(lamp.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' }, 0.15)
      .fromTo(caption.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, 0.45)
      .call(() => setLit(true), null, 0.6)
      .to(caption.current, { opacity: 0, y: -6, duration: 0.5, ease: 'power2.in' }, 1.6)
      .fromTo(bloom.current, { scale: 0.05, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.0, ease: 'expo.in' }, 1.7)
      .to(lamp.current, { opacity: 0, scale: 1.4, duration: 0.7, ease: 'power2.in' }, 2.0)
      .call(() => revealRef.current?.(), null, 2.55)
      .to(root.current, { backgroundColor: 'rgba(5,6,13,0)', duration: 0.01 }, 2.65)
      .to(bloom.current, { opacity: 0, scale: 1.3, duration: 1.6, ease: 'power2.out' }, 2.65);
    return () => {
      tl.kill();
      html.style.overflow = '';
    };
  }, []);

  if (gone) return null;

  return (
    <div ref={root} className="fixed inset-0 z-[100] flex items-center justify-center bg-night" aria-hidden="true">
      <div
        ref={bloom}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[260vmax] w-[260vmax] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
        style={{
          background:
            'radial-gradient(circle, rgba(255,246,220,1) 0%, rgba(255,214,130,.95) 8%, rgba(255,160,70,.75) 20%, rgba(120,50,20,.6) 38%, rgba(5,6,13,1) 60%)',
        }}
      />
      <div ref={lamp} className="relative" style={{ width: 96, height: 58 }}>
        <Diya size={96} lit={lit} interactive={false} glowScale={7} className="left-0 top-0" />
      </div>
      <p ref={caption} className="eyebrow absolute left-1/2 top-[calc(50%+70px)] -translate-x-1/2 whitespace-nowrap">
        Lighting the first diya
      </p>
    </div>
  );
}
