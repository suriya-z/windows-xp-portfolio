/** The XP system sounds, as MP3 recordings in /assets/xp-sounds. */
export type XPSoundType =
  | 'startup'
  | 'shutdown'
  | 'click'
  | 'error'
  | 'exclamation'
  | 'minimize'
  | 'restore'
  | 'recycle'
  | 'notify'
  | 'menu'
  | 'ding';

/** Where sound actually comes out: Web Audio in the browser, a recorder in tests. */
export interface SoundOutput {
  tone(freq: number, ms: number, wave: OscillatorType): void;
  sample(name: XPSoundType): void;
}

export interface Note {
  freq: number;
  ms: number;
  wave?: OscillatorType;
  /** Milliseconds after the start of the tune. */
  at: number;
}

export interface Sound {
  /** Plays one of the XP system sounds. */
  play(name: XPSoundType): void;
  /** Plays a synthesized tone. */
  beep(freq: number, ms: number, wave?: OscillatorType): void;
  /** Plays tones in sequence; notes still to come stay silent if sound is muted meanwhile. */
  tune(notes: Note[]): void;
  readonly muted: boolean;
  setMuted(muted: boolean): void;
}

/** The one place that decides whether a sound is heard. */
export function createSound(output: SoundOutput): Sound {
  let muted = false;
  const beep = (freq: number, ms: number, wave: OscillatorType = 'square') => {
    if (!muted) output.tone(freq, ms, wave);
  };
  return {
    play: (name) => {
      if (!muted) output.sample(name);
    },
    beep,
    tune: (notes) => {
      if (muted) return;
      for (const { freq, ms, wave, at } of notes) {
        if (at === 0) beep(freq, ms, wave);
        else setTimeout(() => beep(freq, ms, wave), at);
      }
    },
    get muted() {
      return muted;
    },
    setMuted: (value) => {
      muted = value;
    },
  };
}

const SAMPLES: Record<XPSoundType, string> = {
  startup: '/assets/xp-sounds/Windows XP Startup.mp3',
  shutdown: '/assets/xp-sounds/Windows XP Shutdown.mp3',
  click: '/assets/xp-sounds/Windows XP Start.mp3',
  error: '/assets/xp-sounds/Windows XP Error.mp3',
  exclamation: '/assets/xp-sounds/Windows XP Exclamation.mp3',
  minimize: '/assets/xp-sounds/Windows XP Minimize.mp3',
  restore: '/assets/xp-sounds/Windows XP Restore.mp3',
  recycle: '/assets/xp-sounds/Windows XP Recycle.mp3',
  notify: '/assets/xp-sounds/Windows XP Notify.mp3',
  menu: '/assets/xp-sounds/Windows XP Menu Command.mp3',
  ding: '/assets/xp-sounds/ding.mp3',
};

/** Tones through one shared Web Audio context, system sounds through <audio>. */
export function browserSoundOutput(): SoundOutput {
  let context: AudioContext | null = null;
  const samples = new Map<XPSoundType, HTMLAudioElement>();
  return {
    tone: (freq, ms, wave) => {
      try {
        const Context = window.AudioContext || (window as any).webkitAudioContext;
        if (!Context) return;
        context ??= new Context();
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.type = wave;
        osc.frequency.setValueAtTime(freq, context.currentTime);
        // Quick gain envelope so the tone does not click.
        gain.gain.setValueAtTime(0.04, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + ms / 1000);
        osc.connect(gain);
        gain.connect(context.destination);
        osc.start();
        osc.stop(context.currentTime + ms / 1000);
      } catch (e) {
        console.error('Audio error:', e);
      }
    },
    // One audio element per sound, loaded once and rewound for each play.
    sample: (name) => {
      let audio = samples.get(name);
      if (!audio) {
        audio = new Audio(SAMPLES[name]);
        audio.volume = name === 'startup' || name === 'shutdown' ? 0.75 : 0.55;
        samples.set(name, audio);
      }
      audio.currentTime = 0;
      audio.play().catch(() => {});
    },
  };
}

/** The desktop's speaker. */
export const sound = createSound(browserSoundOutput());
