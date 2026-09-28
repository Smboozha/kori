// decor.js — декор комнат: детали мебели поверх тайлов + дополнительные объекты.
// drawDecor(ctx, room, camX, camY) вызывается после отрисовки тайлов, до персонажей.
//
// Декор не является препятствием: коллизии только со стенами (см. scenes.js).

import { TILE_SIZE, VIEW_W, VIEW_H } from './engine.js';

// ---- Детали мебели по символам тайлов ----
function drawFurnitureDetails(ctx, room, camX, camY) {
  const x0 = Math.floor(camX / TILE_SIZE);
  const y0 = Math.floor(camY / TILE_SIZE);
  const x1 = Math.min(room.w - 1, Math.ceil((camX + VIEW_W) / TILE_SIZE));
  const y1 = Math.min(room.h - 1, Math.ceil((camY + VIEW_H) / TILE_SIZE));

  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      const ch = room.map[ty][tx];
      if (ch === undefined) continue;
      const sx = tx * TILE_SIZE - camX;
      const sy = ty * TILE_SIZE - camY;
      switch (ch) {
        case 'B': drawBed(ctx, sx, sy); break;
        case 'T': drawTable(ctx, sx, sy); break;
        case 'C': drawChair(ctx, sx, sy); break;
        case 'S': drawStove(ctx, sx, sy); break;
        case 'F': drawFridge(ctx, sx, sy); break;
        case 'L': drawLocker(ctx, sx, sy); break;
        case 'O': drawBoard(ctx, sx, sy); break;
        case 'x': drawCounter(ctx, sx, sy); break;
        case 'w': drawWindow(ctx, sx, sy); break;
        case 'W': drawWindow(ctx, sx, sy); break;
        case 'd': drawDoor(ctx, sx, sy); break;
        case 'o': drawTree(ctx, sx, sy); break;
        case 'G': drawGround(ctx, sx, sy); break;
        case 'Q': drawSnow(ctx, sx, sy); break;
        case 'P': drawPhoto(ctx, sx, sy); break;
        case 'R': drawRug(ctx, sx, sy); break;
      }
    }
  }
}

function drawBed(ctx, sx, sy) {
  // подушка сверху, одеяло снизу
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(sx + 4, sy + 3, TILE_SIZE - 8, 7);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(sx + 4, sy + 12, TILE_SIZE - 8, 2);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(sx + 4, sy + 15, TILE_SIZE - 8, TILE_SIZE - 19);
}

function drawTable(ctx, sx, sy) {
  // столешница с бликом и ножки
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.fillRect(sx + 2, sy + 2, TILE_SIZE - 4, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fillRect(sx + 3, sy + TILE_SIZE - 4, 3, 4);
  ctx.fillRect(sx + TILE_SIZE - 6, sy + TILE_SIZE - 4, 3, 4);
}

function drawChair(ctx, sx, sy) {
  // спинка и сиденье
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(sx + 5, sy + 3, TILE_SIZE - 10, 4);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(sx + 5, sy + 9, TILE_SIZE - 10, 3);
}

function drawStove(ctx, sx, sy) {
  // конфорки
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.arc(sx + 10, sy + 10, 4, 0, Math.PI * 2);
  ctx.arc(sx + 22, sy + 10, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(sx + 2, sy + 2, TILE_SIZE - 4, 2);
}

function drawFridge(ctx, sx, sy) {
  // ручка и разделитель
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(sx + TILE_SIZE - 7, sy + 8, 3, 8);
  ctx.fillRect(sx + TILE_SIZE - 7, sy + 22, 3, 6);
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(sx + 2, sy + 2, TILE_SIZE - 4, 2);
}

function drawLocker(ctx, sx, sy) {
  // дверцы шкафчика
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(sx + TILE_SIZE / 2 - 1, sy + 2, 2, TILE_SIZE - 4);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(sx + 2, sy + 2, TILE_SIZE - 4, 2);
}

function drawBoard(ctx, sx, sy) {
  // рамка доски
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 2;
  ctx.strokeRect(sx + 2, sy + 2, TILE_SIZE - 4, TILE_SIZE - 4);
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(sx + 4, sy + 4, TILE_SIZE - 8, TILE_SIZE - 8);
}

function drawCounter(ctx, sx, sy) {
  // столешница с фаской
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(sx + 1, sy + 1, TILE_SIZE - 2, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(sx + 1, sy + TILE_SIZE - 3, TILE_SIZE - 2, 2);
}

function drawWindow(ctx, sx, sy) {
  // рама окна
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(sx + 2, sy + 2, TILE_SIZE - 4, TILE_SIZE - 4);
  ctx.beginPath();
  ctx.moveTo(sx + TILE_SIZE / 2, sy + 2);
  ctx.lineTo(sx + TILE_SIZE / 2, sy + TILE_SIZE - 2);
  ctx.moveTo(sx + 2, sy + TILE_SIZE / 2);
  ctx.lineTo(sx + TILE_SIZE - 2, sy + TILE_SIZE / 2);
  ctx.stroke();
  // блик
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(sx + 5, sy + 5, 6, 6);
}

function drawDoor(ctx, sx, sy) {
  // дверное полотно с ручкой
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(sx + 3, sy + 3, TILE_SIZE - 6, TILE_SIZE - 6);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.arc(sx + TILE_SIZE - 8, sy + TILE_SIZE / 2, 1.6, 0, Math.PI * 2);
  ctx.fill();
}

function drawTree(ctx, sx, sy) {
  // крона и тень
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(sx + 16, sy + 20, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath();
  ctx.arc(sx + 16, sy + 12, 9, 0, Math.PI * 2);
  ctx.fill();
}

function drawGround(ctx, sx, sy) {
  // трава/земля: лёгкие штрихи
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.fillRect(sx + 6, sy + 8, 2, 2);
  ctx.fillRect(sx + 20, sy + 18, 2, 2);
  ctx.fillRect(sx + 12, sy + 26, 2, 2);
}

function drawSnow(ctx, sx, sy) {
  // сугроб: светлый верх
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.ellipse(sx + 16, sy + 16, 14, 8, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawPhoto(ctx, sx, sy) {
  // рамка фотографии
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(sx + 4, sy + 4, TILE_SIZE - 8, TILE_SIZE - 8);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(sx + 6, sy + 6, TILE_SIZE - 12, TILE_SIZE - 12);
}

function drawRug(ctx, sx, sy) {
  // коврик с каймой
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(sx + 3, sy + 3, TILE_SIZE - 6, TILE_SIZE - 6);
}

// ---- Дополнительные объекты декора ----
const DECOR = {
  room_kori: [
    { tx: 2, ty: 2, kind: 'nightstand' },   // тумбочка с будильником
    { tx: 1, ty: 4, kind: 'slippers' },     // тапки у кровати
    { tx: 3, ty: 0, kind: 'crack' },        // трещина на потолке
    { tx: 2, ty: 4, kind: 'backpack' },     // рюкзак у кровати
  ],
  kitchen_morning: [
    { tx: 23, ty: 2, kind: 'calendar' },
    { tx: 16, ty: 8, kind: 'nasvay' },
    { tx: 13, ty: 8, kind: 'eggs' },
    { tx: 3, ty: 7, kind: 'kettle' },
  ],
  street: [
    { tx: 14, ty: 5, kind: 'busstop' },
    { tx: 8, ty: 3, kind: 'lamppost' },
    { tx: 20, ty: 3, kind: 'school' },
    { tx: 2, ty: 12, kind: 'car' },
    { tx: 26, ty: 12, kind: 'dog' },
    { tx: 10, ty: 16, kind: 'bins' },
  ],
  school_hall_real: [
    { tx: 14, ty: 0, kind: 'window' },
    { tx: 8, ty: 2, kind: 'notice' },
    { tx: 20, ty: 2, kind: 'radiator' },
    { tx: 26, ty: 2, kind: 'coatrack' },
    { tx: 5, ty: 8, kind: 'ceillamp' },
  ],
  school_class_real: [
    { tx: 14, ty: 0, kind: 'window' },
    { tx: 8, ty: 2, kind: 'poster' },
    { tx: 26, ty: 2, kind: 'globe' },
    { tx: 15, ty: 1, kind: 'flowers' },
    { tx: 2, ty: 1, kind: 'chalk' },
    { tx: 5, ty: 8, kind: 'ceillamp' },
  ],
  school_hall_break: [
    { tx: 14, ty: 0, kind: 'window' },
    { tx: 8, ty: 2, kind: 'notice' },
    { tx: 20, ty: 2, kind: 'radiator' },
    { tx: 26, ty: 2, kind: 'coatrack' },
    { tx: 5, ty: 8, kind: 'ceillamp' },
  ],
  bus_home: [
    { tx: 14, ty: 6, kind: 'handrail' },
    { tx: 15, ty: 6, kind: 'wheel' },
    { tx: 10, ty: 2, kind: 'ad' },
    { tx: 4, ty: 0, kind: 'frost' },
    { tx: 12, ty: 0, kind: 'frost' },
    { tx: 20, ty: 0, kind: 'frost' },
  ],
  room_sister_evening: [
    { tx: 14, ty: 0, kind: 'window' },
    { tx: 15, ty: 13, kind: 'drawing' },
    { tx: 8, ty: 2, kind: 'shelf' },
    { tx: 11, ty: 12, kind: 'crane' },
    { tx: 5, ty: 8, kind: 'ceillamp' },
  ],
  kitchen_evening: [
    { tx: 23, ty: 2, kind: 'calendar' },
    { tx: 16, ty: 8, kind: 'nasvay' },
    { tx: 13, ty: 8, kind: 'eggs' },
    { tx: 3, ty: 7, kind: 'kettle' },
  ],
  room_kori_night: [
    { tx: 2, ty: 2, kind: 'nightstand' },
    { tx: 1, ty: 4, kind: 'slippers' },
    { tx: 3, ty: 0, kind: 'crack' },
    { tx: 2, ty: 4, kind: 'backpack' },
  ],
  iw_hall: [
    { tx: 14, ty: 0, kind: 'window' },
    { tx: 5, ty: 8, kind: 'ceillamp' },
    { tx: 20, ty: 8, kind: 'ceillamp' },
  ],
  iw_class: [
    { tx: 23, ty: 1, kind: 'window' },
    { tx: 3, ty: 2, kind: 'board' },
    { tx: 26, ty: 13, kind: 'wardrobe' },
    { tx: 5, ty: 8, kind: 'ceillamp' },
    { tx: 15, ty: 8, kind: 'ceillamp' },
  ],
  kitchen_morning2: [
    { tx: 23, ty: 2, kind: 'calendar' },
    { tx: 16, ty: 8, kind: 'nasvay' },
    { tx: 13, ty: 8, kind: 'eggs' },
    { tx: 3, ty: 7, kind: 'kettle' },
  ],
  school_class_real2: [
    { tx: 14, ty: 0, kind: 'window' },
    { tx: 8, ty: 2, kind: 'poster' },
    { tx: 26, ty: 2, kind: 'globe' },
    { tx: 15, ty: 1, kind: 'flowers' },
    { tx: 2, ty: 1, kind: 'chalk' },
    { tx: 5, ty: 8, kind: 'ceillamp' },
  ],
  kitchen_evening2: [
    { tx: 23, ty: 2, kind: 'calendar' },
    { tx: 16, ty: 8, kind: 'nasvay' },
    { tx: 13, ty: 8, kind: 'eggs' },
    { tx: 3, ty: 7, kind: 'kettle' },
  ],
  kitchen_morning3: [
    { tx: 23, ty: 2, kind: 'calendar' },
    { tx: 16, ty: 8, kind: 'nasvay' },
    { tx: 13, ty: 8, kind: 'eggs' },
    { tx: 3, ty: 7, kind: 'kettle' },
  ],
  school_hall_real2: [
    { tx: 14, ty: 0, kind: 'window' },
    { tx: 8, ty: 2, kind: 'notice' },
    { tx: 20, ty: 2, kind: 'radiator' },
    { tx: 26, ty: 2, kind: 'coatrack' },
    { tx: 5, ty: 8, kind: 'ceillamp' },
  ],
  kitchen_evening3: [
    { tx: 23, ty: 2, kind: 'calendar' },
    { tx: 16, ty: 8, kind: 'nasvay' },
    { tx: 13, ty: 8, kind: 'eggs' },
    { tx: 3, ty: 7, kind: 'kettle' },
  ],
  iw_corridor: [
    { tx: 12, ty: 3, kind: 'photo' },
    { tx: 26, ty: 3, kind: 'photo' },
    { tx: 40, ty: 3, kind: 'photo' },
    { tx: 54, ty: 3, kind: 'photo' },
    { tx: 68, ty: 3, kind: 'photo' },
    { tx: 20, ty: 8, kind: 'ceillamp' },
    { tx: 50, ty: 8, kind: 'ceillamp' },
    { tx: 80, ty: 8, kind: 'ceillamp' },
  ],
  iw_village: [
    { tx: 21, ty: 8, kind: 'stove' },
    { tx: 15, ty: 2, kind: 'mountains' },
    { tx: 3, ty: 4, kind: 'tree' },
    { tx: 26, ty: 15, kind: 'tree' },
    { tx: 6, ty: 5, kind: 'smoke' },
    { tx: 20, ty: 10, kind: 'nasvay' },
  ],
  room_kori4: [
    { tx: 2, ty: 2, kind: 'nightstand' },
    { tx: 1, ty: 4, kind: 'slippers' },
    { tx: 3, ty: 0, kind: 'crack' },
    { tx: 2, ty: 4, kind: 'backpack' },
  ],
  kitchen_evening4: [
    { tx: 23, ty: 2, kind: 'calendar' },
    { tx: 16, ty: 8, kind: 'nasvay' },
    { tx: 13, ty: 8, kind: 'eggs' },
    { tx: 3, ty: 7, kind: 'kettle' },
  ],
  iw_room: [
    { tx: 13, ty: 1, kind: 'lamp' },
    { tx: 16, ty: 9, kind: 'chair' },
  ],
  house_corridor: [
    { tx: 4, ty: 2, kind: 'bike' },
    { tx: 14, ty: 2, kind: 'parentsdoor' },
    { tx: 24, ty: 2, kind: 'mirror' },
    { tx: 2, ty: 8, kind: 'wardrobe' },
    { tx: 26, ty: 8, kind: 'coatrack' },
    { tx: 6, ty: 12, kind: 'runner' },
    { tx: 20, ty: 12, kind: 'runner' },
    { tx: 15, ty: 8, kind: 'ceillamp' },
  ],
};

function drawExtraDecor(ctx, room, camX, camY) {
  const list = DECOR[room.id] || [];
  for (const d of list) {
    const sx = d.tx * TILE_SIZE - camX;
    const sy = d.ty * TILE_SIZE - camY;
    if (sx < -TILE_SIZE || sy < -TILE_SIZE || sx > VIEW_W || sy > VIEW_H) continue;
    switch (d.kind) {
      case 'wardrobe': drawWardrobe(ctx, sx, sy); break;
      case 'poster': drawPoster(ctx, sx, sy); break;
      case 'crack': drawCrack(ctx, sx, sy); break;
      case 'nightstand': drawNightstand(ctx, sx, sy); break;
      case 'slippers': drawSlippers(ctx, sx, sy); break;
      case 'backpack': drawBackpack(ctx, sx, sy); break;
      case 'crane': drawCrane(ctx, sx, sy); break;
      case 'calendar': drawCalendar(ctx, sx, sy); break;
      case 'nasvay': drawNasvay(ctx, sx, sy); break;
      case 'eggs': drawEggs(ctx, sx, sy); break;
      case 'kettle': drawKettle(ctx, sx, sy); break;
      case 'busstop': drawBusStop(ctx, sx, sy); break;
      case 'lamppost': drawLampPost(ctx, sx, sy); break;
      case 'school': drawSchool(ctx, sx, sy); break;
      case 'car': drawCar(ctx, sx, sy); break;
      case 'dog': drawDog(ctx, sx, sy); break;
      case 'bins': drawBins(ctx, sx, sy); break;
      case 'notice': drawNotice(ctx, sx, sy); break;
      case 'radiator': drawRadiator(ctx, sx, sy); break;
      case 'coatrack': drawCoatRack(ctx, sx, sy); break;
      case 'ceillamp': drawCeilLamp(ctx, sx, sy); break;
      case 'globe': drawGlobe(ctx, sx, sy); break;
      case 'flowers': drawFlowers(ctx, sx, sy); break;
      case 'chalk': drawChalk(ctx, sx, sy); break;
      case 'handrail': drawHandrail(ctx, sx, sy); break;
      case 'wheel': drawWheel(ctx, sx, sy); break;
      case 'ad': drawAd(ctx, sx, sy); break;
      case 'frost': drawFrost(ctx, sx, sy); break;
      case 'drawing': drawDrawing(ctx, sx, sy); break;
      case 'shelf': drawShelf(ctx, sx, sy); break;
      case 'photo': drawPhoto(ctx, sx, sy); break;
      case 'stove': drawStove(ctx, sx, sy); break;
      case 'mountains': drawMountains(ctx, sx, sy); break;
      case 'tree': drawTree(ctx, sx, sy); break;
      case 'smoke': drawSmoke(ctx, sx, sy); break;
      case 'lamp': drawLamp(ctx, sx, sy); break;
      case 'bike': drawBike(ctx, sx, sy); break;
      case 'parentsdoor': drawParentsDoor(ctx, sx, sy); break;
      case 'mirror': drawMirror(ctx, sx, sy); break;
      case 'runner': drawRunner(ctx, sx, sy); break;
    }
  }
}

// ---- Отрисовка отдельных объектов ----
function drawWardrobe(ctx, sx, sy) {
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(sx + 2, sy + 2, TILE_SIZE - 4, TILE_SIZE - 4);
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(sx + 4, sy + 4, TILE_SIZE - 8, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(sx + TILE_SIZE / 2 - 1, sy + 4, 2, TILE_SIZE - 8);
}

function drawPoster(ctx, sx, sy) {
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(sx + 4, sy + 4, TILE_SIZE - 8, TILE_SIZE - 8);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(sx + 4, sy + 4, TILE_SIZE - 8, TILE_SIZE - 8);
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(sx + 9, sy + 9, TILE_SIZE - 18, 3);
  ctx.fillRect(sx + 9, sy + 15, TILE_SIZE - 18, 3);
}

function drawCrack(ctx, sx, sy) {
  // трещина на потолке — тёмная ломаная линия на верхней стене
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(sx + 4, sy + 8);
  ctx.lineTo(sx + 10, sy + 14);
  ctx.lineTo(sx + 7, sy + 20);
  ctx.lineTo(sx + 15, sy + 26);
  ctx.lineTo(sx + 13, sy + 30);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(sx + 10, sy + 14);
  ctx.lineTo(sx + 16, sy + 16);
  ctx.stroke();
}

// Тумбочка с будильником у кровати.
function drawNightstand(ctx, sx, sy) {
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fillRect(sx + 4, sy + 6, TILE_SIZE - 8, TILE_SIZE - 10);
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(sx + 5, sy + 7, TILE_SIZE - 10, 2);
  // будильник на тумбочке
  ctx.fillStyle = '#c8a24a';
  ctx.beginPath();
  ctx.arc(sx + 16, sy + 10, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a6a2a';
  ctx.fillRect(sx + 15, sy + 5, 2, 2);   // ножки-звоночки
  ctx.fillRect(sx + 15, sy + 14, 2, 2);
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(sx + 14, sy + 9, 4, 1);   // циферблат
}

// Тапки у кровати.
function drawSlippers(ctx, sx, sy) {
  ctx.fillStyle = 'rgba(90,70,50,0.8)';
  ctx.beginPath();
  ctx.ellipse(sx + 10, sy + 18, 5, 3.5, 0.2, 0, Math.PI * 2);
  ctx.ellipse(sx + 22, sy + 18, 5, 3.5, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(120,95,70,0.8)';
  ctx.beginPath();
  ctx.ellipse(sx + 10, sy + 16, 3.5, 2, 0.2, 0, Math.PI * 2);
  ctx.ellipse(sx + 22, sy + 16, 3.5, 2, -0.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawBackpack(ctx, sx, sy) {
  ctx.fillStyle = '#2c4a6e';
  ctx.fillRect(sx + 6, sy + 6, TILE_SIZE - 12, TILE_SIZE - 12);
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(sx + 8, sy + 8, TILE_SIZE - 16, 3);
}

function drawCrane(ctx, sx, sy) {
  // бумажный журавлик
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.moveTo(sx + 16, sy + 10);
  ctx.lineTo(sx + 10, sy + 20);
  ctx.lineTo(sx + 22, sy + 20);
  ctx.closePath();
  ctx.fill();
}

function drawCalendar(ctx, sx, sy) {
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(sx + 4, sy + 4, TILE_SIZE - 8, TILE_SIZE - 8);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(sx + 4, sy + 4, TILE_SIZE - 8, TILE_SIZE - 8);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(sx + 6, sy + 6, TILE_SIZE - 12, 4);
}

function drawNasvay(ctx, sx, sy) {
  ctx.fillStyle = '#4a3a2a';
  ctx.fillRect(sx + 8, sy + 8, TILE_SIZE - 16, TILE_SIZE - 16);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(sx + 8, sy + 8, TILE_SIZE - 16, 3);
}

function drawEggs(ctx, sx, sy) {
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.ellipse(sx + 16, sy + 16, 9, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f0c040';
  ctx.beginPath();
  ctx.arc(sx + 12, sy + 14, 3, 0, Math.PI * 2);
  ctx.arc(sx + 20, sy + 15, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawKettle(ctx, sx, sy) {
  ctx.fillStyle = '#5a5a5a';
  ctx.beginPath();
  ctx.arc(sx + 16, sy + 16, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(sx + 13, sy + 13, 3, 3);
}

function drawBusStop(ctx, sx, sy) {
  // остановка: столб и козырёк
  ctx.fillStyle = '#6b6b6b';
  ctx.fillRect(sx + 14, sy + 6, 4, TILE_SIZE - 6);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(sx + 4, sy + 2, TILE_SIZE - 8, 4);
}

function drawLampPost(ctx, sx, sy) {
  ctx.fillStyle = '#4a4a4a';
  ctx.fillRect(sx + 15, sy + 4, 3, TILE_SIZE - 4);
  ctx.fillStyle = '#f5c542';
  ctx.beginPath();
  ctx.arc(sx + 16, sy + 4, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawSchool(ctx, sx, sy) {
  // школа вдалеке
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(sx + 2, sy + 8, TILE_SIZE - 4, TILE_SIZE - 10);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(sx + 6, sy + 12, 6, 6);
  ctx.fillRect(sx + 18, sy + 12, 6, 6);
}

function drawCar(ctx, sx, sy) {
  ctx.fillStyle = 'rgba(200,60,60,0.5)';
  ctx.fillRect(sx + 2, sy + 10, TILE_SIZE - 4, 10);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.arc(sx + 8, sy + 22, 3, 0, Math.PI * 2);
  ctx.arc(sx + 24, sy + 22, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawDog(ctx, sx, sy) {
  ctx.fillStyle = 'rgba(120,90,60,0.6)';
  ctx.fillRect(sx + 8, sy + 14, 12, 6);
  ctx.fillRect(sx + 4, sy + 10, 6, 6);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(sx + 20, sy + 12, 6, 2);
}

function drawBins(ctx, sx, sy) {
  ctx.fillStyle = 'rgba(90,90,90,0.6)';
  ctx.fillRect(sx + 4, sy + 8, 10, 14);
  ctx.fillRect(sx + 18, sy + 10, 10, 12);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(sx + 4, sy + 8, 10, 3);
  ctx.fillRect(sx + 18, sy + 10, 10, 3);
}

function drawNotice(ctx, sx, sy) {
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(sx + 3, sy + 3, TILE_SIZE - 6, TILE_SIZE - 6);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(sx + 3, sy + 3, TILE_SIZE - 6, TILE_SIZE - 6);
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(sx + 7, sy + 7, TILE_SIZE - 14, 3);
  ctx.fillRect(sx + 7, sy + 13, TILE_SIZE - 14, 3);
  ctx.fillRect(sx + 7, sy + 19, TILE_SIZE - 14, 3);
}

function drawRadiator(ctx, sx, sy) {
  ctx.fillStyle = 'rgba(200,200,200,0.4)';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(sx + 4 + i * 7, sy + 6, 4, TILE_SIZE - 12);
  }
}

function drawCoatRack(ctx, sx, sy) {
  ctx.fillStyle = '#5a3c20';
  ctx.fillRect(sx + 14, sy + 4, 4, TILE_SIZE - 8);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(sx + 8, sy + 4, 16, 3);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(sx + 6, sy + 8, 4, 8);
  ctx.fillRect(sx + 22, sy + 10, 4, 8);
}

function drawCeilLamp(ctx, sx, sy) {
  // лампа на потолке (вид сверху — световое пятно)
  ctx.fillStyle = 'rgba(255,225,120,0.18)';
  ctx.beginPath();
  ctx.arc(sx + 16, sy + 16, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f5c542';
  ctx.beginPath();
  ctx.arc(sx + 16, sy + 16, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawGlobe(ctx, sx, sy) {
  ctx.fillStyle = '#3a6ea5';
  ctx.beginPath();
  ctx.arc(sx + 16, sy + 12, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5a3c20';
  ctx.fillRect(sx + 14, sy + 18, 4, 8);
}

function drawFlowers(ctx, sx, sy) {
  ctx.fillStyle = '#3a6e3a';
  ctx.fillRect(sx + 8, sy + 10, 2, 10);
  ctx.fillRect(sx + 16, sy + 10, 2, 10);
  ctx.fillRect(sx + 24, sy + 10, 2, 10);
  ctx.fillStyle = '#e05a5a';
  ctx.beginPath();
  ctx.arc(sx + 9, sy + 9, 2.5, 0, Math.PI * 2);
  ctx.arc(sx + 17, sy + 9, 2.5, 0, Math.PI * 2);
  ctx.arc(sx + 25, sy + 9, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawChalk(ctx, sx, sy) {
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillRect(sx + 6, sy + 6, TILE_SIZE - 12, 4);
  ctx.fillRect(sx + 10, sy + 12, TILE_SIZE - 20, 4);
}

function drawHandrail(ctx, sx, sy) {
  ctx.strokeStyle = 'rgba(200,200,200,0.5)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(sx + 4, sy + 4);
  ctx.lineTo(sx + TILE_SIZE - 4, sy + TILE_SIZE - 4);
  ctx.stroke();
}

function drawWheel(ctx, sx, sy) {
  ctx.strokeStyle = 'rgba(200,200,200,0.5)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(sx + 16, sy + 16, 8, 0, Math.PI * 2);
  ctx.stroke();
}

function drawAd(ctx, sx, sy) {
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(sx + 2, sy + 2, TILE_SIZE - 4, TILE_SIZE - 4);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(sx + 2, sy + 2, TILE_SIZE - 4, TILE_SIZE - 4);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(sx + 6, sy + 6, TILE_SIZE - 12, 3);
}

function drawFrost(ctx, sx, sy) {
  // морозные узоры на стекле
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(sx + 8, sy + 8);
  ctx.lineTo(sx + 14, sy + 14);
  ctx.lineTo(sx + 10, sy + 20);
  ctx.moveTo(sx + 14, sy + 14);
  ctx.lineTo(sx + 22, sy + 10);
  ctx.stroke();
}

function drawDrawing(ctx, sx, sy) {
  // рисунок сестры: дом и солнце
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(sx + 4, sy + 4, TILE_SIZE - 8, TILE_SIZE - 8);
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(sx + 4, sy + 4, TILE_SIZE - 8, TILE_SIZE - 8);
  ctx.fillStyle = 'rgba(255,220,80,0.6)';
  ctx.beginPath();
  ctx.arc(sx + 22, sy + 10, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.strokeRect(sx + 10, sy + 14, 10, 10);
}

function drawShelf(ctx, sx, sy) {
  ctx.fillStyle = '#5a3c20';
  ctx.fillRect(sx + 2, sy + 8, TILE_SIZE - 4, 4);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(sx + 5, sy + 4, 5, 4);
  ctx.fillRect(sx + 14, sy + 4, 5, 4);
  ctx.fillRect(sx + 23, sy + 4, 5, 4);
}

function drawSmoke(ctx, sx, sy) {
  ctx.fillStyle = 'rgba(200,200,200,0.25)';
  ctx.beginPath();
  ctx.arc(sx + 16, sy + 8, 4, 0, Math.PI * 2);
  ctx.arc(sx + 20, sy + 4, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawLamp(ctx, sx, sy) {
  // лампа в комнате внутреннего мира
  ctx.fillStyle = 'rgba(255,225,120,0.2)';
  ctx.beginPath();
  ctx.arc(sx + 16, sy + 16, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f5c542';
  ctx.beginPath();
  ctx.arc(sx + 16, sy + 16, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawBike(ctx, sx, sy) {
  ctx.strokeStyle = 'rgba(60,60,60,0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(sx + 10, sy + 18, 6, 0, Math.PI * 2);
  ctx.arc(sx + 24, sy + 18, 6, 0, Math.PI * 2);
  ctx.moveTo(sx + 10, sy + 18);
  ctx.lineTo(sx + 17, sy + 10);
  ctx.lineTo(sx + 24, sy + 18);
  ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.arc(sx + 10, sy + 18, 2, 0, Math.PI * 2);
  ctx.arc(sx + 24, sy + 18, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawParentsDoor(ctx, sx, sy) {
  // дверь родителей — двойная, с ручками
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(sx + 2, sy + 2, TILE_SIZE - 4, TILE_SIZE - 4);
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(sx + 2, sy + 2, TILE_SIZE - 4, TILE_SIZE - 4);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.arc(sx + 10, sy + 16, 1.6, 0, Math.PI * 2);
  ctx.arc(sx + 22, sy + 16, 1.6, 0, Math.PI * 2);
  ctx.fill();
}

function drawMirror(ctx, sx, sy) {
  ctx.fillStyle = 'rgba(200,220,230,0.3)';
  ctx.fillRect(sx + 4, sy + 4, TILE_SIZE - 8, TILE_SIZE - 8);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(sx + 4, sy + 4, TILE_SIZE - 8, TILE_SIZE - 8);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(sx + 8, sy + 8, 5, 5);
}

function drawRunner(ctx, sx, sy) {
  // ковровая дорожка в коридоре
  ctx.fillStyle = 'rgba(120,60,60,0.4)';
  ctx.fillRect(sx + 2, sy + 2, TILE_SIZE - 4, TILE_SIZE - 4);
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(sx + 4, sy + 4, TILE_SIZE - 8, TILE_SIZE - 8);
}

function drawMountains(ctx, sx, sy) {
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.moveTo(sx + 2, sy + TILE_SIZE);
  ctx.lineTo(sx + 16, sy + 4);
  ctx.lineTo(sx + 30, sy + TILE_SIZE);
  ctx.closePath();
  ctx.fill();
}

// ---- Точка входа ----
export function drawDecor(ctx, room, camX, camY) {
  drawFurnitureDetails(ctx, room, camX, camY);
  drawExtraDecor(ctx, room, camX, camY);
}