import { gainOf, MUSIC_MAX_GAIN, RAIN_MAX_GAIN } from "./radio";
import { rainSamples, seededRandom } from "./rain";

/** Seconds of the fades in and out, so nothing starts or stops abruptly. */
const FADE_IN = 0.6;
const FADE_OUT = 0.25;

type RadioEngineEvents = {
  /** The track's audio is playing. */
  onStarted: () => void;
  onEnded: () => void;
  onFailed: () => void;
};

/**
 * Plays the radio (DESIGN.md, Radio) with one audio element routed through
 * Web Audio, so its volume works everywhere (iOS ignores an element's
 * volume), plus the rain, made in code. Browser only. It is created on the
 * visitor's first press of play, so no audio is fetched or decoded before.
 */
export class RadioEngine {
  private readonly context: AudioContext;
  private readonly audio: HTMLAudioElement;
  private readonly music: GainNode;
  private readonly rain: GainNode;
  private rainStarted = false;
  private musicVolume = 0;
  private stopTimer: number | undefined;
  private readonly listeners = new Set<() => void>();

  constructor(private readonly events: RadioEngineEvents) {
    this.context = new AudioContext();
    this.audio = new Audio();
    this.audio.preload = "auto";

    this.music = this.context.createGain();
    this.music.gain.value = 0;
    this.context
      .createMediaElementSource(this.audio)
      .connect(this.music)
      .connect(this.context.destination);

    this.rain = this.context.createGain();
    this.rain.gain.value = 0;
    this.rain.connect(this.context.destination);

    this.audio.addEventListener("playing", () => this.events.onStarted());
    this.audio.addEventListener("ended", () => this.events.onEnded());
    this.audio.addEventListener("error", () => this.events.onFailed());
    this.audio.addEventListener("timeupdate", this.notify);
    this.audio.addEventListener("durationchange", this.notify);
  }

  /** Loads the track if it is not the current one, then plays it. */
  play(src: string) {
    window.clearTimeout(this.stopTimer);
    if (this.context.state === "suspended") void this.context.resume();
    if (!this.audio.src.endsWith(src)) {
      this.audio.src = src;
      this.notify();
    }
    this.ramp(
      this.music.gain,
      gainOf(this.musicVolume, MUSIC_MAX_GAIN),
      FADE_IN,
    );
    this.audio.play().catch((error: unknown) => {
      // A newer `src` interrupting this one is not a failure
      if (error instanceof DOMException && error.name === "AbortError") return;
      this.events.onFailed();
    });
  }

  /** Fades the music out, then pauses it where it is. */
  pause() {
    this.ramp(this.music.gain, 0, FADE_OUT);
    window.clearTimeout(this.stopTimer);
    this.stopTimer = window.setTimeout(() => {
      this.audio.pause();
      // Nothing left to sound: let the device rest
      if (this.rain.gain.value < 0.001) void this.context.suspend();
    }, FADE_OUT * 1000);
  }

  setVolume(volume: number, playing: boolean) {
    this.musicVolume = volume;
    if (playing) {
      this.ramp(this.music.gain, gainOf(volume, MUSIC_MAX_GAIN), 0.08);
    }
  }

  /** Fades the rain in or out; it keeps looping silently while off. */
  setRain(on: boolean, volume: number) {
    if (on && !this.rainStarted) this.startRain();
    this.ramp(
      this.rain.gain,
      on ? gainOf(volume, RAIN_MAX_GAIN) : 0,
      on ? FADE_IN : FADE_OUT,
    );
  }

  /** Where the track is, in seconds, for the slot's progress bar. */
  progress = (): { at: number; duration: number } => ({
    at: this.audio.currentTime,
    duration: Number.isFinite(this.audio.duration) ? this.audio.duration : 0,
  });

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => void this.listeners.delete(listener);
  };

  dispose() {
    window.clearTimeout(this.stopTimer);
    this.audio.pause();
    this.audio.removeAttribute("src");
    this.listeners.clear();
    void this.context.close();
  }

  private notify = () => this.listeners.forEach((listener) => listener());

  private ramp(param: AudioParam, value: number, seconds: number) {
    const now = this.context.currentTime;
    param.cancelScheduledValues(now);
    param.setValueAtTime(param.value, now);
    param.linearRampToValueAtTime(value, now + seconds);
  }

  /** Two different loops, one per ear, softened by a low-pass filter. */
  private startRain() {
    this.rainStarted = true;
    const rate = this.context.sampleRate;
    const left = rainSamples(rate, seededRandom(11));
    const right = rainSamples(rate, seededRandom(23));
    const buffer = this.context.createBuffer(2, left.length, rate);
    buffer.copyToChannel(left, 0);
    buffer.copyToChannel(right, 1);

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const lowpass = this.context.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 2400;
    lowpass.Q.value = 0.4;
    const highpass = this.context.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 180;
    source.connect(highpass).connect(lowpass).connect(this.rain);
    source.start();
  }
}
