let audioCtx: AudioContext | null = null;

const SOUND_STORAGE_KEY = "skite_notification_sound_enabled";

export const isNotificationSoundEnabled = (): boolean => {
  const stored = localStorage.getItem(SOUND_STORAGE_KEY);
  if (stored === null) return true;
  return stored === "true";
};

export const setNotificationSoundEnabled = (enabled: boolean): void => {
  localStorage.setItem(SOUND_STORAGE_KEY, String(enabled));
};

export const unlockAudioContext = (): void => {
  try {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      void audioCtx.resume();
    }
  } catch {
  }
};

if (typeof window !== "undefined") {
  const handleInteraction = () => {
    unlockAudioContext();
    window.removeEventListener("click", handleInteraction);
    window.removeEventListener("keydown", handleInteraction);
  };
  window.addEventListener("click", handleInteraction, { once: true, passive: true });
  window.addEventListener("keydown", handleInteraction, { once: true, passive: true });
}

export const playNotificationSound = (): void => {
  if (!isNotificationSoundEnabled()) return;

  try {
    unlockAudioContext();
    if (!audioCtx) return;

    const ctx = audioCtx;
    const now = ctx.currentTime;

    const notes = [
      { freq: 523.25, time: now, duration: 0.18, gain: 0.16 },
      { freq: 659.25, time: now + 0.08, duration: 0.22, gain: 0.18 },
      { freq: 783.99, time: now + 0.16, duration: 0.45, gain: 0.22 },
    ];

    notes.forEach(({ freq, time, duration, gain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, time);

      gainNode.gain.setValueAtTime(0.0001, time);
      gainNode.gain.exponentialRampToValueAtTime(gain, time + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + duration);
    });

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([40, 60, 80]);
      } catch {
      }
    }
  } catch (err) {
    console.warn("Failed to play notification chime:", err);
  }
};
