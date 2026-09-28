// characters.js — отрисовка персонажей (вид сверху, стилизованно).
//
// drawCharacter(ctx, x, y, charId, opts)
//   opts.frame    — кадр анимации ходьбы (0|1), смена каждые 0.15 с
//   opts.face     — 'down' | 'up' | 'left' | 'right'
//   opts.walk     — идёт ли персонаж (влияет на ноги)
//   opts.emotion  — 'neutral' | 'sad' | 'angry' | 'happy' | 'tired' | 'scared'
//
// drawPortrait(ctx, x, y, charId, emotion, r) — простое лицо для диалогов.

export const CHARACTERS = {
  kori:   { jacket: '#2c4a6e', jacketDark: '#1e3550', hair: '#141416', pants: '#6e6e74', skin: '#e8c39a', shoes: '#33333a' },
  sister: { jacket: '#e67e9f', jacketDark: '#c05f82', hair: '#4a2a1a', pants: '#8a6a8a', skin: '#f0c9a8', shoes: '#c0392b', braids: true },
  mother: { jacket: '#9a9a9a', jacketDark: '#7a7a7a', hair: '#5a4a3a', pants: '#6a6a6a', skin: '#e0b894', shoes: '#4a4a4a', tired: true },
  father: { jacket: '#c0392b', jacketDark: '#96281b', hair: '#26262a', pants: '#3a3a3e', skin: '#d8a878', shoes: '#1f1f24', boots: true },
  girl:   { jacket: '#3cb371', jacketDark: '#2a8f5a', hair: '#e8d8a8', pants: '#2a6a4a', skin: '#f0c9a8', shoes: '#2a6a4a' },
  girl_backpack: { jacket: '#2a9d8f', jacketDark: '#1f7a70', hair: '#c8a878', pants: '#5a5a5a', skin: '#f0c9a8', shoes: '#3a3a3a', backpack: '#2f6f4f' },
  ded:    { jacket: '#6b5635', jacketDark: '#4f3e24', hair: '#c8c8c8', pants: '#4a3a2a', skin: '#d8b088', shoes: '#3a2a1a', beard: true, back: true },
  teacher: { jacket: '#7a6a8a', jacketDark: '#5f5268', hair: '#8a7a6a', pants: '#5a5a5a', skin: '#e0b894', shoes: '#4a4a4a' },
  boy:    { jacket: '#2c7fb8', jacketDark: '#1f5f8c', hair: '#141416', pants: '#6e6e74', skin: '#e8c39a', shoes: '#33333a' },
  faceless: { jacket: '#6b6358', jacketDark: '#55504a', hair: '#55504a', pants: '#4a4a4a', skin: '#6b6358', shoes: '#3a3a3a', faceless: true },
};

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function drawCharacter(ctx, x, y, charId, opts = {}) {
  const c = CHARACTERS[charId] || CHARACTERS.kori;
  const frame = opts.frame || 0;
  const face = opts.face || 'down';
  const walk = !!opts.walk;
  const emotion = opts.emotion || 'neutral';

  const cx = x + 16; // центр тайла

  // тень
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(cx, y + 29, 9, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // ноги (4×6, анимация 2 кадра: вместе / врозь)
  const legY = y + 23;
  ctx.fillStyle = c.pants;
  if (walk) {
    if (frame === 0) {
      ctx.fillRect(cx - 8, legY, 4, 6);
      ctx.fillRect(cx + 4, legY, 4, 6);
    } else {
      ctx.fillRect(cx - 10, legY, 4, 6);
      ctx.fillRect(cx + 6, legY, 4, 6);
    }
  } else {
    ctx.fillRect(cx - 7, legY, 4, 6);
    ctx.fillRect(cx + 3, legY, 4, 6);
  }
  // обувь
  ctx.fillStyle = c.shoes;
  ctx.fillRect(cx - 8, legY + 5, 5, 2);
  ctx.fillRect(cx + 3, legY + 5, 5, 2);

  // руки (3×10) по бокам тела
  ctx.fillStyle = c.jacket;
  ctx.fillRect(cx - 10, y + 13, 3, 10);
  ctx.fillRect(cx + 7, y + 13, 3, 10);

  // тело (12×14)
  ctx.fillStyle = c.jacket;
  roundRect(ctx, cx - 6, y + 11, 12, 14, 3);
  ctx.fill();
  ctx.fillStyle = c.jacketDark;
  ctx.fillRect(cx - 6, y + 22, 12, 3); // низ куртки

  // рюкзак (новенькая) — за спиной
  if (c.backpack) {
    ctx.fillStyle = c.backpack;
    roundRect(ctx, cx - 5, y + 8, 10, 8, 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(cx - 5, y + 8, 10, 2);
  }

  // голова — круг радиусом 6
  const hy = y + 8;
  ctx.fillStyle = c.skin;
  ctx.beginPath();
  ctx.arc(cx, hy, 6, 0, Math.PI * 2);
  ctx.fill();

  // волосы — тёмный полукруг сверху
  ctx.fillStyle = c.hair;
  ctx.beginPath();
  ctx.arc(cx, hy, 6, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(cx - 6, hy - 1, 12, 2);

  // косички сестры
  if (c.braids) {
    ctx.fillStyle = c.hair;
    ctx.fillRect(cx - 8, hy + 1, 2, 7);
    ctx.fillRect(cx + 6, hy + 1, 2, 7);
  }

  // борода деда
  if (c.beard) {
    ctx.fillStyle = c.hair;
    ctx.beginPath();
    ctx.arc(cx, hy + 3, 4.5, 0, Math.PI);
    ctx.fill();
  }

  // лицо (если не спиной и не безликий)
  if (!c.back && !c.faceless) {
    const ex = face === 'right' ? 2 : face === 'left' ? -2 : 0;
    const ey = face === 'up' ? -1.5 : face === 'down' ? 1.5 : 0;
    if (c.tired) {
      // усталые глаза матери — прикрытые линии
      ctx.strokeStyle = '#1a1a1e';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx - 3.5 + ex, hy + 1 + ey); ctx.lineTo(cx - 0.5 + ex, hy + 2.5 + ey);
      ctx.moveTo(cx + 3.5 + ex, hy + 1 + ey); ctx.lineTo(cx + 0.5 + ex, hy + 2.5 + ey);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#1a1a1e';
      ctx.beginPath();
      ctx.arc(cx - 2.2 + ex, hy + 2 + ey, 1, 0, Math.PI * 2);
      ctx.arc(cx + 2.2 + ex, hy + 2 + ey, 1, 0, Math.PI * 2);
      ctx.fill();
    }
    // рот по эмоции
    ctx.strokeStyle = '#7a4a3a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const mx = cx + ex, my = hy + 4 + ey;
    if (emotion === 'happy') { ctx.arc(mx, my - 1, 1.4, 0, Math.PI); }
    else if (emotion === 'sad') { ctx.arc(mx, my + 1.5, 1.4, Math.PI, 0); }
    else if (emotion === 'angry') { ctx.moveTo(mx - 2, my - 0.5); ctx.lineTo(mx + 2, my + 0.5); }
    else if (emotion === 'scared') { ctx.arc(mx, my, 1.1, 0, Math.PI * 2); }
    else { ctx.moveTo(mx - 1.5, my); ctx.lineTo(mx + 1.5, my); }
    ctx.stroke();
  }
}

// Простое лицо для портрета в диалоге (справа от текста).
export function drawPortrait(ctx, x, y, charId, emotion = 'neutral', r = 34) {
  const c = CHARACTERS[charId] || CHARACTERS.kori;

  // фон-круг
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,180,120,0.3)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // лицо
  ctx.fillStyle = c.skin;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.62, 0, Math.PI * 2);
  ctx.fill();

  // волосы
  ctx.fillStyle = c.hair;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.62, Math.PI * 0.95, Math.PI * 0.05);
  ctx.fill();
  ctx.fillRect(x - r * 0.62, y - r * 0.62, r * 1.24, r * 0.18);

  // косички сестры
  if (c.braids) {
    ctx.fillRect(x - r * 0.78, y - r * 0.3, r * 0.14, r * 0.7);
    ctx.fillRect(x + r * 0.64, y - r * 0.3, r * 0.14, r * 0.7);
  }
  // борода деда
  if (c.beard) {
    ctx.beginPath();
    ctx.arc(x, y + r * 0.18, r * 0.42, 0, Math.PI);
    ctx.fill();
  }

  // глаза
  if (!c.faceless) {
    ctx.fillStyle = '#1a1a1e';
    ctx.beginPath();
    ctx.arc(x - r * 0.2, y - r * 0.05, r * 0.055, 0, Math.PI * 2);
    ctx.arc(x + r * 0.2, y - r * 0.05, r * 0.055, 0, Math.PI * 2);
    ctx.fill();
  }

  // рот
  ctx.strokeStyle = '#7a4a3a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  const my = y + r * 0.22;
  if (emotion === 'happy') { ctx.arc(x, my - r * 0.06, r * 0.14, 0, Math.PI); }
  else if (emotion === 'sad') { ctx.arc(x, my + r * 0.12, r * 0.14, Math.PI, 0); }
  else if (emotion === 'angry') { ctx.moveTo(x - r * 0.16, my - r * 0.04); ctx.lineTo(x + r * 0.16, my + r * 0.04); }
  else if (emotion === 'scared') { ctx.arc(x, my, r * 0.1, 0, Math.PI * 2); }
  else { ctx.moveTo(x - r * 0.13, my); ctx.lineTo(x + r * 0.13, my); }
  ctx.stroke();

  // брови для angry/sad
  if (emotion === 'angry' || emotion === 'sad') {
    ctx.strokeStyle = '#1a1a1e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (emotion === 'angry') {
      ctx.moveTo(x - r * 0.3, y - r * 0.22); ctx.lineTo(x - r * 0.08, y - r * 0.14);
      ctx.moveTo(x + r * 0.3, y - r * 0.22); ctx.lineTo(x + r * 0.08, y - r * 0.14);
    } else {
      ctx.moveTo(x - r * 0.28, y - r * 0.14); ctx.lineTo(x - r * 0.1, y - r * 0.2);
      ctx.moveTo(x + r * 0.28, y - r * 0.14); ctx.lineTo(x + r * 0.1, y - r * 0.2);
    }
    ctx.stroke();
  }
}