// Minimal Web Audio API sound synthesizer for tactile UI microinteractions
class SoundFX {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playClick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // Audio might be blocked by browser policy
    }
  }

  playConnect() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(440, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      osc2.frequency.setValueAtTime(660, now);
      osc2.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.14);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);
      osc1.start();
      osc2.start();
      osc1.stop(now + 0.15);
      osc2.stop(now + 0.15);
    } catch {
      // Ignore
    }
  }

  playPulse() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.2);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.22);
    } catch {
      // Ignore
    }
  }

  playDelete() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.09);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.1);
    } catch {
      // Ignore
    }
  }
}

export const sound = new SoundFX();
