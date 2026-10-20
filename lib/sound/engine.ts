import {
  type Cue,
  type CueOptions,
  cueSound,
  frequency,
  MASTER_GAIN,
  type Pluck,
  type Sample,
  SAMPLES,
} from "./kit";

/**
 * Plays the kit with Web Audio, so it costs no download (except the
 * recorded coin and impact, fetched once on first use). Browser only. Nothing sounds before `arm()`, which the sound
 * provider calls on the visitor's first press or key: no sound ever plays on
 * page load, scroll or presence updates.
 */
export class SoundEngine {
  private context: AudioContext | undefined;
  private master: GainNode | undefined;
  private buffers = new Map<Sample, Promise<AudioBuffer | undefined>>();
  private armed = false;
  private lastTick = 0;

  /** Called once the visitor has interacted with the page. */
  arm() {
    this.armed = true;
  }

  play(cue: Cue, options?: CueOptions) {
    if (!this.armed) return;
    const audio = this.audio();
    if (!audio) return;
    const { context, master } = audio;

    // The hover tick, at most one every 60ms.
    if (cue === "tick") {
      const now = performance.now();
      if (now - this.lastTick < 60) return;
      this.lastTick = now;
    }

    if (context.state === "suspended") void context.resume();
    const sound = cueSound(cue, options);
    const start = context.currentTime + 0.005;
    for (const pluck of sound.plucks) this.pluck(context, master, pluck, start);
    for (const { sample, at, gain: level } of sound.samples ?? []) {
      void this.buffer(context, sample).then((buffer) => {
        if (!buffer) return;
        const source = context.createBufferSource();
        const gain = context.createGain();
        gain.gain.value = level;
        source.buffer = buffer;
        source.connect(gain).connect(master);
        source.start(Math.max(start + at, context.currentTime));
      });
    }
  }

  private audio() {
    if (typeof window === "undefined" || !("AudioContext" in window)) {
      return undefined;
    }
    if (!this.context || !this.master) {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = MASTER_GAIN;
      this.master.connect(this.context.destination);
    }
    return { context: this.context, master: this.master };
  }

  /** A kalimba tine: a sine body and a short metallic overtone. */
  private pluck(
    context: AudioContext,
    master: GainNode,
    { note, at, gain, decay, bend }: Pluck,
    start: number,
  ) {
    const t = start + at;
    const f = frequency(note);
    const voices: ReadonlyArray<{
      ratio: number;
      level: number;
      ring: number;
    }> = [
      { ratio: 1, level: gain, ring: decay },
      { ratio: 5.4, level: gain * 0.18, ring: Math.min(0.14, decay) },
    ];
    for (const { ratio, level, ring } of voices) {
      const osc = context.createOscillator();
      const env = context.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f * ratio, t);
      if (bend) {
        osc.frequency.exponentialRampToValueAtTime(
          f * ratio * 2 ** (bend / 12),
          t + 0.08,
        );
      }
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(level, t + 0.004);
      env.gain.exponentialRampToValueAtTime(0.0001, t + ring);
      osc.connect(env).connect(master);
      osc.start(t);
      osc.stop(t + ring + 0.05);
    }
  }

  private buffer(context: AudioContext, sample: Sample) {
    let buffer = this.buffers.get(sample);
    if (!buffer) {
      buffer = fetch(SAMPLES[sample])
        .then((response) => response.arrayBuffer())
        .then((data) => context.decodeAudioData(data))
        .catch(() => undefined);
      this.buffers.set(sample, buffer);
    }
    return buffer;
  }
}
