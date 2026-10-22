/**
 * The radio's rain (DESIGN.md, Radio), made in code so it costs no file and
 * no licence: a few seconds of soft noise (the wash) scattered with short
 * bursts (the drops), looping without a seam. Plain samples, played by
 * `engine.ts` through a low-pass filter.
 */

/** A small seeded random generator (mulberry32), numbers in [0, 1). */
export const seededRandom = (seed: number): (() => number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Seconds of rain before it loops. */
export const RAIN_SECONDS = 6;
/** Seconds over which the end of the loop fades into its start. */
const SEAM_SECONDS = 0.5;
/** Drops a second, on average. */
const DROPS_PER_SECOND = 70;

/**
 * One channel of rain, `seconds` long at `sampleRate`, peaking under 1. The
 * last half second is folded over the first, so the loop has no click.
 */
export const rainSamples = (
  sampleRate: number,
  random: () => number,
  seconds = RAIN_SECONDS,
): Float32Array<ArrayBuffer> => {
  const length = Math.round(seconds * sampleRate);
  const seam = Math.round(SEAM_SECONDS * sampleRate);
  const raw = new Float32Array(length + seam);

  // The wash: pink-ish noise (Paul Kellet's economy filter), kept low
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  for (let i = 0; i < raw.length; i++) {
    const white = random() * 2 - 1;
    b0 = 0.99765 * b0 + white * 0.099046;
    b1 = 0.963 * b1 + white * 0.2965164;
    b2 = 0.57 * b2 + white * 1.0526913;
    raw[i] = (b0 + b1 + b2 + white * 0.1848) * 0.05;
  }

  // The drops: bursts of 2 to 14ms, most soft, a few close and heavier
  const drops = Math.round(DROPS_PER_SECOND * (raw.length / sampleRate));
  for (let d = 0; d < drops; d++) {
    const at = Math.floor(random() * raw.length);
    const size = Math.floor((0.002 + random() * 0.012) * sampleRate);
    const level = random() < 0.08 ? 0.35 + random() * 0.25 : random() * 0.18;
    for (let j = 0; j < size && at + j < raw.length; j++) {
      const envelope = Math.exp((-5 * j) / size);
      raw[at + j] += (random() * 2 - 1) * level * envelope;
    }
  }

  // Fold the tail over the head with an equal-power crossfade
  const out = raw.slice(0, length);
  for (let i = 0; i < seam; i++) {
    const t = i / seam;
    out[i] =
      raw[i] * Math.sin((t * Math.PI) / 2) +
      raw[length + i] * Math.cos((t * Math.PI) / 2);
  }

  let peak = 0;
  for (const sample of out) peak = Math.max(peak, Math.abs(sample));
  if (peak > 0.95) {
    const scale = 0.95 / peak;
    for (let i = 0; i < out.length; i++) out[i] *= scale;
  }
  return out;
};
