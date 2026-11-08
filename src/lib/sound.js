/**
 * Synthesised firework sounds (Web Audio, no audio files).
 *
 * A burst is layered from: a low pitch-dropping thump, a filtered noise
 * "crack" that dulls as it decays, a shared reverb that stands in for the
 * echo off buildings, and (for crackle shells) a scatter of tiny pops.
 *
 * Browsers only allow audio after a user gesture, so the context is created
 * and resumed on the first pointer/key interaction anywhere on the page.
 */

const KEY = 'diwali-sound';
const MAX_VOICES = 10;

let ctx = null;
let master = null;
let dry = null;
let wet = null;
let noise = null;
let voices = 0;
let enabled = readPref();
const listeners = new Set();

function readPref() {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
}

function emit() {
  const s = getSoundState();
  listeners.forEach((fn) => fn(s));
}

function makeNoise(c, seconds) {
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

function makeImpulse(c, seconds, decay) {
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

function ensure() {
  if (ctx) return ctx;
  const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!AC) return null;
  ctx = new AC({ latencyHint: 'interactive' });

  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.knee.value = 10;
  comp.ratio.value = 5;
  comp.attack.value = 0.002;
  comp.release.value = 0.3;

  master = ctx.createGain();
  master.gain.value = enabled ? 0.9 : 0;
  master.connect(comp).connect(ctx.destination);

  dry = ctx.createGain();
  dry.connect(master);

  const reverb = ctx.createConvolver();
  reverb.buffer = makeImpulse(ctx, 2.6, 3.2);
  wet = ctx.createGain();
  wet.gain.value = 0.42;
  wet.connect(reverb).connect(master);

  noise = makeNoise(ctx, 2.5);
  ctx.onstatechange = emit;
  return ctx;
}

function unlock() {
  const c = ensure();
  if (c && c.state !== 'running') c.resume().then(emit, () => {});
}

if (typeof window !== 'undefined') {
  const opts = { capture: true, passive: true };
  const onGesture = () => {
    unlock();
    if (ctx?.state === 'running') {
      window.removeEventListener('pointerdown', onGesture, opts);
      window.removeEventListener('keydown', onGesture, opts);
      window.removeEventListener('touchend', onGesture, opts);
    }
  };
  window.addEventListener('pointerdown', onGesture, opts);
  window.addEventListener('keydown', onGesture, opts);
  window.addEventListener('touchend', onGesture, opts);
}

/** 'on' | 'off' | 'locked' (enabled, but waiting for a user gesture). */
export function getSoundState() {
  if (!enabled) return 'off';
  return ctx?.state === 'running' ? 'on' : 'locked';
}

export function subscribeSound(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setSoundEnabled(on) {
  enabled = on;
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    /* private mode */
  }
  if (on) unlock();
  if (master) master.gain.setTargetAtTime(on ? 0.9 : 0, ctx.currentTime, 0.05);
  emit();
}

function out(t, gain, pan, send) {
  const g = ctx.createGain();
  g.gain.value = gain;
  let node = g;
  if (ctx.createStereoPanner) {
    const p = ctx.createStereoPanner();
    p.pan.value = Math.max(-1, Math.min(1, pan));
    g.connect(p);
    node = p;
  }
  node.connect(dry);
  const s = ctx.createGain();
  s.gain.value = send;
  node.connect(s).connect(wet);
  return g;
}

function noiseSrc(t, dur) {
  const src = ctx.createBufferSource();
  src.buffer = noise;
  src.loop = true;
  src.playbackRate.value = 0.85 + Math.random() * 0.3;
  src.start(t, Math.random() * 1.2, dur);
  return src;
}

function crackles(t, bus, count, spread, start = 0.22) {
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 1800 + Math.random() * 1200;
  hp.connect(bus);
  for (let i = 0; i < count; i++) {
    const at = t + start + Math.pow(Math.random(), 0.8) * spread;
    const len = 0.006 + Math.random() * 0.018;
    const g = ctx.createGain();
    const peak = 0.25 + Math.random() * 0.55;
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(peak, at + 0.001);
    g.gain.exponentialRampToValueAtTime(0.001, at + len);
    g.connect(hp);
    const src = noiseSrc(at, len + 0.01);
    src.connect(g);
  }
}

/**
 * Play a burst.
 * @param {object} o
 * @param {number} o.pan   -1 (left) … 1 (right)
 * @param {number} o.size  ~0.6 … 1.4, scales loudness and depth
 * @param {string} o.type  peony | willow | ring | chrysanthemum | crackle
 */
export function playBurst({ pan = 0, size = 1, type = 'peony' } = {}) {
  if (!enabled || !ctx || ctx.state !== 'running' || voices >= MAX_VOICES) return;
  voices++;
  const t = ctx.currentTime + 0.005;
  const willow = type === 'willow';
  const vol = (willow ? 0.55 : 0.8) * Math.min(1.3, Math.max(0.5, size));
  const bus = out(t, vol, pan, willow ? 0.6 : 0.42);

  // 1. thump: a sine whose pitch drops fast, felt more than heard
  const osc = ctx.createOscillator();
  const og = ctx.createGain();
  const f0 = (willow ? 90 : 120) * (0.8 + Math.random() * 0.4);
  osc.frequency.setValueAtTime(f0, t);
  osc.frequency.exponentialRampToValueAtTime(32, t + 0.45);
  og.gain.setValueAtTime(0.0001, t);
  og.gain.exponentialRampToValueAtTime(willow ? 0.7 : 1, t + 0.006);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
  osc.connect(og).connect(bus);
  osc.start(t);
  osc.stop(t + 0.65);

  // 2. crack: broadband noise through a lowpass that closes as it decays
  const decay = willow ? 2.2 : 1.1 + Math.random() * 0.5;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.Q.value = 0.7;
  lp.frequency.setValueAtTime(willow ? 3200 : 7000, t);
  lp.frequency.exponentialRampToValueAtTime(willow ? 500 : 280, t + decay * 0.7);
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.0001, t);
  ng.gain.exponentialRampToValueAtTime(willow ? 0.6 : 1.2, t + 0.003);
  ng.gain.exponentialRampToValueAtTime(willow ? 0.25 : 0.18, t + 0.08);
  ng.gain.exponentialRampToValueAtTime(0.001, t + decay);
  const crack = noiseSrc(t, decay + 0.05);
  crack.connect(lp).connect(ng).connect(bus);

  // 3. willow shells hiss as the long embers burn
  if (willow) {
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 5200;
    bp.Q.value = 0.8;
    const hg = ctx.createGain();
    hg.gain.setValueAtTime(0.0001, t + 0.1);
    hg.gain.linearRampToValueAtTime(0.09, t + 0.5);
    hg.gain.exponentialRampToValueAtTime(0.001, t + 2.4);
    noiseSrc(t + 0.1, 2.35).connect(bp).connect(hg).connect(bus);
  }

  // 4. crackle shells pop all over after the main break
  if (type === 'crackle') crackles(t, bus, 34 + ((Math.random() * 16) | 0), 1.1);
  else if (type === 'chrysanthemum') crackles(t, bus, 12, 0.9, 0.35);

  const end = t + Math.max(decay, willow ? 2.5 : type === 'crackle' ? 1.5 : 0) + 0.1;
  crack.onended = () => {
    voices--;
    // let the reverb tail ring out before tearing down the voice graph
    setTimeout(() => bus.disconnect(), Math.max(0, (end - ctx.currentTime) * 1000) + 600);
  };
}
