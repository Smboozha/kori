// dialogue.js — система диалогов и интерактивов. Загружается из data/script.json.
//
// Новый формат сценария:
//   { "dialogues": { "id": { "start": "n1", "nodes": { "n1": { speaker?, text?,
//       next?, choices?[{label,next,effect?,endEffect?}], effect?, endEffect?, end?, emotion? } } } },
//     "interactives": { "obj_id": { "text": "...", effect?, choices?, nodes? } } }
//
// effect    — применяется сразу, когда узел становится текущим.
// endEffect — применяется при закрытии диалога (если диалог закончился на этом узле).
// emotion   — эмоция для портрета: neutral | sad | angry | happy | tired | scared.
// Если у узла нет ни next, ни end — переход к следующему узлу по порядку ключей.
//
// Управление: Пробел/Enter — дальше, выбор — Стрелки + Пробел или цифры 1..9.

import { VIEW_W, VIEW_H } from './engine.js';
import { drawPortrait } from './characters.js';

export const SPEAKER_COLORS = {
  'Кори': '#7fb2dd',
  'Сестра': '#f0a4bd',
  'Мать': '#b9b9b9',
  'Отец': '#e08a8a',
  'Девочка': '#8fd0a8',
  'Новенькая': '#6ec6b7',
  'Дед': '#c29b6b',
  'Учительница': '#d8c9a0',
  'Мальчик': '#7fb2dd',
};

export const SPEAKER_CHARS = {
  'Кори': 'kori',
  'Сестра': 'sister',
  'Мать': 'mother',
  'Отец': 'father',
  'Девочка': 'girl',
  'Новенькая': 'girl_backpack',
  'Дед': 'ded',
  'Учительница': 'teacher',
  'Мальчик': 'boy',
};

export class Dialogue {
  constructor(script, dispatch) {
    this.script = script;      // весь сценарий из script.json
    this.dispatch = dispatch;  // main.dispatch — применяет эффект-строку
    this.active = false;
    this.d = null;             // текущий диалог
    this.node = null;          // текущий узел
    this.nodeId = null;
    this.choices = null;
    this.cursor = 0;
    this.onEnd = null;
    this.tick = null;          // звуковой тик при смене узла
  }

  has(id) {
    return !!(this.script.dialogues && this.script.dialogues[id]) ||
           !!(this.script.interactives && this.script.interactives[id]);
  }

  start(id, onEnd) {
    const dlg = this.script.dialogues && this.script.dialogues[id];
    if (dlg) {
      this._begin(dlg, onEnd);
      return true;
    }
    const it = this.script.interactives && this.script.interactives[id];
    if (it) {
      // Интерактив: виртуальный диалог из одной реплики (+ выборы, если есть)
      const nodes = { n1: { text: it.text, end: true } };
      if (it.choices) {
        nodes.n1 = {
          text: it.text,
          choices: it.choices.map((c) => ({ label: c.label, next: c.next, effect: c.effect, endEffect: c.endEffect })),
        };
        for (const k in (it.nodes || {})) nodes[k] = { ...it.nodes[k] };
      }
      this._begin({ start: 'n1', nodes }, onEnd);
      if (it.effect) this._apply(it.effect);
      return true;
    }
    console.warn('Диалог не найден:', id);
    return false;
  }

  _begin(d, onEnd) {
    this.active = true;
    this.d = d;
    this.onEnd = onEnd || null;
    this.cursor = 0;
    this._showNode(d.start);
  }

  _showNode(id) {
    this.nodeId = id;
    this.node = this.d.nodes[id] || null;
    this.choices = null;
    this.cursor = 0;
    if (!this.node) {
      this._end();
      return;
    }
    this._apply(this.node.effect);
    if (this.node.choices) this.choices = this.node.choices.slice();
    if (this.tick) this.tick();
  }

  _apply(ef) {
    if (ef == null) return;
    const list = Array.isArray(ef) ? ef : [ef];
    for (const e of list) {
      try {
        this.dispatch(e);
      } catch (err) {
        console.error('Эффект не применён:', e, err);
      }
    }
  }

  update(dt, game, prev) {
    if (!this.active) return;
    const space = game.pressed('Space', prev) || game.pressed('Enter', prev);
    const up = game.pressed('ArrowUp', prev) || game.pressed('KeyW', prev);
    const down = game.pressed('ArrowDown', prev) || game.pressed('KeyS', prev);

    if (this.choices && this.choices.length) {
      const digits = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0'];
      digits.forEach((code, i) => {
        if (game.pressed(code, prev) && i < this.choices.length) this._pick(i);
      });
      if (up) this.cursor = (this.cursor - 1 + this.choices.length) % this.choices.length;
      if (down) this.cursor = (this.cursor + 1) % this.choices.length;
      if (space) this._pick(this.cursor);
      return;
    }

    if (space) this._advance();
  }

  _pick(i) {
    const choice = this.choices[i];
    this._apply(choice.effect);
    this._apply(choice.endEffect);
    if (choice.next) {
      this._showNode(choice.next);
    } else {
      this._end();
    }
  }

  _advance() {
    const node = this.node;
    if (node.end) {
      this._end();
      return;
    }
    if (node.next) {
      this._showNode(node.next);
      return;
    }
    // Нет next и нет end — следующий узел по порядку ключей (линейный поток)
    const keys = Object.keys(this.d.nodes);
    const idx = keys.indexOf(this.nodeId);
    const nxt = keys[idx + 1];
    if (nxt) {
      this._showNode(nxt);
      return;
    }
    this._end();
  }

  _end() {
    const endEfs = this.node ? this.node.endEffect : null;
    this.active = false;
    this._apply(endEfs);
    const cb = this.onEnd;
    this.onEnd = null;
    if (cb) cb();
  }

  // ---- Отрисовка интерфейса диалога ----
  draw(game) {
    if (!this.active || !this.node) return;
    const ctx = game.ctx;
    const PANEL_H = 190;
    const y0 = VIEW_H - PANEL_H - 12;

    ctx.fillStyle = 'rgba(8,8,10,0.86)';
    ctx.fillRect(6, y0, VIEW_W - 12, PANEL_H);
    ctx.strokeStyle = 'rgba(200,180,120,0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(6, y0, VIEW_W - 12, PANEL_H);

    const node = this.node;
    const hasPortrait = !!node.speaker;
    const x0 = 26;
    const maxW = VIEW_W - 52 - (hasPortrait ? 130 : 0);
    let ty = y0 + 18;

    if (node.speaker) {
      const color = SPEAKER_COLORS[node.speaker] || '#c9c3b2';
      ctx.font = game.boldFont(15);
      ctx.fillStyle = color;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(node.speaker, x0, ty);
      ty += 26;
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(x0, ty - 10, maxW, 1);
    }

    const body = node.text || '';

    if (node.choices && node.choices.length) {
      const after = this._drawText(game, body, x0, ty, maxW, 'rgba(233,229,216,0.95)', 16);
      ty = after + 12;
      ctx.font = '13px "Trebuchet MS", sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.textAlign = 'right';
      ctx.fillText('↑↓ / 1-9 — выбрать   Пробел — подтвердить', VIEW_W - 26, VIEW_H - 22);
      for (let i = 0; i < node.choices.length; i++) {
        const ch = node.choices[i];
        const sel = i === this.cursor;
        if (sel) {
          ctx.fillStyle = 'rgba(240,220,140,0.5)';
          ctx.fillRect(x0 - 12, ty + i * 24 - 3, maxW + 14, 22);
          ctx.fillStyle = '#ffe9a8';
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.28)';
        }
        ctx.font = '15px "Trebuchet MS", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('• ' + ch.label, x0, ty + i * 24);
      }
      this._drawPortrait(ctx, node);
      return;
    }

    this._drawText(game, body, x0, ty, maxW, node.speaker ? 'rgba(233,229,216,0.95)' : 'rgba(196,188,168,0.9)', node.speaker ? 16 : 15);
    ctx.font = '13px "Trebuchet MS", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(node.end ? '▶ Закрыть' : '▼ Дальше — Пробел', VIEW_W - 26, VIEW_H - 22);
    this._drawPortrait(ctx, node);
  }

  _drawPortrait(ctx, node) {
    if (!node.speaker) return;
    const charId = SPEAKER_CHARS[node.speaker] || 'kori';
    const emotion = node.emotion || 'neutral';
    const y0 = VIEW_H - 190 - 12;
    drawPortrait(ctx, VIEW_W - 78, y0 + 95, charId, emotion, 34);
  }

  _drawText(game, txt, x, y, maxW, color, size) {
    if (!txt) return y;
    const ctx = game.ctx;
    ctx.font = size + 'px "Trebuchet MS", sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const lines = String(txt).split('\n');
    let yy = y;
    for (const raw of lines) {
      const words = raw.split(' ');
      const lineH = size + 6;
      let line = '';
      for (const word of words) {
        const test = line ? line + ' ' + word : word;
        if (ctx.measureText(test).width > maxW && line) {
          ctx.fillText(line, x, yy);
          line = word;
          yy += lineH;
        } else {
          line = test;
        }
      }
      if (line) ctx.fillText(line, x, yy);
      yy += lineH;
    }
    return yy;
  }
}