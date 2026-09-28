// scenes.js — все комнаты. Карты на сетке 32x32, стили, объекты, NPC.
// changeRoom() держит только текущую комнату и НЕ трогает game.scene —
// сюжетом распоряжается main.js отдельно.

import { TILE_SIZE, VIEW_W, VIEW_H } from './engine.js';

// ---- Утилиты построения карт ----
export function grid(w, h, ch = '.') {
  return Array.from({ length: h }, () => ch.repeat(w));
}

function put(g, s, x, y) {
  const lines = Array.isArray(s) ? s : [s];
  lines.forEach((ln, i) => {
    const row = g[y + i];
    if (row === undefined) return;
    const arr = row.split('');
    for (let j = 0; j < ln.length; j++) {
      if (x + j < arr.length) arr[x + j] = ln[j];
    }
    g[y + i] = arr.join('');
  });
}

function frame(g, ch = '#') {
  const w = g[0].length;
  const h = g.length;
  g[0] = ch.repeat(w);
  g[h - 1] = ch.repeat(w);
  for (let y = 1; y < h - 1; y++) {
    g[y] = ch + g[y].slice(1, w - 1) + ch;
  }
  return g;
}

// ---- Конструкторы комнат ----
// Комната Кори: 8×6, тесная, как реальный дом в частном секторе.
// Кровать вдоль левой стены, тумбочка рядом, окно на верхней стене,
// дверь на правой. Всё вплотную, ничего лишнего.
function buildKoriRoom() {
  const m = frame(grid(8, 6));
  put(m, 'ww', 1, 0);            // окно на верхней стене
  put(m, ['BB', 'BB'], 1, 2);    // кровать вдоль левой стены
  put(m, 'd', 6, 3);             // дверь на правой стене
  return m;
}

function buildKitchen(extra = '') {
  const m = frame(grid(30, 20));
  put(m, 'www', 12, 0);          // окно
  put(m, ['FF', 'FF'], 2, 2);    // холодильник
  put(m, ['S', 'S'], 2, 5);      // плита
  put(m, 'x', 3, 7);             // столешница
  put(m, 'x', 2, 8);
  put(m, ['T', 'T', 'T'], 12, 8); // стол
  put(m, ['T', 'T', 'T'], 12, 9);
  put(m, 'C', 11, 8);            // стулья
  put(m, 'C', 15, 9);
  put(m, 'd', 0, 14);            // назад в комнату
  put(m, 'd', 29, 14);           // на улицу
  if (extra) put(m, extra, 16, 5); // например M — буфет, P — календарь
  return m;
}

function buildStreet() {
  let m = grid(30, 20, '.');
  m = frame(m, '#');             // забор/стены домов
  // сугробы по краям
  for (let x = 0; x < 30; x++) {
    put(m, 'Q', x, 2);
    put(m, 'Q', x, 17);
  }
  put(m, 'rrrrrrrrrrrrrrrrrrrrrrrrrrrrrr', 0, 8); // дорога
  put(m, 'o', 5, 3); put(m, 'o', 6, 3);            // деревья
  put(m, 'o', 23, 3); put(m, 'o', 24, 4);
  put(m, 'o', 4, 16); put(m, 'o', 25, 15);
  put(m, 'G', 14, 5);             // остановка
  put(m, 'd', 29, 10);            // вход в школу
  return m;
}

function buildSchoolHall(w = 30) {
  const m = frame(grid(w, 20, '='));
  put(m, 'LL', 1, 4); put(m, 'LL', 1, 5);        // шкафчики слева
  put(m, 'LL', 1, 10); put(m, 'LL', 1, 11);
  put(m, 'LL', w - 3, 4); put(m, 'LL', w - 3, 5);
  put(m, 'www', 14, 0);
  if (w === 30) put(m, 'd', 15, 19);             // дверь на урок
  return m;
}

function buildClass() {
  const m = frame(grid(30, 20, '#'));
  for (let y = 1; y < 19; y++) for (let x = 1; x < 29; x++) {
    const arr = m[y].split('');
    arr[x] = '=';
    m[y] = arr.join('');
  }
  put(m, 'OOO', 2, 2);              // доска
  put(m, ['C', 'T', 'C'], 6, 5);    // парты в ряд
  put(m, ['C', 'T', 'C'], 6, 8);
  put(m, ['C', 'T', 'C'], 12, 5);
  put(m, ['C', 'T', 'C'], 12, 8);
  put(m, ['C', 'T', 'C'], 18, 5);
  put(m, ['C', 'T', 'C'], 18, 8);
  put(m, ['C', 'T', 'C'], 24, 5);
  put(m, ['C', 'T', 'C'], 24, 8);
  put(m, 'www', 14, 0);
  put(m, 'd', 15, 19);
  return m;
}

function buildBus() {
  const m = frame(grid(30, 20, ':'));
  for (let y = 1; y < 19; y++) for (let x = 1; x < 29; x++) {
    const arr = m[y].split('');
    arr[x] = ',';
    m[y] = arr.join('');
  }
  put(m, 'wwwwww', 4, 0); put(m, 'wwwwww', 12, 0); put(m, 'wwwwww', 20, 0);
  put(m, 'BBBB', 2, 3); put(m, 'BBBB', 2, 4);      // сиденья
  put(m, 'BBBB', 24, 3); put(m, 'BBBB', 24, 4);
  put(m, 'BBBB', 2, 12); put(m, 'BBBB', 2, 13);
  put(m, 'BBBB', 24, 12); put(m, 'BBBB', 24, 13);
  put(m, 'x', 14, 6);                               // руль/поручень
  put(m, 'd', 29, 10);
  return m;
}

function buildSisterRoom() {
  const m = frame(grid(30, 20));
  for (let y = 1; y < 19; y++) for (let x = 1; x < 29; x++) {
    const arr = m[y].split('');
    arr[x] = '=';
    m[y] = arr.join('');
  }
  put(m, 'www', 14, 0);                 // окно
  put(m, ['BB', 'BB'], 5, 12);          // кровать
  put(m, 'T', 15, 13);                  // столик с альбомом
  put(m, 'C', 15, 14);
  put(m, ['RR', 'RR'], 12, 15);         // коврик
  put(m, 'd', 29, 14);                  // дверь на кухню
  return m;
}

function buildHouseCorridor() {
  const m = frame(grid(30, 20));
  // двери: в комнату Кори и на кухню
  put(m, 'd', 0, 10);
  put(m, 'd', 29, 10);
  return m;
}

function buildIWClass() {
  const m = frame(grid(30, 20, '='));
  put(m, 'www', 23, 1);                 // окно, где стоит девочка
  put(m, 'OOO', 3, 2);                  // доска
  put(m, ['T', 'T', 'T'], 6, 8);
  put(m, ['T', 'T', 'T'], 6, 9);
  put(m, ['T', 'T', 'T'], 13, 8);
  put(m, ['T', 'T', 'T'], 13, 9);
  put(m, 'C', 5, 10); put(m, 'C', 12, 10);
  put(m, 'LL', 1, 14); put(m, 'LL', 1, 15);
  put(m, 'x', 26, 13);                  // шкаф (угол девочки во 2-м акте)
  put(m, 'd', 15, 19);                  // дверь наружу (к «Проснуться»)
  return m;
}

function buildIWCorridor(len = 96) {
  const m = frame(grid(len, 20, '~'));
  for (let x = 0; x < len; x++) { put(m, 'P', x, 1); put(m, 'P', x, 18); }
  put(m, 'www', 6, 0); put(m, 'www', len - 10, 0);
  return m;
}

function buildVillage() {
  const m = grid(30, 20, 'G');
  for (let y = 3; y < 20; y++) for (let x = 0; x < 30; x++) {
    const arr = m[y].split('');
    arr[x] = 'G';
    m[y] = arr.join('');
  }
  for (let x = 0; x < 30; x++) { put(m, 's', x, 0); put(m, 's', x, 1); }   // серая гора сверху
  for (let x = 0; x < 30; x++) { put(m, '^', x, 2); }                       // горный хребет
  put(m, 'www', 25, 4);              // окно но «неба нет»
  put(m, '#', 5, 6); put(m, '#', 6, 6); put(m, '#', 7, 6);
  put(m, '#', 5, 7); put(m, 'd', 6, 7); put(m, '#', 7, 7);   // дом деда
  put(m, '#', 4, 8); put(m, '#', 5, 8); put(m, '#', 6, 8); put(m, '#', 7, 8);
  put(m, 'S', 20, 6); put(m, 'S', 21, 6);    // печка
  put(m, 'o', 3, 4); put(m, 'o', 26, 15);    // деревья
  put(m, 'd', 15, 19);                       // вернуться
  return m;
}

function buildIWRoom() {
  const m = frame(grid(30, 20, ','));
  put(m, 'OOO', 13, 1);      // одна лампа сверху
  put(m, 'C', 16, 9);        // стул с мальчиком
  put(m, 'd', 15, 19);       // выход
  return m;
}

// ---- Тематики цветов ----
export const THEMES = {
  home:     { floor: '#c9b18b', floor2: '#c0a87f', floor3: '#b89f74', wall: '#6b5635', dark: '#4f3e24', window: '#9fd0e6', door: '#5a3c20', cloth: '#d9b9a0', wood: '#a8875a', rug: '#9d5c5c' },
  kitchen:  { floor: '#cabf99', floor2: '#c2b68e', floor3: '#bab080', wall: '#7a6a4a', dark: '#5a4c33', window: '#b7e0f0', door: '#64451f', cloth: '#d9c7a8', wood: '#9a8a6a', stove: '#3b3b3b', fridge: '#dfe7e4' },
  school:   { floor: '#d3ccab', floor2: '#cbc495', floor3: '#c3bc8f', wall: '#9aa5b2', dark: '#7c8794', window: '#cfe6f2', door: '#6d7a86', cloth: '#9d8a6a', wood: '#8a6d44', locker: '#7f9a8a', board: '#2f4f3f' },
  inner:    { floor: '#d8c87e', floor2: '#cfbe70', floor3: '#c6b562', wall: '#b09a4e', dark: '#8a7838', window: '#e8e2bd', door: '#7a6330', cloth: '#8a7a50', wood: '#7d6836', locker: '#99854a', board: '#3a322a' },
  corridor: { floor: '#9a8a5c', floor2: '#8e7e50', floor3: '#847448', wall: '#7a6a4a', dark: '#5a4c33', window: '#e8e2bd', door: '#5a3c20', cloth: '#9d8a6a', wood: '#7a6a4a', photo: '#d9c9a0' },
  village:  { floor: '#7d6a4a', floor2: '#746143', floor3: '#6b5635', wall: '#5b4123', dark: '#3f2d16', window: '#a9a9a9', door: '#4a3418', cloth: '#8a7a50', wood: '#5b4123', stove: '#6d655e', ground: '#6b5635', mountain: '#777a80', sky: '#9ba0a8' },
  room4:    { floor: '#3f3f46', floor2: '#3a3a40', floor3: '#35353b', wall: '#2d2d33', dark: '#222226', window: '#565660', door: '#1f1f24', cloth: '#4a4a52', wood: '#5d5440' },
  street:   { floor: '#cfc9bd', floor2: '#c2bdb0', floor3: '#b8b2a4', wall: '#7a6248', dark: '#57442f', window: '#a8c8d8', door: '#6b5130', cloth: '#8a7a50', wood: '#6b5130', snow: '#e6e2d8', road: '#8b8577', tree: '#4a5a3a' },
  bus:      { floor: '#6d6d6d', floor2: '#646464', floor3: '#5b5b5b', wall: '#5e5e5e', dark: '#3f3f3f', window: '#cfe6f2', door: '#4b4b4b', cloth: '#8a4a4a', wood: '#555' },
};

// Какие символы тайлов считаются твёрдыми по умолчанию.
// По ТЗ коллизии только со стенами: мебель, парты, NPC — не препятствия.
export const SOLID_DEFAULT = new Set(['#', 'W', 'w', 'o', '^', 's', 'P']);

// Соответствие символа тайла цветовой роли темы
function tileColor(ch, th) {
  switch (ch) {
    case '.': return th.floor;
    case ',': return th.floor2;
    case '=': return th.floor3 || th.floor;
    case '~': return th.floor2;
    case ':': return th.floor;
    case '#': return th.wall;
    case 'W':
    case 'w': return th.window;
    case 'd': return th.door;
    case 'B': return th.cloth;
    case 'T': return th.wood;
    case 'C': return th.wood;
    case 'S': return th.stove || th.dark;
    case 'F': return th.fridge || th.floor2;
    case 'L': return th.locker || th.floor2;
    case 'O': return th.board || th.dark;
    case 'P': return th.photo || th.wall;
    case 'G': return th.ground || th.floor;
    case 'r': return th.road || th.floor2;
    case 'o': return th.tree || th.floor;
    case '^': return th.mountain || th.floor;
    case 'x': return th.dark;
    case 's': return th.sky || th.floor;
    case 'Q': return th.snow || th.floor;
    case 'R': return th.rug || th.cloth;
    default: return th.floor;
  }
}

// Твёрдые ли тайл на пиксельных координатах
export function isSolid(room, x, y) {
  const tx = Math.floor(x / TILE_SIZE);
  const ty = Math.floor(y / TILE_SIZE);
  if (tx < 0 || ty < 0 || tx >= room.w || ty >= room.h) return true;
  const ch = room.map[ty][tx];
  if (ch === undefined || ch === ' ') return true;
  return room.solid.has(ch);
}

export function tileAt(room, x, y) {
  const tx = Math.floor(x / TILE_SIZE);
  const ty = Math.floor(y / TILE_SIZE);
  if (tx < 0 || ty < 0 || tx >= room.w || ty >= room.h) return ' ';
  return room.map[ty][tx];
}

// ---- Описание комнат ----
export const ROOMS = {
  room_kori: {
    id: 'room_kori', name: 'Комната', theme: 'home',
    w: 8, h: 6, map: buildKoriRoom(),
    solid: new Set([...SOLID_DEFAULT]),
    spawn: { x: 3 * 32, y: 4 * 32 },
    auto: 'wake_room',
    objects: [
      { tx: 1, ty: 0, label: 'Окно', diag: 'obj_window_kori' },
      { tx: 3, ty: 0, label: 'Трещина на потолке', diag: 'obj_ceiling' },
      { tx: 2, ty: 4, label: 'Рюкзак', diag: 'obj_backpack' },
    ],
  },
  house_corridor: {
    id: 'house_corridor', name: 'Коридор', theme: 'corridor',
    w: 30, h: 20, map: buildHouseCorridor(),
    solid: new Set([...SOLID_DEFAULT]),
    spawn: { x: 15 * 32, y: 10 * 32 },
    objects: [
      { tx: 2, ty: 2, label: 'Обои', diag: 'obj_wallpaper' },
      { tx: 14, ty: 2, label: 'Дверь родителей', diag: 'obj_parents_door' },
      { tx: 4, ty: 2, label: 'Велосипед', diag: 'obj_bike' },
      { tx: 24, ty: 2, label: 'Зеркало', diag: 'obj_kori_mirror' },
    ],
  },
  kitchen_morning: {
    id: 'kitchen_morning', name: 'Кухня', theme: 'kitchen',
    w: 30, h: 20, map: buildKitchen(),
    solid: new Set([...SOLID_DEFAULT]),
    spawn: { x: 16 * 32, y: 12 * 32 },
    auto: 'kitchen_morning',
    objects: [
      { tx: 16, ty: 8, label: 'Банка с насваем', diag: 'obj_nasvay_jar' },
      { tx: 13, ty: 8, label: 'Тарелка с яйцами', diag: 'obj_eggs' },
      { tx: 2, ty: 3, label: 'Холодильник', diag: 'obj_fridge' },
      { tx: 23, ty: 2, label: 'Календарь', diag: 'obj_calendar' },
      { tx: 3, ty: 7, label: 'Бутылка', diag: 'obj_drunk' },
    ],
    npcs: [
      { tx: 5, ty: 5, charId: 'mother', label: 'Мать' },
      { tx: 16, ty: 6, charId: 'father', label: 'Отец' },
      { tx: 9, ty: 11, charId: 'sister', label: 'Сестра' },
    ],
    trans: { '0,14': { room: 'house_corridor', effects: [] } },
  },
  street: {
    id: 'street', name: 'Улица', theme: 'street',
    w: 30, h: 20, map: buildStreet(),
    solid: new Set(new Set([...SOLID_DEFAULT]).add('Q')),
    spawn: { x: 5 * 32, y: 10 * 32 },
    auto: 'street',
    objects: [
      { tx: 3, ty: 16, label: 'Мусорные баки', diag: 'obj_bins' },
      { tx: 26, ty: 3, label: 'Надпись на стене', diag: 'obj_graffiti' },
      { tx: 8, ty: 16, label: 'Собака', diag: 'obj_dog' },
      { tx: 14, ty: 5, label: 'Афиша', diag: 'obj_poster' },
      { tx: 28, ty: 10, label: 'Окно школы', diag: 'obj_school_window' },
    ],
    npcs: [],
    transExits: [{ tx: 28, ty: 10, room: 'school_hall_real', label: 'Войти в школу', effects: [] }],
  },
  school_hall_real: {
    id: 'school_hall_real', name: 'Коридор', theme: 'school',
    w: 30, h: 20, map: buildSchoolHall(),
    solid: new Set([...SOLID_DEFAULT]),
    spawn: { x: 14 * 32, y: 17 * 32 },
    auto: 'school_corridor',
    objects: [
      { tx: 2, ty: 4, label: 'Димка', diag: 'obj_dimka' },
      { tx: 2, ty: 10, label: 'Данил', diag: 'obj_danil' },
      { tx: 27, ty: 4, label: 'Столовая', diag: 'obj_canteen' },
      { tx: 27, ty: 10, label: 'Туалет', diag: 'obj_toilet' },
    ],
    transExits: [{ tx: 15, ty: 18, room: 'school_class_real', label: 'В класс', effects: [] }],
  },
  school_class_real: {
    id: 'school_class_real', name: 'Класс', theme: 'school',
    w: 30, h: 20, map: buildClass(),
    solid: new Set([...SOLID_DEFAULT]),
    spawn: { x: 8 * 32, y: 13 * 32 },
    auto: 'class_lesson',
    objects: [
      { tx: 2, ty: 2, label: 'Учительница', diag: 'obj_teacher' },
      { tx: 26, ty: 2, label: 'Плакат', diag: 'obj_poster' },
      { tx: 14, ty: 0, label: 'Окно', diag: 'obj_school_window' },
    ],
    transExits: [{ tx: 15, ty: 18, room: 'school_hall_break', label: 'Перемена', effects: [] }],
  },
  school_hall_break: {
    id: 'school_hall_break', name: 'Коридор', theme: 'school',
    w: 30, h: 20, map: buildSchoolHall(),
    solid: new Set([...SOLID_DEFAULT]),
    spawn: { x: 10 * 32, y: 10 * 32 },
    auto: 'break_girl',
    objects: [],
    npcs: [{ tx: 24, ty: 8, charId: 'girl_backpack', label: 'Новенькая' }],
    transExits: [{ tx: 29, ty: 10, room: 'bus_home', label: 'На автобус', effects: [] }],
  },
  bus_home: {
    id: 'bus_home', name: 'Автобус', theme: 'bus',
    w: 30, h: 20, map: buildBus(),
    solid: new Set([...SOLID_DEFAULT]),
    spawn: { x: 8 * 32, y: 10 * 32 },
    auto: 'bus_home',
    objects: [
      { tx: 2, ty: 3, label: 'Женщина с сумкой', diag: 'obj_woman_bus' },
      { tx: 24, ty: 3, label: 'Спящий мальчик', diag: 'obj_sleep_bus' },
      { tx: 2, ty: 12, label: 'Парень в наушниках', diag: 'obj_teen_bus' },
    ],
    transExits: [{ tx: 28, ty: 10, room: 'room_sister_evening', label: 'Выйти', effects: [] }],
  },
  room_sister_evening: {
    id: 'room_sister_evening', name: 'Комната сестры', theme: 'home',
    w: 30, h: 20, map: buildSisterRoom(),
    solid: new Set([...SOLID_DEFAULT]),
    spawn: { x: 8 * 32, y: 14 * 32 },
    auto: 'sister_room',
    objects: [
      { tx: 15, ty: 13, label: 'Рисунок', diag: 'obj_sister_notebook' },
      { tx: 5, ty: 13, label: 'Кроссовки', diag: 'obj_sister_shoes' },
      { tx: 15, ty: 12, label: 'Фотография', diag: 'obj_sister_photo' },
    ],
    npcs: [{ tx: 14, ty: 14, charId: 'sister', label: 'Сестра' }],
    transExits: [{ tx: 29, ty: 14, room: 'kitchen_evening', label: 'На кухню', effects: [] }],
  },
  kitchen_evening: {
    id: 'kitchen_evening', name: 'Кухня', theme: 'kitchen',
    w: 30, h: 20, map: buildKitchen(),
    solid: new Set([...SOLID_DEFAULT]),
    spawn: { x: 16 * 32, y: 12 * 32 },
    auto: 'kitchen_evening',
    npcs: [
      { tx: 5, ty: 5, charId: 'mother', label: 'Мать' },
      { tx: 16, ty: 6, charId: 'father', label: 'Отец' },
    ],
  },
  room_kori_night: {
    id: 'room_kori_night', name: 'Комната', theme: 'home',
    w: 8, h: 6, map: buildKoriRoom(),
    solid: new Set([...SOLID_DEFAULT]),
    spawn: { x: 3 * 32, y: 3 * 32, face: 'left' },
    night: true,
    objects: [
      { tx: 1, ty: 0, label: 'Окно', diag: 'obj_kori_window' },
    ],
  },
  iw_hall: {
    id: 'iw_hall', name: 'Коридор', theme: 'inner',
    w: 30, h: 20, map: buildSchoolHall(),
    solid: new Set([...SOLID_DEFAULT]),
    spawn: { x: 14 * 32, y: 12 * 32 },
    auto: 'iw_enter',
    objects: [{ tx: 15, ty: 12, label: 'Тишина', diag: 'iw_hall_note' }],
    transExits: [{ tx: 29, ty: 10, room: 'iw_class', label: 'Класс', effects: [] }],
  },
  iw_class: {
    id: 'iw_class', name: 'Класс', theme: 'inner',
    w: 30, h: 20, map: buildIWClass(),
    solid: new Set(new Set([...SOLID_DEFAULT])),
    spawn: { x: 9 * 32, y: 14 * 32 },
    objects: [
      { tx: 14, ty: 9, label: 'Под потолком', diag: 'iw_lamps_dyn', dynamicDiag: true },
      { tx: 24, ty: 1, label: 'Окно', diag: 'iw_window_dyn', dynamicDiag: true },
      { tx: 6, ty: 8, label: 'Парта', diag: 'obj_iw_class1' },
      { tx: 13, ty: 8, label: 'Парта у окна', diag: 'obj_iw_class2' },
      { tx: 26, ty: 13, label: 'Шкаф', diag: 'obj_iw_class3' },
      { tx: 2, ty: 14, label: 'Столовая', diag: 'obj_iw_canteen' },
      { tx: 28, ty: 14, label: 'Спортзал', diag: 'obj_iw_gym' },
    ],
    // Четыре лампы под потолком (позиции для отрисовки)
    lamps: [{ tx: 7, ty: 1 }, { tx: 12, ty: 1 }, { tx: 17, ty: 1 }, { tx: 22, ty: 1 }],
  },
  kitchen_morning2: {
    id: 'kitchen_morning2', name: 'Кухня', theme: 'kitchen',
    w: 30, h: 20, map: buildKitchen(),
    solid: new Set([...SOLID_DEFAULT]),
    spawn: { x: 16 * 32, y: 12 * 32 },
    auto: 'morning2',
    npcs: [{ tx: 5, ty: 5, charId: 'mother', label: 'Мать' }],
    transExits: [{ tx: 29, ty: 14, room: 'school_class_real2', label: 'В школу', effects: [] }],
  },
  school_class_real2: {
    id: 'school_class_real2', name: 'Класс', theme: 'school',
    w: 30, h: 20, map: buildClass(),
    solid: new Set([...SOLID_DEFAULT]),
    spawn: { x: 7 * 32, y: 9 * 32 },
    auto: 'school2',
    npcs: [{ tx: 8, ty: 6, charId: 'girl_backpack', label: 'Новенькая' }],
    transExits: [{ tx: 15, ty: 18, room: 'kitchen_evening2', label: 'Домой', effects: [] }],
  },
  kitchen_evening2: {
    id: 'kitchen_evening2', name: 'Кухня', theme: 'kitchen',
    w: 30, h: 20, map: buildKitchen(),
    solid: new Set([...SOLID_DEFAULT]),
    spawn: { x: 16 * 32, y: 12 * 32 },
    auto: 'evening2',
    npcs: [
      { tx: 5, ty: 5, charId: 'mother', label: 'Мать' },
      { tx: 12, ty: 12, charId: 'sister', label: 'Сестра' },
    ],
  },
  kitchen_morning3: {
    id: 'kitchen_morning3', name: 'Кухня', theme: 'kitchen',
    w: 30, h: 20, map: buildKitchen(),
    solid: new Set([...SOLID_DEFAULT]),
    spawn: { x: 16 * 32, y: 12 * 32 },
    auto: 'ask_mother',
    objects: [{ tx: 10, ty: 12, label: 'Сестра и мать', diag: 'defend_sister5' }],
    npcs: [
      { tx: 5, ty: 5, charId: 'mother', label: 'Мать' },
      { tx: 9, ty: 11, charId: 'sister', label: 'Сестра' },
    ],
    transExits: [{ tx: 29, ty: 14, room: 'school_hall_real2', label: 'В школу', effects: [] }],
  },
  school_hall_real2: {
    id: 'school_hall_real2', name: 'Коридор', theme: 'school',
    w: 30, h: 20, map: buildSchoolHall(),
    solid: new Set([...SOLID_DEFAULT]),
    spawn: { x: 14 * 32, y: 10 * 32 },
    auto: 'school_breakdown',
    objects: [
      { tx: 2, ty: 4, label: 'Димка', diag: 'obj_dimka' },
      { tx: 2, ty: 10, label: 'Данил', diag: 'obj_danil' },
      { tx: 27, ty: 4, label: 'Столовая', diag: 'obj_canteen' },
      { tx: 27, ty: 10, label: 'Туалет', diag: 'obj_toilet' },
    ],
    transExits: [{ tx: 29, ty: 10, room: 'kitchen_evening3', label: 'Домой', effects: [] }],
  },
  kitchen_evening3: {
    id: 'kitchen_evening3', name: 'Кухня', theme: 'kitchen',
    w: 30, h: 20, map: buildKitchen(),
    solid: new Set([...SOLID_DEFAULT]),
    spawn: { x: 16 * 32, y: 12 * 32 },
    auto: 'evening3',
    npcs: [
      { tx: 5, ty: 5, charId: 'mother', label: 'Мать' },
      { tx: 16, ty: 6, charId: 'father', label: 'Отец' },
    ],
  },
  iw_corridor: {
    id: 'iw_corridor', name: 'Коридор без конца', theme: 'corridor',
    w: 96, h: 20, map: buildIWCorridor(96),
    solid: new Set([...SOLID_DEFAULT]),
    spawn: { x: 8 * 32, y: 10 * 32 },
    auto: 'iw_corridor2',
    objects: [
      { tx: 12, ty: 3, label: 'Фото: дед', diag: 'photo_ded' },
      { tx: 26, ty: 3, label: 'Фото: мать', diag: 'photo_mother' },
      { tx: 40, ty: 3, label: 'Фото: отец', diag: 'photo_father' },
      { tx: 54, ty: 3, label: 'Фото: сестра', diag: 'photo_sister' },
      { tx: 68, ty: 3, label: 'Фото: Кори', diag: 'photo_kori' },
    ],
    transExits: [{ tx: 95, ty: 10, room: 'kitchen_morning3', label: 'Проснуться', effects: [] }],
  },
  iw_village: {
    id: 'iw_village', name: 'Село, которого нет', theme: 'village',
    w: 30, h: 20, map: buildVillage(),
    solid: new Set([...SOLID_DEFAULT]),
    spawn: { x: 8 * 32, y: 12 * 32 },
    auto: 'iw_village',
    objects: [
      { tx: 5, ty: 9, label: 'Дом деда', diag: 'village_house' },
      { tx: 21, ty: 8, label: 'Печка', diag: 'village_stove' },
      { tx: 15, ty: 2, label: 'Горы', diag: 'village_mountains' },
    ],
    npcs: [
      { tx: 20, ty: 12, charId: 'faceless', label: 'Человек без лица' },
      { tx: 26, ty: 10, charId: 'faceless', label: 'Человек без лица' },
    ],
    transExits: [{ tx: 15, ty: 18, room: 'room_kori4', label: 'Проснуться', effects: [] }],
  },
  room_kori4: {
    id: 'room_kori4', name: 'Комната', theme: 'home',
    w: 8, h: 6, map: buildKoriRoom(),
    solid: new Set([...SOLID_DEFAULT]),
    spawn: { x: 3 * 32, y: 4 * 32 },
    auto: 'sister_runs',
    objects: [{ tx: 4, ty: 2, label: 'Браслет', diag: 'bracelet_anchor7' }],
    npcs: [{ tx: 5, ty: 4, charId: 'sister', label: 'Сестра' }],
    transExits: [{ tx: 6, ty: 3, room: 'kitchen_evening4', label: 'В коридор', effects: [] }],
  },
  kitchen_evening4: {
    id: 'kitchen_evening4', name: 'Кухня', theme: 'kitchen',
    w: 30, h: 20, map: buildKitchen(),
    solid: new Set([...SOLID_DEFAULT]),
    spawn: { x: 16 * 32, y: 12 * 32 },
    auto: 'evening4',
    npcs: [
      { tx: 5, ty: 5, charId: 'mother', label: 'Мать' },
      { tx: 16, ty: 6, charId: 'father', label: 'Отец' },
    ],
  },
  iw_room: {
    id: 'iw_room', name: 'Комната', theme: 'room4',
    w: 30, h: 20, map: buildIWRoom(),
    solid: new Set([...SOLID_DEFAULT]),
    spawn: { x: 8 * 32, y: 14 * 32 },
    auto: 'iw_room4',
    objects: [{ tx: 16, ty: 8, label: 'Кори в 7 лет', diag: 'child_approach' }],
    npcs: [{ tx: 16, ty: 9, charId: 'boy', label: 'Мальчик' }],
    transExits: [{ tx: 15, ty: 18, room: 'iw_class', label: 'В класс', effects: [] }],
  },
};

// Тайл двери 'd' может вести в другую комнату.
// Единый источник переходов: room.trans = { "tx,ty": { room, effects? } }.
// Переход срабатывает, когда игрок встаёт на этот тайл.
export function resolveTransition(room, tx, ty) {
  if (!room.trans) return null;
  return room.trans[`${tx},${ty}`] || null;
}

// Добавить дверные тайлы на карты комнат (иконки выходов).
function patchDoors() {
  const R = ROOMS;
  const putD = (rid, tx, ty, roomId) => {
    const m = R[rid].map;
    put(m, 'd', tx, ty);
    R[rid].trans = R[rid].trans || {};
    R[rid].trans[`${tx},${ty}`] = { room: roomId, effects: [] };
  };
  // Комната Кори -> коридор -> кухня
  R.room_kori.trans = R.room_kori.trans || {};
  R.room_kori.trans['6,3'] = { room: 'house_corridor', effects: [] };
  R.house_corridor.trans = R.house_corridor.trans || {};
  R.house_corridor.trans['0,10'] = { room: 'room_kori', effects: [] };
  R.house_corridor.trans['29,10'] = { room: 'kitchen_morning', effects: [] };
  // Кухня акт1: назад в коридор и на улицу
  R.kitchen_morning.trans = R.kitchen_morning.trans || {};
  R.kitchen_morning.trans['0,14'] = { room: 'house_corridor', effects: [] };
  R.kitchen_morning.trans['29,14'] = { room: 'street', effects: [] };
  // Улица -> школа
  R.street.trans = { '29,10': { room: 'school_hall_real', effects: [] } };
  // Школа: коридор -> класс -> перемена
  R.school_hall_real.trans = { '15,19': { room: 'school_class_real', effects: [] } };
  R.school_class_real.trans = { '15,19': { room: 'school_hall_break', effects: [] } };
  putD('school_hall_break', 29, 10, 'bus_home');
  R.bus_home.trans = { '29,10': { room: 'room_sister_evening', effects: [] } };
  // Вечер сестры -> вечерняя кухня (первый побой)
  putD('room_sister_evening', 29, 14, 'kitchen_evening');
  // Акт 2: утро -> школа; школа -> вечер
  R.kitchen_morning2.trans = { '29,14': { room: 'school_class_real2', effects: [] } };
  R.school_class_real2.trans = { '15,19': { room: 'kitchen_evening2', effects: [] } };
  // Акт 3
  R.kitchen_morning3.trans = { '29,14': { room: 'school_hall_real2', effects: [] } };
  putD('school_hall_real2', 29, 10, 'kitchen_evening3');
  // Акт 4
  putD('room_kori4', 6, 3, 'kitchen_evening4');
  // Внутренний мир
  putD('iw_hall', 29, 10, 'iw_class');
  R.iw_village.trans = { '15,19': { room: 'room_kori4', effects: [] } };
  putD('iw_corridor', 95, 10, 'kitchen_morning3');
  R.iw_room.trans = { '15,19': { room: 'iw_class', effects: [] } };
}

patchDoors();

// ---- Отрисовка комнаты ----
// Детерминированный шум: одинаковый узор на одних и тех же тайлах.
function tileNoise(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function isFloorChar(ch) {
  return ch === '.' || ch === ',' || ch === '=' || ch === '~' || ch === ':' ||
         ch === 'G' || ch === 'r' || ch === 'Q';
}

// Стена: обои с узором, плинтус, тень к полу.
function drawWallTile(ctx, sx, sy, tx, ty, th) {
  // узор обоев: ромбики / цветочки / полоски — по позиции тайла
  const pat = (tx + ty) % 3;
  if (pat === 0) {
    // ромбики
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    for (let i = 0; i < 2; i++) {
      const px = sx + 8 + i * 16, py = sy + 8 + i * 16;
      ctx.beginPath();
      ctx.moveTo(px, py - 4); ctx.lineTo(px + 4, py);
      ctx.lineTo(px, py + 4); ctx.lineTo(px - 4, py);
      ctx.closePath();
      ctx.fill();
    }
  } else if (pat === 1) {
    // цветочки
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.arc(sx + 10, sy + 10, 2.5, 0, Math.PI * 2);
    ctx.arc(sx + 22, sy + 22, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.beginPath();
    ctx.arc(sx + 10, sy + 10, 1, 0, Math.PI * 2);
    ctx.arc(sx + 22, sy + 22, 1, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // полоски
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(sx + 6, sy, 2, TILE_SIZE);
    ctx.fillRect(sx + 20, sy, 2, TILE_SIZE);
  }
  // царапины и грязь на обоях
  if (tileNoise(tx * 7 + ty * 13) > 0.65) {
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx + 4 + tileNoise(tx * 3 + 1) * 20, sy + 4 + tileNoise(ty * 5 + 2) * 20);
    ctx.lineTo(sx + 8 + tileNoise(tx * 3 + 3) * 20, sy + 8 + tileNoise(ty * 5 + 4) * 20);
    ctx.stroke();
  }
  // плинтус
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(sx, sy + TILE_SIZE - 5, TILE_SIZE, 5);
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  ctx.fillRect(sx, sy + TILE_SIZE - 5, TILE_SIZE, 1);
}

// Пол: линолеум с рисунком, пятна, грязь, царапины.
function drawFloorTile(ctx, sx, sy, tx, ty, th, ch) {
  // линолеум: лёгкая сетка
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  ctx.fillRect(sx, sy, TILE_SIZE, 1);
  ctx.fillRect(sx, sy, 1, TILE_SIZE);
  // кафельная/линолеумная линия
  if (ch === '=') {
    ctx.fillStyle = 'rgba(60,50,30,0.14)';
    ctx.fillRect(sx, sy + TILE_SIZE - 2, TILE_SIZE, 2);
  }
  // пятна и грязь
  const n = tx * 31 + ty * 57;
  if (tileNoise(n) > 0.5) {
    ctx.fillStyle = `rgba(0,0,0,${0.04 + tileNoise(n + 1) * 0.09})`;
    ctx.beginPath();
    ctx.ellipse(sx + 6 + tileNoise(n + 2) * 20, sy + 6 + tileNoise(n + 3) * 20,
      3 + tileNoise(n + 4) * 4, 2 + tileNoise(n + 5) * 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // царапины
  if (tileNoise(n + 6) > 0.78) {
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx + tileNoise(n + 7) * 28, sy + tileNoise(n + 8) * 28);
    ctx.lineTo(sx + tileNoise(n + 9) * 28, sy + tileNoise(n + 10) * 28);
    ctx.stroke();
  }
}

export function drawRoom(ctx, room, camX, camY) {
  const th = THEMES[room.theme] || THEMES.home;
  const x0 = Math.floor(camX / TILE_SIZE);
  const y0 = Math.floor(camY / TILE_SIZE);
  const x1 = Math.min(room.w - 1, Math.ceil((camX + VIEW_W) / TILE_SIZE));
  const y1 = Math.min(room.h - 1, Math.ceil((camY + VIEW_H) / TILE_SIZE));

  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      const ch = room.map[ty][tx];
      if (ch === undefined || ch === ' ') continue;
      const sx = tx * TILE_SIZE - camX;
      const sy = ty * TILE_SIZE - camY;
      const color = tileColor(ch, th);
      ctx.fillStyle = color;
      ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);

      if (ch === '#') {
        drawWallTile(ctx, sx, sy, tx, ty, th);
      } else if (isFloorChar(ch)) {
        drawFloorTile(ctx, sx, sy, tx, ty, th, ch);
      }
    }
  }

  // тень от стен к полу: градиент на верхней кромке пола под стеной
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      const ch = room.map[ty][tx];
      if (ch === undefined || ch === ' ') continue;
      if (!isFloorChar(ch)) continue;
      const above = ty > 0 ? room.map[ty - 1][tx] : null;
      if (above === '#' || above === 'W' || above === 'w') {
        const sx = tx * TILE_SIZE - camX;
        const sy = ty * TILE_SIZE - camY;
        const grd = ctx.createLinearGradient(0, sy, 0, sy + 12);
        grd.addColorStop(0, 'rgba(0,0,0,0.25)');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(sx, sy, TILE_SIZE, 12);
      }
    }
  }

  // приглушение для ночных сцен
  if (room.night) {
    ctx.fillStyle = 'rgba(10,12,30,0.5)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
}