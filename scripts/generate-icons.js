/**
 * Generates the app icon set (flat cat face on a blue gradient) without any
 * image dependencies — raw RGBA buffers encoded as PNG via zlib.
 * Run: node scripts/generate-icons.js
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.join(__dirname, '..', 'assets', 'images');

// ---------- PNG encoding ----------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function writePng(filename, width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  fs.writeFileSync(path.join(OUT, filename), png);
  console.log('wrote', filename, width + 'x' + height, (png.length / 1024).toFixed(1) + 'KB');
}

// ---------- scene description (unit coords, y down, 0..1) ----------
function hex(c) {
  return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
}

const BLUE_TOP = hex('#4D7DF2');
const BLUE_BOTTOM = hex('#3B5FE0');
const WHITE = [255, 255, 255];
const DARK = hex('#1F2430');
const PINK = hex('#F58FA6');
const YELLOW = hex('#FFD83D');

function inTriangle(px, py, ax, ay, bx, by, cx, cy) {
  const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
  const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
  const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
  const neg = d1 < 0 || d2 < 0 || d3 < 0;
  const pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}

function distSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  const ex = ax + t * dx - px;
  const ey = ay + t * dy - py;
  return Math.sqrt(ex * ex + ey * ey);
}

/**
 * Returns the color [r,g,b,a] of the cat-face artwork at unit point (x, y),
 * or null for transparent. `opts.mono` paints everything white (Android
 * monochrome layer); `opts.scale` shrinks the face around the center.
 */
function catFaceAt(x, y, opts = {}) {
  const s = opts.scale ?? 1;
  x = 0.5 + (x - 0.5) / s;
  y = 0.5 + (y - 0.5) / s;

  const cx = 0.5;
  const cy = 0.54;
  const r = 0.30;
  const dx = x - cx;
  const dy = y - cy;
  const inHead = (dx * dx) / (r * r) + (dy * dy) / ((r * 0.92) * (r * 0.92)) <= 1;

  const inEarL = inTriangle(x, y, 0.255, 0.42, 0.305, 0.175, 0.475, 0.305);
  const inEarR = inTriangle(x, y, 0.745, 0.42, 0.695, 0.175, 0.525, 0.305);
  const inInnerL = inTriangle(x, y, 0.305, 0.385, 0.325, 0.245, 0.43, 0.325);
  const inInnerR = inTriangle(x, y, 0.695, 0.385, 0.675, 0.245, 0.57, 0.325);

  if (!inHead && !inEarL && !inEarR) return null;
  if (opts.mono) return [...WHITE, 255];

  // eyes: closed happy arcs (dark, thick)
  const eyeT = 0.013;
  const eyeL = Math.min(
    distSeg(x, y, 0.345, 0.52, 0.385, 0.495),
    distSeg(x, y, 0.385, 0.495, 0.425, 0.52)
  );
  const eyeR = Math.min(
    distSeg(x, y, 0.575, 0.52, 0.615, 0.495),
    distSeg(x, y, 0.615, 0.495, 0.655, 0.52)
  );
  if (eyeL < eyeT || eyeR < eyeT) return [...DARK, 255];

  // nose: small pink triangle
  if (inTriangle(x, y, 0.468, 0.585, 0.532, 0.585, 0.5, 0.625)) return [...PINK, 255];

  // mouth: little "w" under the nose
  const mouthT = 0.0085;
  const mouth = Math.min(
    distSeg(x, y, 0.5, 0.625, 0.5, 0.65),
    distSeg(x, y, 0.5, 0.65, 0.46, 0.665),
    distSeg(x, y, 0.5, 0.65, 0.54, 0.665)
  );
  if (mouth < mouthT) return [...DARK, 255];

  // whiskers
  const wT = 0.0075;
  const whisker = Math.min(
    distSeg(x, y, 0.13, 0.55, 0.30, 0.565),
    distSeg(x, y, 0.14, 0.63, 0.30, 0.615),
    distSeg(x, y, 0.87, 0.55, 0.70, 0.565),
    distSeg(x, y, 0.86, 0.63, 0.70, 0.615)
  );
  if (whisker < wT && !inHead) return null; // whiskers only drawn over bg, skip outside
  if (whisker < wT) return [...DARK, 255];

  if (inInnerL || inInnerR) return [...PINK, 255];
  return [...WHITE, 255];
}

/** Yellow chat bubble with three dots, top-right. */
function bubbleAt(x, y) {
  const bx = 0.80;
  const by = 0.175;
  const rw = 0.145;
  const rh = 0.095;
  const rr = 0.05;
  const qx = Math.abs(x - bx) - (rw - rr);
  const qy = Math.abs(y - by) - (rh - rr);
  const outside = Math.sqrt(Math.max(qx, 0) ** 2 + Math.max(qy, 0) ** 2) + Math.min(Math.max(qx, qy), 0);
  const inBubble = outside <= rr;
  const inTail = inTriangle(x, y, 0.735, 0.255, 0.80, 0.255, 0.715, 0.33);
  if (!inBubble && !inTail) return null;
  for (let i = -1; i <= 1; i++) {
    const ddx = x - (bx + i * 0.056);
    const ddy = y - by;
    if (ddx * ddx + ddy * ddy < 0.0152 * 0.0152) return [...DARK, 255];
  }
  return [...YELLOW, 255];
}

// ---------- renderers ----------
const SS = 2; // supersampling factor

function render(filename, size, pixelAt) {
  const rgba = Buffer.alloc(size * size * 4);
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const x = (px + (sx + 0.5) / SS) / size;
          const y = (py + (sy + 0.5) / SS) / size;
          const c = pixelAt(x, y) ?? [0, 0, 0, 0];
          r += c[0];
          g += c[1];
          b += c[2];
          a += c[3];
        }
      }
      const n = SS * SS;
      const i = (py * size + px) * 4;
      rgba[i] = Math.round(r / n);
      rgba[i + 1] = Math.round(g / n);
      rgba[i + 2] = Math.round(b / n);
      rgba[i + 3] = Math.round(a / n);
    }
  }
  writePng(filename, size, size, rgba);
}

function gradientBg(x, y) {
  const t = y;
  return [
    Math.round(BLUE_TOP[0] + (BLUE_BOTTOM[0] - BLUE_TOP[0]) * t),
    Math.round(BLUE_TOP[1] + (BLUE_BOTTOM[1] - BLUE_TOP[1]) * t),
    Math.round(BLUE_TOP[2] + (BLUE_BOTTOM[2] - BLUE_TOP[2]) * t),
    255,
  ];
}

// Main app icon: gradient bg + bubble + cat face
render('icon.png', 1024, (x, y) => bubbleAt(x, y) ?? catFaceAt(x, y) ?? gradientBg(x, y));

// Splash: white-on-transparent mark
render('splash-icon.png', 512, (x, y) => bubbleAt(x, y) ?? catFaceAt(x, y));

// Android adaptive: foreground (face in the 66% safe zone), background, monochrome
render('android-icon-foreground.png', 1024, (x, y) => {
  const inner = (v) => 0.5 + (v - 0.5) / 0.62;
  const ix = inner(x);
  const iy = inner(y);
  if (ix < 0 || ix > 1 || iy < 0 || iy > 1) return null;
  return bubbleAt(ix, iy) ?? catFaceAt(ix, iy);
});
render('android-icon-background.png', 1024, gradientBg);
render('android-icon-monochrome.png', 1024, (x, y) => {
  const inner = (v) => 0.5 + (v - 0.5) / 0.62;
  const ix = inner(x);
  const iy = inner(y);
  if (ix < 0 || ix > 1 || iy < 0 || iy > 1) return null;
  return catFaceAt(ix, iy, { mono: true });
});

// Favicon
render('favicon.png', 48, (x, y) => bubbleAt(x, y) ?? catFaceAt(x, y) ?? gradientBg(x, y));

console.log('Done.');
