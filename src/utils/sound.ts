// Synthetic Sound Generator using Web Audio API
// This avoids downloading static files and works fully offline.

let soundEnabled = true;

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
  localStorage.setItem('sound_enabled', JSON.stringify(enabled));
}

export function getSoundEnabled(): boolean {
  const saved = localStorage.getItem('sound_enabled');
  if (saved !== null) {
    try {
      soundEnabled = JSON.parse(saved);
    } catch {
      // ignore
    }
  }
  return soundEnabled;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;
  return new AudioContextClass();
}

export function playSound(type: 'click' | 'win' | 'collect' | 'message' | 'lose' | 'spin' | 'correct' | 'wrong') {
  if (!getSoundEnabled()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume context if suspended (common browser autoplay security)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const dest = ctx.destination;

  switch (type) {
    case 'click': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(dest);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
      break;
    }
    case 'collect': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(dest);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.06); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.12); // G5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
      break;
    }
    case 'correct': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(dest);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.2);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
      break;
    }
    case 'wrong': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(dest);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.25);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
      break;
    }
    case 'message': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(dest);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(698.46, ctx.currentTime); // F5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.2);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
      break;
    }
    case 'spin': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(dest);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(450, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
      break;
    }
    case 'win': {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(dest);

      osc1.type = 'triangle';
      osc2.type = 'sine';

      // Arpeggio chords
      const now = ctx.currentTime;
      osc1.frequency.setValueAtTime(261.63, now); // C4
      osc1.frequency.setValueAtTime(329.63, now + 0.1); // E4
      osc1.frequency.setValueAtTime(392.00, now + 0.2); // G4
      osc1.frequency.setValueAtTime(523.25, now + 0.3); // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.4); // E5

      osc2.frequency.setValueAtTime(523.25, now);
      osc2.frequency.setValueAtTime(659.25, now + 0.1);
      osc2.frequency.setValueAtTime(783.99, now + 0.2);
      osc2.frequency.setValueAtTime(1046.50, now + 0.3);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.setValueAtTime(0.12, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.7);

      osc1.start();
      osc2.start();
      osc1.stop(now + 0.7);
      osc2.stop(now + 0.7);
      break;
    }
    case 'lose': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(dest);

      osc.type = 'sawtooth';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(220, now); // A3
      osc.frequency.linearRampToValueAtTime(110, now + 0.4);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.start();
      osc.stop(now + 0.45);
      break;
    }
  }
}
