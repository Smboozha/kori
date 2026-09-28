// main.js — точка входа. Менеджер комнат, переключение сцен, сюжет, сохранение.
//
// ВАЖНО: roomManager.changeRoom() НЕ трогает game.scene.
// Сцену (этап истории) назначает только сам сюжет — через эффект "scene:...".
// game.scene — состояние истории; roomManager.current — текущая комната.
//
// Этап 2: персонажи (characters.js), декор (decor.js), камера с lerp,
// освещение/виньетка, тряска, фейды, звук (audio.js), новое управление.

import { Game, TILE_SIZE, VIEW_W, VIEW_H, clamp, dist } from './engine.js';
import { ROOMS, drawRoom, isSolid, tileAt } from './scenes.js';
import { drawDecor } from './decor.js';
import { drawCharacter } from './characters.js';
import { Dialogue } from './dialogue.js';
import { Lamps } from './lamps.js';
import { Anchors } from './anchors.js';
import { Layers } from './layers.js';
import { resolveEnding, endingById } from './endings.js';
import { AudioSys } from './audio.js';

const SAVE_KEY = 'kori_save_v1';

// Параметры управления (этап 2)
const MOVE_SPEED = 2.5 * TILE_SIZE; // 2.5 тайла/с
const ACCEL = 0.15;                 // плавный разгон
const INTERACT_R = 48;              // E на 1.5 тайла
const WALK_FRAME = 0.15;            // смена кадра ходьбы

// ---------- Загрузка сценария ----------
async function loadScript() {
  try {
    const r = await fetch('data/script.json');
    if (r.ok) {
      console.log('%cСценарий загружен из data/script.json', 'color:#7bd88f');
      return await r.json();
    }
  } catch (e) {
    /* файловый режим */
  }
  try {
    const m = await import('./data/script.js');
    console.log('%cФайловый режим: data/script.js', 'color:#f7a95c');
    return m.default;
  } catch (e) {
    console.error('Не удалось загрузить сценарий', e);
  }
  return {};
}

// ---------- Состояние ----------
const canvas = document.getElementById('game');
const game = new Game(canvas);

const lamps = new Lamps();
const anchors = new Anchors();
const layers = new Layers();
const audio = new AudioSys();

const state = {
  mode: 'startup',        // startup | title | intro | play | ending | load
  scene: 'none',
  flags: defaultFlags(),
  roomId: null,
  player: { x: 0, y: 0, face: 'down' },
  vx: 0, vy: 0,           // скорость (плавный разгон)
  walkT: 0,               // таймер анимации ходьбы
  fade: 0,
  fadeDir: 0,             // -1 входит (0.5с), +1 выходит (1.5с)
  fadeSpeed: 2.0,
  hadSave: false,
  guardAuto: false,
  endingId: null,
  endingVisible: false,
  interactHint: null,
  roomChangedAt: 0,
  camSnap: true,          // камера сразу встаёт на место при смене комнаты
  shake: { t: 0, amp: 4 },// тряска: 0.3с, 4px
  intro: { t: 0, phase: 0, textAlpha: 0, tickT: 0 }, // кинематографичное интро
};

function defaultFlags() {
  return { nasvayThrown: 0, gaveUpAct3: false, sisterRan: false, selfRefused: false };
}

// ---------- Менеджер комнат ----------
const roomManager = {
  current: null,
  changeRoom(id) {
    const room = ROOMS[id];
    if (!room) {
      console.error('Нет комнаты:', id);
      return;
    }
    this.current = room;
    state.roomId = id;
    const s = room.spawn || { x: 10 * TILE_SIZE, y: 10 * TILE_SIZE };
    state.player.x = s.x;
    state.player.y = s.y;
    state.player.face = s.face || 'down';
    state.vx = 0;
    state.vy = 0;
    state.guardAuto = true;
    state.roomChangedAt = Date.now();
    state.camSnap = true;
    // фейд входа: 1 -> 0 за 0.5с
    state.fade = 1;
    state.fadeDir = -1;
    state.fadeSpeed = 2.0;
  },
};

function changeRoom(id) {
  roomManager.changeRoom(id);
}

// ---------- Диспетчер эффектов ----------
// Строки эффектов: "anchor:1", "lamp", "room:iw_class", "scene:iw2",
// "flag:gaveUpAct3:true", "nasvay", "sleep:2", "ending:window", "shake".
function dispatch(ef) {
  if (ef == null) return;
  const list = Array.isArray(ef) ? ef : [ef];
  for (const e of list) {
    const [cmd, ...rest] = String(e).split(':');
    const arg = rest.join(':');
    switch (cmd) {
      case 'anchor': {
        anchors.set(parseInt(arg, 10));
        save();
        break;
      }
      case 'lamp': {
        lamps.extinguishNext();
        save();
        break;
      }
      case 'room': {
        changeRoom(arg);
        break;
      }
      case 'scene': {
        state.scene = arg;
        break;
      }
      case 'flag': {
        const [k, v] = arg ? arg.split(',') : [];
        if (k) state.flags[k] = v === '1' || v === 'true';
        save();
        break;
      }
      case 'nasvay': {
        state.flags.nasvayThrown = (state.flags.nasvayThrown || 0) + 1;
        save();
        break;
      }
      case 'sleep': {
        // выход из внутреннего мира: переход на утро следующего акта
        const act = parseInt(arg, 10);
        if (act === 1) { changeRoom('kitchen_morning2'); state.scene = 'act2_morning'; }
        else if (act === 2) { changeRoom('kitchen_morning3'); state.scene = 'act3_morning'; }
        else if (act === 3) { changeRoom('room_kori4'); state.scene = 'act4'; }
        save();
        break;
      }
      case 'shake': {
        // тряска при побоях: 0.3с, 4px + звук удара
        state.shake.t = 0.3;
        audio.hit();
        break;
      }
      case 'ending': {
        const door = arg; // office | window | stay
        const id = resolveEnding(anchors.count, state.flags, door);
        state.endingId = id;
        state.mode = 'ending';
        state.endingVisible = false;
        state.fade = 0;
        state.fadeDir = 1;
        state.fadeSpeed = 1 / 1.5; // фейд выхода 1.5с
        showEnding(id);
        break;
      }
      default:
        console.warn('Неизвестный эффект:', e);
    }
  }
}

// ---------- Диалоги ----------
let DIALOGUES = {};
const dialogue = new Dialogue(DIALOGUES, dispatch);
dialogue.tick = () => audio.tick();

function startDialogue(id, onEnd) {
  if (!id || !dialogue.has(id)) {
    if (onEnd) onEnd();
    return;
  }
  state.mode = 'dialogue';
  dialogue.start(id, () => {
    state.mode = 'play';
    if (onEnd) onEnd();
  });
}

function autoDialogueFor(room) {
  if (!room) return null;
  if (room.id === 'iw_class') {
    if (state.scene === 'iw2') return 'iw_class2';
    if (state.scene === 'iw3') return 'iw_class3';
    if (state.scene === 'iw4') return 'iw_class4';
    return 'iw_class';
  }
  if (room.id === 'room_kori_night') {
    // ночная сцена: акт1 — сестра, акт2 — тишина, акт3 — мать
    if (state.scene === 'act3_night') return 'night_mother';
    if (state.scene === 'act2_night') return 'night2';
    return 'night_room';
  }
  if (room.auto) return room.auto;
  return null;
}

function startRoomAuto() {
  const d = autoDialogueFor(roomManager.current);
  if (d) startDialogue(d);
}

// ---------- Сохранение ----------
function save() {
  try {
    const data = {
      scene: state.scene,
      room: state.roomId,
      anchors: anchors.save(),
      lamps: lamps.save(),
      flags: state.flags,
      px: Math.round(state.player.x),
      py: Math.round(state.player.y),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) { /* приватный режим */ }
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    anchors.load(data.anchors);
    lamps.load(data.lamps);
    state.flags = { ...defaultFlags(), ...(data.flags || {}) };
    state.scene = data.scene || 'act1_morning';
    changeRoom(data.room || 'room_kori');
    if (data.px) state.player.x = data.px;
    if (data.py) state.player.y = data.py;
    state.mode = 'play';
    state.fade = 0;
    state.fadeDir = 0;
    return true;
  } catch (e) {
    return false;
  }
}

function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  anchors.reset();
  lamps.reset();
  state.flags = defaultFlags();
}

// ---------- Новая игра ----------
function newGame() {
  clearSave();
  anchors.reset();
  lamps.reset();
  state.flags = defaultFlags();
  state.scene = 'act1_morning';
  state.endingId = null;
  state.endingVisible = false;
  state.fade = 1;
  state.fadeDir = 0;
  state.fadeSpeed = 2.0;
  changeRoom('room_kori');
  // кинематографичное интро: тишина, тик будильника, «Опять.» «Ладно.»
  state.mode = 'intro';
  state.intro = { t: 0, phase: 0, textAlpha: 0, tickT: 0 };
  save();
}

// ---------- Концовки ----------
function showEnding(id) {
  const e = endingById(id);
  state.endingId = id;
  state.endingData = {
    id,
    title: e.title,
    color: e.color,
    lines: e.lines,
    anchorsCount: anchors.count,
  };
}

// ---------- Обновление ----------
function update(dt, g, prev) {
  // фейд
  if (state.fadeDir !== 0) {
    state.fade += state.fadeDir * state.fadeSpeed * dt;
    if (state.fade <= 0) { state.fade = 0; state.fadeDir = 0; }
    if (state.fade >= 1) { state.fade = 1; state.fadeDir = 0; }
  }
  // тряска затухает
  if (state.shake.t > 0) state.shake.t = Math.max(0, state.shake.t - dt);

  if (state.mode === 'startup') return;

  // ---- кинематографичное интро ----
  if (state.mode === 'intro') {
    const I = state.intro;
    I.t += dt;
    // тик сломанного будильника в тишине
    I.tickT -= dt;
    if (I.tickT <= 0) {
      I.tickT = 0.6;
      audio.alarmTick();
    }
    // фазы: 0 — тишина (2с), 1 — «Опять.» (1.2с), 2 — пауза (1с),
    // 3 — «Ладно.» (1.2с), 4 — пауза (0.8с), 5 — светлеет (1.5с)
    if (I.phase === 0 && I.t >= 2.0) { I.phase = 1; I.t = 0; }
    else if (I.phase === 1) {
      I.textAlpha = Math.min(1, I.t / 1.0);
      if (I.t >= 1.2) { I.phase = 2; I.t = 0; }
    } else if (I.phase === 2 && I.t >= 1.0) { I.phase = 3; I.t = 0; }
    else if (I.phase === 3) {
      I.textAlpha = Math.min(1, I.t / 1.0);
      if (I.t >= 1.2) { I.phase = 4; I.t = 0; }
    } else if (I.phase === 4 && I.t >= 0.8) { I.phase = 5; I.t = 0; }
    else if (I.phase === 5) {
      state.fade = Math.max(0, 1 - I.t / 1.5);
      if (I.t >= 1.5) {
        state.fade = 0;
        state.mode = 'play';
      }
    }
    return;
  }

  if (state.mode === 'title') {
    if (g.pressed('Space', prev) || g.pressed('Enter', prev)) newGame();
    if (g.pressed('KeyL', prev) || g.pressed('KeyC', prev)) {
      if (g.pressed('KeyL', prev) && state.hadSave) {
        if (loadSave()) { state.fade = 0; }
      } else if (g.pressed('KeyC', prev)) {
        clearSave();
        state.hadSave = hasSave();
      }
    }
    return;
  }

  if (state.mode === 'ending') {
    // после фейда выхода показываем концовку
    if (state.fade >= 1 && !state.endingVisible) state.endingVisible = true;
    if (state.endingVisible && (g.pressed('Space', prev) || g.pressed('Enter', prev))) {
      state.mode = 'title';
    }
    return;
  }

  if (state.mode === 'dialogue') {
    dialogue.update(dt, g, prev);
    return;
  }

  // ---- play ----
  if (state.guardAuto) {
    state.guardAuto = false;
    startRoomAuto();
    if (state.mode !== 'play') return;
  }

  const room = roomManager.current;
  if (!room) return;

  // звук окружения
  audio.hum(room.id.indexOf('iw_') === 0);
  audio.wind(room.id === 'street' || room.id === 'bus_home');

  // ---- управление: плавный разгон к 2.5 тайла/с ----
  let dx = 0, dy = 0;
  if (g.down('KeyA') || g.down('ArrowLeft')) dx -= 1;
  if (g.down('KeyD') || g.down('ArrowRight')) dx += 1;
  if (g.down('KeyW') || g.down('ArrowUp')) dy -= 1;
  if (g.down('KeyS') || g.down('ArrowDown')) dy += 1;
  const moving = dx !== 0 || dy !== 0;
  if (moving) {
    const len = Math.hypot(dx, dy);
    dx /= len; dy /= len;
    state.player.face = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  }
  state.vx += (dx * MOVE_SPEED - state.vx) * ACCEL;
  state.vy += (dy * MOVE_SPEED - state.vy) * ACCEL;
  if (moving) state.walkT += dt; else state.walkT = 0;

  const pl = state.player;
  const boxW = 24, boxH = 26;
  let nx = pl.x + state.vx * dt;
  let ny = pl.y;

  if (!collides(room, nx, ny, boxW, boxH)) pl.x = nx;
  ny = pl.y + state.vy * dt;
  if (!collides(room, pl.x, ny, boxW, boxH)) pl.y = ny;

  audio.step(dt, moving);

  // Проверка на «дверь-тайл» (двери комнат)
  const tileChar = tileAt(room, pl.x + boxW / 2, pl.y + boxH / 2);
  if (tileChar === 'd') {
    const exit = findTileExit(room);
    if (exit) {
      applyEffectsAndMove(exit);
      return;
    }
  }

  // Объекты и NPC (E на 1.5 тайла)
  state.interactHint = null;
  const nearest = nearestInteractable(room, pl.x + boxW / 2, pl.y + boxH / 2);

  if (nearest) {
    state.interactHint = nearest;
    if (g.pressed('KeyE', prev)) {
      interact(nearest);
    }
  }
}

function collides(room, x, y, w, h) {
  const c1 = isSolid(room, x, y);
  const c2 = isSolid(room, x + w, y);
  const c3 = isSolid(room, x, y + h);
  const c4 = isSolid(room, x + w, y + h);
  return c1 || c2 || c3 || c4;
}

function applyEffectsAndMove(exit) {
  if (exit.effects && exit.effects.length) {
    dispatch(exit.effects);
  } else if (exit.room) {
    changeRoom(exit.room);
  }
}

function nearestInteractable(room, px, py) {
  let best = null;
  let bestD = 99999;
  // объекты комнаты
  if (room.objects) {
    for (const ob of room.objects) {
      if (ob.hidden) continue;
      const cx = ob.tx * TILE_SIZE + TILE_SIZE / 2;
      const cy = ob.ty * TILE_SIZE + TILE_SIZE / 2;
      const d = dist(px, py, cx, cy);
      if (d < INTERACT_R && d < bestD) { best = { type: 'obj', data: ob, cx, cy, label: ob.label }; bestD = d; }
    }
  }
  // NPC
  if (room.npcs) {
    for (const np of room.npcs) {
      if (!np.diag) continue;
      const cx = np.tx * TILE_SIZE + TILE_SIZE / 2;
      const cy = np.ty * TILE_SIZE + TILE_SIZE / 2;
      const d = dist(px, py, cx, cy);
      if (d < INTERACT_R && d < bestD) { best = { type: 'npc', data: np, cx, cy, label: np.label || '' }; bestD = d; }
    }
  }
  // Динамические объекты внутреннего мира (девочка, доска, двери, свет)
  const dyn = dynamicObjects(room);
  for (const ob of dyn) {
    const cx = ob.tx * TILE_SIZE + TILE_SIZE / 2;
    const cy = ob.ty * TILE_SIZE + TILE_SIZE / 2;
    const d = dist(px, py, cx, cy);
    if (d < INTERACT_R && d < bestD) { best = { type: 'dyn', data: ob, cx, cy, label: ob.label }; bestD = d; }
  }
  return best;
}

function interact(t) {
  const d = t.data.diag || null;
  if (d) {
    const diagId = dynamicDiag(t.data);
    startDialogue(diagId || d);
  }
}

// Динамический выбор диалога для объектов внутреннего мира
function dynamicDiag(ob) {
  if (ob.dynamicDiag) {
    if (ob.diag === 'iw_lamps_dyn') {
      if (state.scene === 'iw1') return 'iw_lamps1';
      if (state.scene === 'iw2') return 'iw_lamps2';
      if (state.scene === 'iw3') return 'iw_lamps3';
      return 'iw_lamps4';
    }
    if (ob.diag === 'iw_window_dyn') {
      return state.scene === 'iw4' ? 'iw_window_snow' : 'iw_window_flat';
    }
  }
  return ob.diag;
}

// Позиция девочки у окна по акту (единая для интеракции и отрисовки)
function girlTile(scene) {
  return { iw1: { tx: 23, ty: 6 }, iw2: { tx: 2, ty: 13 }, iw3: { tx: 13, ty: 17 } }[scene] || null;
}

// Динамические объекты (появляются по сюжету)
function dynamicObjects(room) {
  const out = [];
  if (room.id === 'iw_class') {
    const gp = girlTile(state.scene);
    if (gp) {
      out.push({ tx: gp.tx, ty: gp.ty, label: 'Девочка', diag: 'girl_words', charId: 'girl', kind: 'girl' });
    }
    // доска: во 2-м акте (якорь 4)
    if (state.scene === 'iw2') {
      out.push({ tx: 3, ty: 2, label: 'Доска', diag: 'board_anchor4', kind: 'board' });
    }
    // дверь «в глубину» (слои)
    out.push({ tx: 3, ty: 0, label: 'Дверь в глубину', diag: deepDoorDiag(), kind: 'deepdoor' });
    // проснуться
    if (state.scene !== 'iw4') {
      out.push({ tx: 15, ty: 19, label: 'Проснуться', diag: 'iw_sleep_' + (state.scene === 'iw1' ? '1' : state.scene === 'iw2' ? '2' : '3'), kind: 'sleep' });
    }
    // три двери в финале
    if (state.scene === 'iw4') {
      out.push({ tx: 26, ty: 10, label: 'Кабинет директора', diag: 'final_doors', kind: 'final' });
      out.push({ tx: 28, ty: 5, label: 'Окно', diag: 'final_doors', kind: 'final' });
      out.push({ tx: 26, ty: 15, label: 'Порог', diag: 'final_doors', kind: 'final' });
    }
  }
  if (room.id === 'iw_room') {
    out.push({ tx: 13, ty: 1, label: 'Лампа', diag: 'child_lamp', kind: 'lamp' });
  }
  return out;
}

function deepDoorDiag() {
  if (state.scene === 'iw1') return 'iw_door_locked';
  if (state.scene === 'iw2') {
    return layers.canEnter(2, 3, anchors.count) ? 'deepdoor_2' : 'iw_door_locked';
  }
  if (state.scene === 'iw3') {
    return layers.canEnter(3, 3, anchors.count) ? 'deepdoor_3' : 'iw_door_locked';
  }
  return 'deepdoor_4';
}

// ---------- Переходы между комнатами (двери) ----------
function findTileExit(room) {
  // переходы, заданные в room.trans (ключ "tx,ty")
  for (const k in room.trans) {
    const [tx, ty] = k.split(',').map(Number);
    const px = state.player.x + 12;
    const py = state.player.y + 13;
    if (Math.floor(px / TILE_SIZE) === tx && Math.floor(py / TILE_SIZE) === ty) {
      return { ...room.trans[k], tileKey: k };
    }
  }
  return null;
}

// ---------- Камера ----------
let _cam = { x: 0, y: 0 };

function updateCamera(room) {
  const maxX = Math.max(0, room.w * TILE_SIZE - VIEW_W);
  const maxY = Math.max(0, room.h * TILE_SIZE - VIEW_H);
  const targetX = clamp(state.player.x - VIEW_W / 2, 0, maxX);
  const targetY = clamp(state.player.y - VIEW_H / 2, 0, maxY);
  // малые комнаты центрируются
  const cx = room.w * TILE_SIZE < VIEW_W ? (VIEW_W - room.w * TILE_SIZE) / 2 : targetX;
  const cy = room.h * TILE_SIZE < VIEW_H ? (VIEW_H - room.h * TILE_SIZE) / 2 : targetY;
  if (state.camSnap) {
    _cam.x = cx;
    _cam.y = cy;
    state.camSnap = false;
  } else {
    _cam.x += (cx - _cam.x) * 0.1;
    _cam.y += (cy - _cam.y) * 0.1;
  }
}

// ---------- Отрисовка ----------
function draw(ctx, g) {
  ctx.fillStyle = '#050508';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  if (state.mode === 'startup') return;

  if (state.mode === 'title') {
    drawTitle(ctx);
    return;
  }

  // интро: комната под чёрным, медленный текст, светлеет в конце
  if (state.mode === 'intro') {
    const room = roomManager.current;
    if (room) {
      updateCamera(room);
      drawRoom(ctx, room, _cam.x, _cam.y);
      drawDecor(ctx, room, _cam.x, _cam.y);
      drawPlayer(ctx, _cam.x, _cam.y);
    }
    const I = state.intro;
    const alpha = I.phase === 5 ? state.fade : 1;
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    if (I.phase >= 1 && I.phase <= 4) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = `rgba(225,220,205,${I.textAlpha})`;
      ctx.font = '34px "Trebuchet MS", sans-serif';
      ctx.fillText(I.phase <= 2 ? 'Опять.' : 'Ладно.', VIEW_W / 2, VIEW_H / 2);
    }
    return;
  }

  if (state.mode === 'ending') {
    // фейд выхода (0 -> 1 за 1.5с) уводит в черноту, затем показываем концовку
    if (state.endingVisible) drawEnding(ctx);
    return;
  }

  const room = roomManager.current;
  if (!room) return;

  updateCamera(room);

  // тряска: смещение мира на случайный вектор в пределах амплитуды
  let shX = 0, shY = 0;
  if (state.shake.t > 0) {
    const k = state.shake.t / 0.3;
    shX = (Math.random() * 2 - 1) * state.shake.amp * k;
    shY = (Math.random() * 2 - 1) * state.shake.amp * k;
  }

  ctx.save();
  ctx.translate(shX, shY);

  drawRoom(ctx, room, _cam.x, _cam.y);
  drawDecor(ctx, room, _cam.x, _cam.y);

  // отрисовка объектов комнаты (подсветка)
  drawObjects(ctx, room, _cam.x, _cam.y);

  // лампы
  if (room.id === 'iw_class') {
    drawLamps(ctx, _cam.x, _cam.y);
  }

  // NPC
  drawNpcs(ctx, room, _cam.x, _cam.y, g);

  // девочка внутреннего мира (поверх)
  if (room.id === 'iw_class') {
    drawGirl(ctx, _cam.x, _cam.y);
  }

  // игрок
  drawPlayer(ctx, _cam.x, _cam.y);

  ctx.restore();

  // освещение и виньетка
  drawLighting(ctx, room);

  // подсказка взаимодействия
  drawHint(ctx);

  // диалог
  if (state.mode === 'dialogue') {
    dialogue.draw(g);
  }

  // фейд
  if (state.fade > 0) {
    ctx.fillStyle = `rgba(0,0,0,${state.fade})`;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
}

// Источники света для вырезов в тени
function lightSources(room) {
  const out = [];
  const add = (tx, ty, r, a) => out.push({ x: tx * TILE_SIZE + 16 - _cam.x, y: ty * TILE_SIZE + 16 - _cam.y, r, a });
  // окна
  for (let ty = 0; ty < room.h; ty++) {
    for (let tx = 0; tx < room.w; tx++) {
      const ch = room.map[ty][tx];
      if (ch === 'w' || ch === 'W') add(tx, ty, 70, 0.85);
    }
  }
  // лампы внутреннего мира (горящие)
  if (room.id === 'iw_class' && room.lamps) {
    room.lamps.forEach((l, i) => {
      if (lamps.isLit(i)) add(l.tx, l.ty, 95, 1);
    });
  }
  // слабая тёплая лампа в комнате Кори (у кровати)
  if (room.id === 'room_kori' || room.id === 'room_kori_night' || room.id === 'room_kori4') {
    add(5, 1, 55, 0.45);
  }
  // жёлтая лампа над столом на кухне
  if (room.theme === 'kitchen') {
    add(5, 1, 75, 0.7);
  }
  // игрок — небольшой свет вокруг
  add(Math.floor(state.player.x / TILE_SIZE), Math.floor(state.player.y / TILE_SIZE), 55, 0.5);
  return out;
}

// Тень + вырезы света + цветовой тон + виньетка
function drawLighting(ctx, room) {
  const lights = lightSources(room);
  ctx.save();
  // базовая тень: ночью темнее
  const base = room.night ? 0.55 : 0.32;
  ctx.fillStyle = `rgba(0,0,0,${base})`;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // градиентная тень от краёв комнаты к центру (глубина)
  const roomCX = room.w * TILE_SIZE / 2 - _cam.x;
  const roomCY = room.h * TILE_SIZE / 2 - _cam.y;
  const amb = ctx.createRadialGradient(roomCX, roomCY, 40, roomCX, roomCY, Math.max(VIEW_W, VIEW_H) * 0.7);
  amb.addColorStop(0, 'rgba(0,0,0,0)');
  amb.addColorStop(1, `rgba(0,0,0,${room.night ? 0.25 : 0.12})`);
  ctx.fillStyle = amb;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // вырезы света от источников
  ctx.globalCompositeOperation = 'destination-out';
  for (const l of lights) {
    const grd = ctx.createRadialGradient(l.x, l.y, 4, l.x, l.y, l.r);
    grd.addColorStop(0, `rgba(0,0,0,${l.a})`);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(l.x - l.r, l.y - l.r, l.r * 2, l.r * 2);
  }
  ctx.restore();

  // цветовой тон: внутренний мир — жёлтый, Омск — серо-синий
  if (room.theme === 'inner') {
    ctx.fillStyle = 'rgba(255,220,120,0.07)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  } else if (room.theme === 'street' || room.theme === 'bus') {
    ctx.fillStyle = 'rgba(120,140,180,0.08)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }

  // виньетка усиливается с гашением ламп
  const v = 0.22 + (4 - lamps.litCount) * 0.05;
  const vg = ctx.createRadialGradient(VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.35, VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.8);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, `rgba(0,0,0,${v})`);
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

function drawLamps(ctx, camX, camY) {
  // четыре лампы в классе
  const room = roomManager.current;
  const lampsPos = room.lamps || [];
  lampsPos.forEach((l, i) => {
    const sx = l.tx * TILE_SIZE - camX + TILE_SIZE / 2;
    const sy = l.ty * TILE_SIZE - camY + TILE_SIZE / 2;
    const lit = lamps.isLit(i);
    if (lit) {
      const grd = ctx.createRadialGradient(sx, sy, 4, sx, sy, 34);
      grd.addColorStop(0, 'rgba(255,225,120,0.75)');
      grd.addColorStop(1, 'rgba(255,225,120,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(sx - 34, sy - 34, 68, 68);
      ctx.fillStyle = '#f5c542';
      ctx.beginPath();
      ctx.arc(sx, sy, 8, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(60,58,50,0.9)';
      ctx.beginPath();
      ctx.arc(sx, sy, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function drawGirl(ctx, camX, camY) {
  const gp = girlTile(state.scene);
  if (!gp) return;
  const sx = gp.tx * TILE_SIZE - camX;
  const sy = gp.ty * TILE_SIZE - camY;
  drawCharacter(ctx, sx, sy, 'girl', { face: 'down' });
}

function drawObjects(ctx, room, camX, camY) {
  if (room.objects) {
    for (const ob of room.objects) {
      if (ob.hidden) continue;
      const sx = ob.tx * TILE_SIZE - camX;
      const sy = ob.ty * TILE_SIZE - camY;
      // лёгкая маркировка интересных мест
      ctx.fillStyle = 'rgba(255,240,180,0.10)';
      ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
    }
  }
  const dyn = dynamicObjects(room);
  for (const ob of dyn) {
    const sx = ob.tx * TILE_SIZE - camX;
    const sy = ob.ty * TILE_SIZE - camY;
    ctx.fillStyle = 'rgba(255,240,180,0.14)';
    ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
  }
}

function drawNpcs(ctx, room, camX, camY, g) {
  if (!room.npcs) return;
  for (const np of room.npcs) {
    const sx = np.tx * TILE_SIZE - camX;
    const sy = np.ty * TILE_SIZE - camY;
    drawCharacter(ctx, sx, sy, np.charId || 'kori', { face: 'down' });
  }
}

function drawPlayer(ctx, camX, camY) {
  const p = state.player;
  const sx = p.x - camX;
  const sy = p.y - camY;
  const moving = Math.abs(state.vx) > 2 || Math.abs(state.vy) > 2;
  const frame = Math.floor(state.walkT / WALK_FRAME) % 2;
  drawCharacter(ctx, sx, sy, 'kori', { face: p.face, walk: moving, frame });
}

function drawHint(ctx) {
  if (!state.interactHint) return;
  const t = state.interactHint;
  const cx = t.cx - _cam.x;
  const cy = t.cy - _cam.y;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(cx - 20, cy - 34, 40, 20);
  ctx.fillStyle = '#ffe9a8';
  ctx.font = '12px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('E', cx, cy - 31);
  ctx.font = '11px "Trebuchet MS", sans-serif';
  ctx.fillStyle = 'rgba(255,245,210,0.9)';
  ctx.fillText(t.label, cx, cy + 8);
}

function drawTitle(ctx) {
  ctx.fillStyle = '#0a0a10';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // размытая лампа
  const grd = ctx.createRadialGradient(480, 220, 10, 480, 220, 260);
  grd.addColorStop(0, 'rgba(245,197,66,0.16)');
  grd.addColorStop(1, 'rgba(245,197,66,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#ffd75e';
  ctx.font = '80px "Trebuchet MS", sans-serif';
  ctx.fillText('КОРИ', VIEW_W / 2, 150);

  ctx.fillStyle = 'rgba(220,210,185,0.8)';
  ctx.font = '17px "Trebuchet MS", sans-serif';
  ctx.fillText('Омск. Зима. Тринадцать лет.', VIEW_W / 2, 260);
  ctx.fillText('Пустая школа ждёт, когда он придёт.', VIEW_W / 2, 286);

  ctx.fillStyle = 'rgba(255,233,168,0.9)';
  ctx.font = '15px "Trebuchet MS", sans-serif';
  const y = 400;
  if (state.hadSave) {
    ctx.fillText('Пробел — новая игра      L — продолжить      C — стереть сейв', VIEW_W / 2, y);
  } else {
    ctx.fillText('Пробел — начать      C — стереть сейв', VIEW_W / 2, y);
  }
  ctx.fillStyle = 'rgba(200,190,160,0.55)';
  ctx.font = '13px "Trebuchet MS", sans-serif';
  ctx.fillText('WASD/стрелки — ходить    E — взаимодействие    Пробел — диалог/выбор', VIEW_W / 2, y + 40);
  ctx.fillStyle = 'rgba(150,140,110,0.5)';
  ctx.fillText('Пройди путь от дома до пустой школы. Собери якоря памяти.', VIEW_W / 2, y + 70);
}

function drawEnding(ctx) {
  const e = state.endingData;
  ctx.fillStyle = '#050508';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  const grd = ctx.createRadialGradient(480, 120, 10, 480, 120, 300);
  grd.addColorStop(0, e.color + '2a');
  grd.addColorStop(1, '#050508');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = e.color || '#fff';
  ctx.font = '58px "Trebuchet MS", sans-serif';
  ctx.fillText(e.title, VIEW_W / 2, 90);

  ctx.font = '16px "Trebuchet MS", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillText('концовка ' + e.id + ' из 8   ·   якорей памяти: ' + e.anchorsCount + ' / 7', VIEW_W / 2, 170);

  let y = 250;
  ctx.fillStyle = 'rgba(235,229,214,0.92)';
  for (const line of e.lines) {
    ctx.font = '17px "Trebuchet MS", sans-serif';
    const words = line.split(' ');
    let lineTxt = '';
    let yy = y;
    for (const w of words) {
      const test = lineTxt ? lineTxt + ' ' + w : w;
      if (ctx.measureText(test).width > VIEW_W - 240 && lineTxt) {
        ctx.fillText(lineTxt, VIEW_W / 2, yy);
        lineTxt = w;
        yy += 26;
      } else {
        lineTxt = test;
      }
    }
    if (lineTxt) ctx.fillText(lineTxt, VIEW_W / 2, yy);
    y = yy + 30;
  }

  ctx.font = '13px "Trebuchet MS", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillText('Пробел — в меню', VIEW_W / 2, VIEW_H - 40);
}

function hasSave() {
  try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
}

// ---------- Точка входа ----------
(async function boot() {
  DIALOGUES = await loadScript();
  dialogue.script = DIALOGUES;
  state.hadSave = hasSave();
  state.mode = 'title';

  game.app = { update, draw };

  // Звук инициализируется по первому жесту
  const gesture = () => audio.init();
  window.addEventListener('keydown', gesture, { once: true });
  canvas.addEventListener('click', gesture, { once: true });

  // Небольшой отладочный мост для проверок и будущих инструментов
  window.__kori = {
    get state() { return state; },
    get game() { return game; },
    get dialogue() { return dialogue; },
    get lamps() { return lamps; },
    get anchors() { return anchors; },
    get audio() { return audio; },
    get cam() { return { x: _cam.x, y: _cam.y }; },
    changeRoom: (id) => changeRoom(id),
    newGame: () => newGame(),
    save: () => save(),
    startDialogue: (id) => startDialogue(id),
    resolveEnding: () => resolveEnding(),
  };

  canvas.addEventListener('click', () => {
    if (state.mode === 'title') newGame();
  });
})();