import { Fragment, useEffect, useRef } from 'react';
import { gsap, isFinePointer, prefersReducedMotion } from '../lib/motion';

/**
 * Splits text into masked words for reveal animations.
 * Pass `parts` to style fragments: [{ t: 'plain words ' }, { t: 'gold words', className: '...' }]
 */
export function Words({ parts, text, className = '', wordClassName = 'word' }) {
  const list = parts ?? [{ t: text }];
  let k = 0;
  return (
    <span className={className}>
      {list.map((p, pi) => (
        <Fragment key={pi}>
          {p.t
            .split(/(\s+)/)
            .filter(Boolean)
            .map((w) =>
              /^\s+$/.test(w) ? (
                <Fragment key={k++}> </Fragment>
              ) : (
                <span key={k++} className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
                  <span className={`${wordClassName} ${p.className ?? ''}`}>{w}</span>
                </span>
              )
            )}
        </Fragment>
      ))}
    </span>
  );
}

/** Reveals `.word` children of the ref'd element when it scrolls into view. */
export function useWordReveal(ref, { start = 'top 82%', stagger = 0.045, delay = 0 } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll('.word'),
        { yPercent: 108, rotate: 3 },
        {
          yPercent: 0,
          rotate: 0,
          duration: 1.3,
          ease: 'expo.out',
          stagger,
          delay,
          scrollTrigger: { trigger: el, start, once: true },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [ref, start, stagger, delay]);
}

/** Fades + lifts every `[data-reveal]` element inside the ref when it enters. */
export function useFadeReveal(ref, { start = 'top 85%' } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray('[data-reveal]', el).forEach((node) => {
        gsap.fromTo(
          node,
          { opacity: 0, y: 34 },
          {
            opacity: 1,
            y: 0,
            duration: 1.4,
            ease: 'power3.out',
            delay: Number(node.dataset.reveal) || 0,
            scrollTrigger: { trigger: node, start, once: true },
          }
        );
      });
    }, el);
    return () => ctx.revert();
  }, [ref, start]);
}

/** Wrapper that drifts gently toward the cursor while hovered. */
export function Magnetic({ children, strength = 0.28, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !isFinePointer()) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'power3.out' });
    const move = (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [strength]);
  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {children}
    </span>
  );
}

/** Small uppercase label with an index, used to open every section. */
export function SectionLabel({ index, children, className = '' }) {
  return (
    <p className={`eyebrow flex items-center gap-4 ${className}`}>
      <span className="font-display text-base italic tracking-normal text-gold normal-case">{index}</span>
      <span className="h-px w-10 bg-gold/40" />
      <span>{children}</span>
    </p>
  );
}
