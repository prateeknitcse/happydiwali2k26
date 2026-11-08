/**
 * Splits twinkling SVG items into a few stacked <svg> layers that each fade
 * as a whole (see `.twinkle-layer` in index.css). Whole-element opacity
 * animations run on the compositor; per-child ones repaint the entire SVG
 * on every frame.
 *
 * Layers share the base SVG's viewBox, so gradients defined there by id can
 * be referenced from here.
 */

// Durations and phases chosen so no two layers line up for a long time.
const CYCLES = [
  { dur: 2.3, delay: -0.3 },
  { dur: 3.1, delay: -1.7 },
  { dur: 3.9, delay: -0.9 },
  { dur: 4.7, delay: -3.2 },
  { dur: 5.6, delay: -2.4 },
  { dur: 6.4, delay: -4.1 },
];

export function TwinkleLayers({ items, layers = 4, min = 0.35, speed = 1, viewBox, preserveAspectRatio, render }) {
  if (!items.length) return null;
  const groups = Array.from({ length: layers }, () => []);
  items.forEach((it, i) => groups[i % layers].push([it, i]));
  return groups.map((g, k) => {
    const c = CYCLES[k % CYCLES.length];
    return (
      <svg
        key={k}
        viewBox={viewBox}
        preserveAspectRatio={preserveAspectRatio}
        className="twinkle-layer"
        style={{ '--min': min, '--dur': `${(c.dur * speed).toFixed(2)}s`, '--delay': `${c.delay}s` }}
        aria-hidden="true"
      >
        {g.map(([it, i]) => render(it, i))}
      </svg>
    );
  });
}
