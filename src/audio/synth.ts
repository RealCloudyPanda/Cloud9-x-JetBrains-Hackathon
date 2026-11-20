/** Tiny WebAudio synth: oscillator + gain envelope voices. No audio files. */
export type Sfx = 'jump' | 'land' | 'slide' | 'perfect' | 'hit' | 'gate' | 'beep' | 'go' | 'finish' | 'best';

export class Synth {
  private ac: AudioContext | null = null;
  private master: GainNode | null = null;
  enabled = true;

  /** Must be called inside a user gesture. */
  unlock(): void {
    if (this.ac) {
      if (this.ac.state === 'suspended') void this.ac.resume();
      return;
    }
    try {
      this.ac = new AudioContext();
      this.master = this.ac.createGain();
      this.master.gain.value = 0.32;
      this.master.connect(this.ac.destination);
    } catch {
      this.ac = null;
    }
  }

  private tone(type: OscillatorType, f0: number, f1: number, dur: number, vol: number, delay = 0): void {
    if (!this.ac || !this.master || !this.enabled) return;
    const t = this.ac.currentTime + delay;
    const o = this.ac.createOscillator();
    const g = this.ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.02);
    o.onended = () => g.disconnect();
  }

  play(s: Sfx): void {
    switch (s) {
      case 'jump': return this.tone('square', 320, 640, 0.09, 0.18);
      case 'land': return this.tone('sine', 140, 60, 0.08, 0.3);
      case 'slide': return this.tone('sawtooth', 220, 110, 0.12, 0.1);
      case 'perfect': this.tone('triangle', 880, 880, 0.12, 0.3); return this.tone('triangle', 1320, 1320, 0.18, 0.25, 0.06);
      case 'hit': return this.tone('sawtooth', 110, 50, 0.22, 0.4);
      case 'gate': return this.tone('sine', 600, 1200, 0.14, 0.2);
      case 'beep': return this.tone('square', 440, 440, 0.12, 0.2);
      case 'go': return this.tone('square', 880, 880, 0.28, 0.24);
      case 'finish': [523, 659, 784].forEach((f) => this.tone('triangle', f, f, 0.5, 0.2)); return;
      case 'best': [523, 659, 784, 1047].forEach((f, i) => this.tone('square', f, f, 0.14, 0.14, i * 0.08)); return;
    }
  }
}
