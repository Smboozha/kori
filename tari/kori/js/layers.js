// layers.js — четыре слоя подсознания.
// Каждый слой открывается по акту и при наличии якорей.

export const LAYER_NAMES = {
  1: 'Слой 1 — Школа',
  2: 'Слой 2 — Коридор без конца',
  3: 'Слой 3 — Село, которого нет',
  4: 'Слой 4 — Комната',
};

export class Layers {
  constructor() {
    this.current = 1;
  }

  // Можно ли войти на слой?
  // Слой 1 открыт всегда. 2-й — со Акта 2 и при >=1 якоре.
  // 3-й — со Акта 3 и при >=2 якорях. 4-й — со Акта 4.
  canEnter(layer, act, anchorCount) {
    if (layer < 1 || layer > 4) return false;
    if (layer === 1) return true;
    if (layer === 2) return act >= 2 && anchorCount >= 1;
    if (layer === 3) return act >= 3 && anchorCount >= 2;
    if (layer === 4) return act >= 4;
    return false;
  }

  name(layer) {
    return LAYER_NAMES[layer] || '';
  }

  // Максимальный доступный слой для текущего состояния.
  maxOpen(act, anchorCount) {
    for (let l = 4; l >= 1; l--) {
      if (this.canEnter(l, act, anchorCount)) return l;
    }
    return 1;
  }
}