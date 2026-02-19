import { useRef, useCallback } from 'react';

// Port du SoundManager de client.js en hook React

interface SoundManagerHook {
  playCardFlip: () => void;
  playCardDiscard: () => void;
  playPlotPassed: () => void;
  playEditPassed: () => void;
  playVoteAccepted: () => void;
  playVoteRejected: () => void;
  playExecution: () => void;
  playVictory: () => void;
  playDefeat: () => void;
  toggle: () => boolean;
}

export function useSoundManager(): SoundManagerHook {
  const audioContextRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(true);

  function getCtx(): AudioContext | null {
    if (!enabledRef.current) return null;
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      } catch {
        enabledRef.current = false;
        return null;
      }
    }
    return audioContextRef.current;
  }

  function playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.5
  ) {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = frequency;
    osc.type = type;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  const playCardFlip = useCallback(() => {
    playTone(800, 0.08, 'square', 0.3);
    setTimeout(() => playTone(1200, 0.05, 'square', 0.2), 50);
  }, []);

  const playCardDiscard = useCallback(() => {
    playTone(400, 0.1, 'sawtooth', 0.2);
    setTimeout(() => playTone(300, 0.15, 'sawtooth', 0.15), 80);
  }, []);

  const playPlotPassed = useCallback(() => {
    playTone(150, 0.3, 'sawtooth', 0.4);
    setTimeout(() => playTone(120, 0.4, 'sawtooth', 0.3), 150);
    setTimeout(() => playTone(100, 0.5, 'sawtooth', 0.2), 350);
  }, []);

  const playEditPassed = useCallback(() => {
    playTone(523, 0.15, 'sine', 0.3);
    setTimeout(() => playTone(659, 0.15, 'sine', 0.3), 100);
    setTimeout(() => playTone(784, 0.25, 'sine', 0.4), 200);
  }, []);

  const playVoteAccepted = useCallback(() => {
    playTone(440, 0.1, 'sine', 0.3);
    setTimeout(() => playTone(554, 0.1, 'sine', 0.3), 80);
    setTimeout(() => playTone(659, 0.15, 'sine', 0.4), 160);
  }, []);

  const playVoteRejected = useCallback(() => {
    playTone(350, 0.15, 'sawtooth', 0.3);
    setTimeout(() => playTone(280, 0.2, 'sawtooth', 0.25), 120);
  }, []);

  const playExecution = useCallback(() => {
    playTone(200, 0.1, 'square', 0.5);
    setTimeout(() => playTone(100, 0.4, 'sawtooth', 0.4), 100);
  }, []);

  const playVictory = useCallback(() => {
    const notes = [523, 587, 659, 698, 784, 880, 988, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.15, 'sine', 0.3), i * 100);
    });
  }, []);

  const playDefeat = useCallback(() => {
    playTone(300, 0.3, 'sawtooth', 0.3);
    setTimeout(() => playTone(250, 0.3, 'sawtooth', 0.25), 200);
    setTimeout(() => playTone(200, 0.4, 'sawtooth', 0.2), 400);
    setTimeout(() => playTone(150, 0.5, 'sawtooth', 0.15), 600);
  }, []);

  const toggle = useCallback(() => {
    enabledRef.current = !enabledRef.current;
    return enabledRef.current;
  }, []);

  return {
    playCardFlip,
    playCardDiscard,
    playPlotPassed,
    playEditPassed,
    playVoteAccepted,
    playVoteRejected,
    playExecution,
    playVictory,
    playDefeat,
    toggle,
  };
}
