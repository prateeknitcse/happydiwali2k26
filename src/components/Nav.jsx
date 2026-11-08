import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion, scrollToId, ScrollTrigger } from '../lib/motion';

const LINKS = [
  { id: 'wishes', label: 'Wishes' },
  { id: 'light', label: 'Light' },
  { id: 'moments', label: 'Moments' },
  { id: 'celebrate', label: 'Celebrate' },
];

export function FlameMark({ className = '' }) {
  return (
    <svg viewBox="0 0 24 32" className={className} aria-hidden="true">
      <path d="M12 1 C14 8 20 12 20 19 a8 8 0 0 1 -16 0 C4 12 10 8 12 1Z" fill="url(#flame-outer)" />
      <path d="M12 12 C13 16 16 18 16 22 a4 4 0 0 1 -8 0 C8 18 11 16 12 12Z" fill="url(#flame-core)" />
    </svg>
  );
}

export default function Nav({ ready }) {
  const ref = useRef(null);
  const [active, setActive] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!prefersReducedMotion()) {
      gsap.fromTo(ref.current, { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 1.6, delay: 1.6, ease: 'expo.out' });
    } else {
      gsap.set(ref.current, { opacity: 1 });
    }
    const triggers = LINKS.map(({ id }) =>
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => self.isActive && setActive(id),
      })
    );
    const top = ScrollTrigger.create({
      start: 80,
      end: 'max',
      onToggle: (self) => setScrolled(self.isActive),
      onLeaveBack: () => setActive(''),
    });
    return () => {
      triggers.forEach((t) => t.kill());
      top.kill();
    };
  }, [ready]);

  return (
    <header
      ref={ref}
      className="fixed inset-x-0 top-0 z-50 opacity-0 transition-[background,backdrop-filter] duration-700"
      style={{
        background: scrolled ? 'linear-gradient(to bottom, rgba(5,6,13,.82), rgba(5,6,13,0))' : 'transparent',
      }}
    >
      <nav className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-5 md:px-10">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            scrollToId('top');
          }}
          className="group flex items-center gap-3"
          aria-label="Back to top"
        >
          <FlameMark className="h-6 w-5 transition-transform duration-700 ease-[var(--ease-silk)] group-hover:-translate-y-0.5 group-hover:scale-110" />
          <span className="font-display text-lg tracking-wide text-ivory/90">
            Deepavali <span className="italic text-gold/80">mmxxvi</span>
          </span>
        </a>
        <ul className="hidden items-center gap-9 md:flex">
          {LINKS.map((l, i) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId(l.id);
                }}
                className={`group relative flex items-baseline gap-2 text-[0.72rem] uppercase tracking-[0.24em] transition-colors duration-500 ${
                  active === l.id ? 'text-gold' : 'text-ivory/55 hover:text-ivory'
                }`}
              >
                <span className="font-display text-xs italic normal-case tracking-normal text-gold/60">0{i + 1}</span>
                {l.label}
                <span
                  className={`absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_10px_3px_rgba(255,190,90,.6)] transition-all duration-700 ${
                    active === l.id ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                  }`}
                />
              </a>
            </li>
          ))}
        </ul>
        <span className="eyebrow md:hidden">08 · 11 · 26</span>
      </nav>
    </header>
  );
}
