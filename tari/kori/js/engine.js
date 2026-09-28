// engine.js — базовый движок: игровой цикл, ввод, коллизии, отрисовка.
// Никакой игровой логики здесь нет — только скелет, которым управляет main.js.

export const TILE_SIZE = 32;
export const VIEW_W = 960;
export const VIEW_H = 640;

// Малый движок. Подписывается на клавиатуру, крутит цикл и вызывает
// app.update(dt, game, prev) и app.draw(ctx, game), если app задан.
export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.keys = {};
    this._prev = {};
    this.app = null;
    this.last = 0;
    this._bind();
    requestAnimationFrame((t) => this._loop(t));
  }

  _bind() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code.indexOf('Arrow') === 0 || e.key === 'Enter') {
        e.preventDefault();
      }
      this.keys[e.code] = true;
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  down(code) {
    return !!this.keys[code];
  }

  pressed(code, prev) {
    return !!this.keys[code] && !prev[code];
  }

  _loop(t) {
    if (!this.last) this.last = t;
    const dt = Math.min(0.05, (t - this.last) / 1000);
    this.last = t;
    if (this.app) {
      if (this.app.update) this.app.update(dt, this, this._prev);
      if (this.app.draw) this.app.draw(this.ctx, this);
    }
    // Снимок нажатий в конце кадра: pressed() сравнивает с тем, что было
    // на предыдущем кадре, и корректно ловит «края» клавиш между кадрами.
    this._prev = { ...this.keys };
    requestAnimationFrame((tt) => this._loop(tt));
  }

  // ---- Утилиты отрисовки ----
  rect(x, y, w, h, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  text(txt, x, y, size, color, align, font) {
    this.ctx.fillStyle = color || '#ffffff';
    this.ctx.font = (font || (size || 14) + 'px "Trebuchet MS", sans-serif');
    this.ctx.textAlign = align || 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(txt, x, y);
  }

  textWrap(txt, x, y, maxW, size, color, lineH) {
    const ctx = this.ctx;
    ctx.fillStyle = color || '#ffffff';
    ctx.font = (size || 14) + 'px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const words = txt.split(' ');
    let line = '';
    let yy = y;
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, yy);
        line = word;
        yy += lineH || (size || 14) + 6;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, x, yy);
    return yy;
  }

  boldFont(px) {
    return 'bold ' + px + 'px "Trebuchet MS", sans-serif';
  }
}

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);