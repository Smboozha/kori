// lamps.js — четыре лампы в классе внутреннего мира.
// Каждая гаснет по сюжету после очередного побоя. Сохраняются в localStorage.

export const LAMP_COUNT = 4;

export class Lamps {
  constructor() {
    this.state = [true, true, true, true];
  }

  // Гасит следующую горящую лампу. Возвращает её индекс или -1.
  extinguishNext() {
    for (let i = 0; i < LAMP_COUNT; i++) {
      if (this.state[i]) {
        this.state[i] = false;
        return i;
      }
    }
    return -1;
  }

  isLit(i) {
    return !!this.state[i];
  }

  get litCount() {
    return this.state.filter(Boolean).length;
  }

  reset() {
    this.state = [true, true, true, true];
  }

  save() {
    return this.state.slice();
  }

  load(arr) {
    if (Array.isArray(arr) && arr.length === LAMP_COUNT) {
      this.state = arr.map(Boolean);
    }
  }
}