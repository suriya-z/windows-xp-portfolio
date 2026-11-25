import { afterEach, describe, expect, it, vi } from 'vitest';
import { browserSoundOutput, createSound, type SoundOutput } from './sound';

/** Stands in for the speakers: writes down everything it is asked to play. */
const recorder = () => {
  const played: string[] = [];
  const output: SoundOutput = {
    tone: (freq) => played.push(`tone ${freq}`),
    sample: (name) => played.push(`sample ${name}`),
  };
  return { output, played };
};

describe('sound', () => {
  it('plays nothing while muted, and everything once unmuted', () => {
    const { output, played } = recorder();
    const sound = createSound(output);

    sound.setMuted(true);
    sound.play('error');
    sound.beep(440, 50);
    sound.setMuted(false);
    sound.play('click');
    sound.beep(880, 50);

    expect(played).toEqual(['sample click', 'tone 880']);
  });

  it('plays a tune note by note, and stops when muted part-way through', () => {
    vi.useFakeTimers();
    const { output, played } = recorder();
    const sound = createSound(output);

    sound.tune([
      { freq: 523, ms: 100, at: 0 },
      { freq: 659, ms: 100, at: 120 },
      { freq: 783, ms: 100, at: 240 },
    ]);
    vi.advanceTimersByTime(150);
    sound.setMuted(true);
    vi.advanceTimersByTime(500);

    expect(played).toEqual(['tone 523', 'tone 659']);
  });
});

describe('browser sound output', () => {
  it('opens one audio context and reuses it for every tone', () => {
    const node = () => ({
      connect: () => {},
      start: () => {},
      stop: () => {},
      type: '',
      frequency: { setValueAtTime: () => {} },
      gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
    });
    let contexts = 0;
    vi.stubGlobal(
      'AudioContext',
      class {
        currentTime = 0;
        destination = {};
        constructor() {
          contexts++;
        }
        createOscillator = node;
        createGain = node;
      },
    );

    const output = browserSoundOutput();
    output.tone(440, 50, 'sine');
    output.tone(660, 50, 'sine');
    output.tone(880, 50, 'sine');

    expect(contexts).toBe(1);
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
