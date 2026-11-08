import { seeded } from './motion';

const f = (n) => Math.round(n * 100) / 100;

/** A ruffled, slightly irregular circle: the silhouette of a marigold layer. */
export function ruffle(r, lobes, depth, seed) {
  const rand = seeded(seed);
  const steps = lobes * 6;
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const k = 1 + depth * Math.sin(a * lobes) + (rand() - 0.5) * depth * 0.9;
    const x = Math.cos(a) * r * k;
    const y = Math.sin(a) * r * k;
    d += `${i ? 'L' : 'M'}${f(x)} ${f(y)}`;
  }
  return d + 'Z';
}

/* ------------------------------------------------------------------ */
/* Architecture silhouettes                                            */
/* ------------------------------------------------------------------ */

export function rect(x, y, w, h) {
  return `M${f(x)} ${f(y)}h${f(w)}v${f(h)}h${f(-w)}Z`;
}

/** Mughal / Rajput onion dome with finial. */
export function dome(cx, by, w, h) {
  const l = cx - w / 2;
  const r = cx + w / 2;
  const body =
    `M${f(l)} ${f(by)}` +
    `C${f(l - w * 0.12)} ${f(by - h * 0.34)} ${f(cx - w * 0.44)} ${f(by - h * 0.62)} ${f(cx - w * 0.08)} ${f(by - h * 0.84)}` +
    `Q${f(cx)} ${f(by - h * 0.9)} ${f(cx)} ${f(by - h)}` +
    `Q${f(cx)} ${f(by - h * 0.9)} ${f(cx + w * 0.08)} ${f(by - h * 0.84)}` +
    `C${f(cx + w * 0.44)} ${f(by - h * 0.62)} ${f(r + w * 0.12)} ${f(by - h * 0.34)} ${f(r)} ${f(by)}Z`;
  const fin = Math.max(1.2, w * 0.025);
  const finial = rect(cx - fin / 2, by - h * 1.2, fin, h * 0.22) + rect(cx - fin * 1.6, by - h * 1.08, fin * 3.2, fin * 1.4);
  return body + finial;
}

/** Curvilinear Nagara temple tower with amalaka and kalasha. */
export function shikhara(cx, by, w, h) {
  const l = cx - w / 2;
  const r = cx + w / 2;
  const top = by - h;
  return (
    `M${f(l)} ${f(by)}C${f(l)} ${f(by - h * 0.55)} ${f(cx - w * 0.22)} ${f(top + h * 0.12)} ${f(cx - w * 0.14)} ${f(top + h * 0.06)}` +
    `L${f(cx + w * 0.14)} ${f(top + h * 0.06)}C${f(cx + w * 0.22)} ${f(top + h * 0.12)} ${f(r)} ${f(by - h * 0.55)} ${f(r)} ${f(by)}Z` +
    rect(cx - w * 0.2, top, w * 0.4, h * 0.07) +
    dome(cx, top, w * 0.14, h * 0.12)
  );
}

export function minaret(cx, by, w, h) {
  return (
    rect(cx - w / 2, by - h, w, h) +
    rect(cx - w * 0.85, by - h * 0.62, w * 1.7, 5) +
    rect(cx - w * 0.85, by - h * 0.92, w * 1.7, 5) +
    rect(cx - w * 0.7, by - h - 6, w * 1.4, 6) +
    dome(cx, by - h - 6, w * 1.35, w * 1.8)
  );
}

export function parapet(x, y, w, tooth = 8, gap = 6, height = 6) {
  let d = '';
  for (let px = x; px < x + w - tooth; px += tooth + gap) d += rect(px, y - height, tooth, height);
  return d;
}

/** Arched window as its own shape (for glowing windows). */
export function archWindow(x, y, w, h) {
  const r = w / 2;
  return `M${f(x)} ${f(y + h)}V${f(y + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + w)} ${f(y + r)}V${f(y + h)}Z`;
}

/** Point on a quadratic bezier. */
export function quadPoint(p0, p1, p2, t) {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]];
}
