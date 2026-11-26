import { useRef, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'scrubber-sound';

// This page's choice, kept in memory too so the toggle still works where storage is refused.
let choice: boolean | null = null;
const listeners = new Set<() => void>();

function readChoice() {
  if (choice !== null) return choice;
  try {
    return localStorage.getItem(STORAGE_KEY) === 'on';
  } catch {
    return false;
  }
}

function writeChoice(enabled: boolean) {
  choice = enabled;
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
  } catch {
    // The in-memory choice still applies for this page.
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** One decaying oscillator, started at `time`. */
function tone(
  audio: AudioContext,
  time: number,
  {
    type,
    from,
    to = from,
    ms,
    gain,
    lowpass,
  }: {
    type: OscillatorType;
    from: number;
    to?: number;
    ms: number;
    gain: number;
    lowpass?: number;
  },
) {
  const end = time + ms / 1000;
  const oscillator = audio.createOscillator();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(from, time);
  if (to !== from) oscillator.frequency.exponentialRampToValueAtTime(to, end);
  const level = audio.createGain();
  level.gain.setValueAtTime(gain, time);
  level.gain.exponentialRampToValueAtTime(0.0001, end);
  let output = oscillator.connect(level);
  if (lowpass) {
    const filter = audio.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass;
    output = output.connect(filter);
  }
  output.connect(audio.destination);
  oscillator.start(time);
  oscillator.stop(end + 0.005);
}

/** A latch click over a low body thump, like a door closing; together they peak near -8 dBFS. */
function tick(audio: AudioContext) {
  const now = audio.currentTime;
  tone(audio, now, { type: 'square', from: 2400, ms: 10, gain: 0.0362, lowpass: 3500 });
  tone(audio, now, { type: 'sine', from: 220, to: 110, ms: 28, gain: 0.506 });
}

/** The scrubber's opt-in tick, remembered per browser. */
export function useTickSound() {
  const enabled = useSyncExternalStore(subscribe, readChoice, () => false);
  const audio = useRef<AudioContext | null>(null);

  function play(force = false) {
    if (!enabled && !force) return;
    // Browsers only let audio start from a user gesture, so the context waits for the first one.
    audio.current ??= new AudioContext();
    if (audio.current.state === 'suspended') void audio.current.resume();
    tick(audio.current);
  }

  function setEnabled(next: boolean) {
    writeChoice(next);
    if (next) play(true);
  }

  return { enabled, setEnabled, play };
}
