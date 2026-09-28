// audio.js — процедурный звук на Web Audio API (без файлов).
// Инициализация по первому жесту пользователя (клик/клавиша).
// Все звуки синтезируются: шаги, гул внутреннего мира, удар, тик диалога, ветер.

export class AudioSys {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.humGain = null;
    this.windGain = null;
    this.stepTimer = 0;
    this.stepFlip = false;
    this.ready = false;
  }

  // Вызывается по первому жесту (клик/клавиша) — создаёт контекст.
  init() {
    if (this.ready) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
      this.ready = true;
    } catch (e) {
      console.warn('Аудио недоступно', e);
    }
  }

  _noiseBuffer(sec = 1) {
    const len = Math.floor(this.ctx.sampleRate * sec);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  // Шаги: короткий глухой клик. Вызывается из update() с dt.
  step(dt, walking) {
    if (!this.ready || !walking) {
      this.stepTimer = 0;
      return;
    }
    this.stepTimer -= dt;
    if (this.stepTimer <= 0) {
      this.stepTimer = 0.3;
      this._click();
    }
  }

  _click() {
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(this.stepFlip ? 130 : 110, t);
    this.stepFlip = !this.stepFlip;
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  // Гул внутреннего мира (60 Гц + лёгкий шум). Включается/выключается.
  hum(on) {
    if (!this.ready) return;
    if (on && !this.humGain) {
      const ctx = this.ctx;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 60;
      const g = ctx.createGain();
      g.gain.value = 0;
      g.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 1.5);
      osc.connect(g).connect(this.master);
      osc.start();
      this.humOsc = osc;
      this.humGain = g;
    } else if (!on && this.humGain) {
      const g = this.humGain;
      g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.8);
      const osc = this.humOsc;
      setTimeout(() => { try { osc.stop(); } catch (e) {} }, 1000);
      this.humGain = null;
      this.humOsc = null;
    }
  }

  // Ветер (Омск, улица). Включается/выключается.
  wind(on) {
    if (!this.ready) return;
    if (on && !this.windGain) {
      const ctx = this.ctx;
      const src = ctx.createBufferSource();
      src.buffer = this._noiseBuffer(2);
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      const g = ctx.createGain();
      g.gain.value = 0;
      g.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 1.5);
      src.connect(filter).connect(g).connect(this.master);
      src.start();
      this.windSrc = src;
      this.windGain = g;
    } else if (!on && this.windGain) {
      const g = this.windGain;
      g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.8);
      const src = this.windSrc;
      setTimeout(() => { try { src.stop(); } catch (e) {} }, 1000);
      this.windGain = null;
      this.windSrc = null;
    }
  }

  // Удар (побои). Короткий низкий удар + шум.
  hit() {
    if (!this.ready) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.25);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.35);

    const src = ctx.createBufferSource();
    src.buffer = this._noiseBuffer(0.2);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 800;
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.25, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    src.connect(f).connect(g2).connect(this.master);
    src.start(t);
  }

  // Тик диалога при смене реплики.
  tick() {
    if (!this.ready) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 900;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.02, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  // Тик сломанного будильника (интро) — глухой, редкий, как больной пульс.
  alarmTick() {
    if (!this.ready) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 220;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.045, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.07);
  }
}