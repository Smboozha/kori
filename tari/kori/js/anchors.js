// anchors.js — семь якорей памяти.
// Невидимый счётчик, влияет на финал. Сохраняется в localStorage.

export const ANCHOR_COUNT = 7;

export const ANCHOR_NAMES = {
  1: 'Сестра: «Ты не виноват»',
  2: 'Фотография деда в рюкзаке',
  3: 'Сесть рядом с новенькой',
  4: 'Дописать на доске «жив»',
  5: 'Заступиться за сестру перед матерью',
  6: 'Записка: «Я хочу жить»',
  7: 'Браслет сестры',
};

export class Anchors {
  constructor() {
    this.found = new Set();
  }

  set(i) {
    if (i >= 1 && i <= ANCHOR_COUNT) this.found.add(i);
  }

  has(i) {
    return this.found.has(i);
  }

  get count() {
    return this.found.size;
  }

  names() {
    return [...this.found].sort().map((n) => ANCHOR_NAMES[n]);
  }

  reset() {
    this.found = new Set();
  }

  save() {
    return [...this.found];
  }

  load(arr) {
    this.found = new Set(Array.isArray(arr) ? arr.filter((n) => n >= 1 && n <= ANCHOR_COUNT) : []);
  }
}