// Gobble Run — all sound is synthesized with WebAudio.
// One clear job: gobbles, thuds and jingles with no audio files at all,
// so the game ships zero assets and makes zero network requests.

export class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.alarmOn = false;
    this.alarmTimer = null;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  tone(freq, dur, type, vol, slideTo) {
    if (this.muted || !this.ctx) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  noise(dur, vol, lowpass) {
    if (this.muted || !this.ctx) return;
    const t0 = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    src.start(t0);
  }

  // The turkey's own voice: two quick low honks.
  gobble() {
    this.tone(320, 0.09, 'square', 0.16, 180);
    setTimeout(() => this.tone(280, 0.12, 'square', 0.16, 150), 90);
  }

  jump() {
    this.tone(300, 0.16, 'sine', 0.12, 620);
  }

  dash() {
    this.noise(0.22, 0.14, 2400);
    this.tone(500, 0.18, 'sawtooth', 0.07, 900);
  }

  corn() {
    this.tone(880, 0.07, 'sine', 0.14);
    setTimeout(() => this.tone(1318, 0.1, 'sine', 0.14), 60);
  }

  pie() {
    [523, 659, 784, 1046].forEach((f, i) => {
      setTimeout(() => this.tone(f, 0.14, 'triangle', 0.14), i * 70);
    });
  }

  thud() {
    this.noise(0.18, 0.3, 500);
    this.tone(140, 0.2, 'sine', 0.22, 60);
  }

  caught() {
    [392, 330, 262, 196].forEach((f, i) => {
      setTimeout(() => this.tone(f, 0.22, 'sawtooth', 0.12), i * 160);
    });
  }

  escaped() {
    [523, 659, 784, 1046, 1318].forEach((f, i) => {
      setTimeout(() => this.tone(f, 0.2, 'triangle', 0.15), i * 110);
    });
    setTimeout(() => this.gobble(), 500);
  }

  click() {
    this.tone(700, 0.05, 'sine', 0.1);
  }

  // A soft two-note warning while the farmer is breathing down your neck.
  startAlarm() {
    if (this.alarmOn || !this.ctx) return;
    this.alarmOn = true;
    const beat = () => {
      if (!this.alarmOn) return;
      this.tone(220, 0.12, 'square', 0.06, 180);
      this.alarmTimer = setTimeout(beat, 700);
    };
    beat();
  }

  stopAlarm() {
    this.alarmOn = false;
    if (this.alarmTimer) clearTimeout(this.alarmTimer);
  }
}
