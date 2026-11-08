import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, CustomEase);

// House easing curves. "silk" settles softly, "glide" is a symmetric in-out.
CustomEase.create('silk', '0.22, 1, 0.36, 1');
CustomEase.create('glide', '0.65, 0, 0.35, 1');
CustomEase.create('bloom', '0.12, 0.9, 0.25, 1');

gsap.defaults({ ease: 'silk', duration: 1.2 });

const QUERY = '(prefers-reduced-motion: reduce)';

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia(QUERY).matches;
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

export function isFinePointer() {
  return typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/** Viewport width tracked on resize (debounced by rAF). */
export function useViewportWidth() {
  const [w, setW] = useState(() => (typeof window === 'undefined' ? 1440 : window.innerWidth));
  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setW(window.innerWidth));
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);
  return w;
}

/** Smoothly scroll to a section id. */
export function scrollToId(id) {
  const target = document.getElementById(id);
  if (!target) return;
  if (prefersReducedMotion()) {
    target.scrollIntoView();
    return;
  }
  gsap.to(window, { duration: 1.6, ease: 'glide', scrollTo: { y: target, autoKill: true } });
}

/** Deterministic PRNG so decorative layouts are stable between renders. */
export function seeded(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export { gsap, ScrollTrigger };
