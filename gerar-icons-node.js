/**
 * Gerador de ícones PWA para SD Sistemas
 * Gera PNGs usando apenas módulos nativos do Node.js (zlib + fs)
 * Sem dependências externas!
 */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// ─── Cores da logo SD Sistemas ───
const BG    = [9,   10,  18];   // #090a12 - fundo navy escuro
const BLUE  = [56,  189, 248];  // #38bdf8 - azul claro (letra S)
const WHITE = [255, 255, 255];  // branco   (letra D)
const INDIGO= [99,  102, 241];  // #6366f1  - índigo (borda/destaque)

// ─── Utilitário CRC32 (necessário para chunks PNG) ───
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function uint32BE(n) {
  return Buffer.from([(n >>> 24) & 0xFF, (n >>> 16) & 0xFF, (n >>> 8) & 0xFF, n & 0xFF]);
}

function makeChunk(type, data) {
  const typeB = Buffer.from(type, 'ascii');
  const lenB  = uint32BE(data.length);
  const crcB  = uint32BE(crc32(Buffer.concat([typeB, data])));
  return Buffer.concat([lenB, typeB, data, crcB]);
}

// ─── Gerador de PNG raw a partir de pixels RGBA ───
function encodePNG(pixels, width, height) {
  const PNG_SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width,  0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type: RGB
  ihdr[10] = ihdr[11] = ihdr[12] = 0;

  // Raw image data: 1 filter byte per row + RGB pixels
  const raw = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 3)] = 0; // filter type None
    for (let x = 0; x < width; x++) {
      const si = (y * width + x) * 3;
      const di = y * (1 + width * 3) + 1 + x * 3;
      raw[di]     = pixels[si];
      raw[di + 1] = pixels[si + 1];
      raw[di + 2] = pixels[si + 2];
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 6 });
  return Buffer.concat([
    PNG_SIG,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

// ─── Desenha a logo SD Sistemas em pixels ───
function drawSDLogo(size) {
  const pixels = new Uint8Array(size * size * 3);

  // Preenche fundo navy
  for (let i = 0; i < size * size; i++) {
    pixels[i * 3]     = BG[0];
    pixels[i * 3 + 1] = BG[1];
    pixels[i * 3 + 2] = BG[2];
  }

  function setPixel(x, y, color) {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const i = (y * size + x) * 3;
    pixels[i] = color[0]; pixels[i+1] = color[1]; pixels[i+2] = color[2];
  }

  function fillRect(x, y, w, h, color) {
    for (let dy = 0; dy < h; dy++)
      for (let dx = 0; dx < w; dx++)
        setPixel(x + dx, y + dy, color);
  }

  function drawCircle(cx, cy, r, color, fill = true) {
    for (let dy = -r; dy <= r; dy++)
      for (let dx = -r; dx <= r; dx++)
        if (dx*dx + dy*dy <= r*r) setPixel(cx + dx, cy + dy, color);
  }

  const s = size;
  const half = s / 2;
  const pad  = Math.round(s * 0.1);

  // ── Círculo de destaque suave (fundo gradiente simulado) ──
  drawCircle(Math.round(half), Math.round(half * 0.85), Math.round(s * 0.38), [18, 22, 50]);

  // ── Letra "S" (bloco azul esquerdo) ──
  const sw = Math.round(s * 0.18);  // stroke width
  const lx = Math.round(s * 0.12);
  const ly = Math.round(s * 0.12);
  const lw = Math.round(s * 0.34);
  const lh = Math.round(s * 0.62);

  // Top bar S
  fillRect(lx, ly, lw, sw, BLUE);
  // Middle bar S
  fillRect(lx, Math.round(ly + lh/2 - sw/2), lw, sw, BLUE);
  // Bottom bar S
  fillRect(lx, ly + lh - sw, lw, sw, BLUE);
  // Top-left vertical S
  fillRect(lx, ly, sw, Math.round(lh/2), BLUE);
  // Bottom-right vertical S
  fillRect(lx + lw - sw, Math.round(ly + lh/2), sw, Math.round(lh/2), BLUE);

  // ── Letra "D" (bloco branco direito) ──
  const dx2 = Math.round(s * 0.54);
  const dw  = Math.round(s * 0.34);

  // Left vertical D
  fillRect(dx2, ly, sw, lh, WHITE);
  // Top bar D
  fillRect(dx2, ly, dw - sw, sw, WHITE);
  // Bottom bar D
  fillRect(dx2, ly + lh - sw, dw - sw, sw, WHITE);
  // Right arc D (simplified as vertical bar)
  fillRect(dx2 + dw - sw, Math.round(ly + sw), sw, lh - sw * 2, WHITE);

  // ── Símbolo </> dentro do D ──
  const codeY = Math.round(ly + lh * 0.3);
  const codeH = Math.round(lh * 0.4);
  const codeCX = Math.round(dx2 + dw * 0.45);
  const codeW  = Math.round(sw * 0.6);
  // barra central
  fillRect(codeCX - codeW/2, codeY, codeW, codeH, BLUE);

  // ── Linha separadora ──
  const lineY = Math.round(s * 0.82);
  const lineH = Math.max(1, Math.round(s * 0.012));
  fillRect(pad, lineY, s - pad * 2, lineH, INDIGO);

  // ── Bloco colorido inferior (texto simulado) ──
  const textY  = Math.round(s * 0.86);
  const textH  = Math.max(2, Math.round(s * 0.025));
  const blockW = Math.round((s - pad * 2) * 0.28);
  // "SD" em azul
  fillRect(pad, textY, blockW, textH, BLUE);
  // "SISTEMAS" em branco
  fillRect(pad + blockW + Math.round(s*0.02), textY, Math.round((s - pad*2) * 0.68), textH, WHITE);

  return pixels;
}

// ─── Gera todos os tamanhos ───
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const outDir = path.join(__dirname, 'icons');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

console.log('🎨 Gerando ícones PWA para SD Sistemas...\n');

for (const size of SIZES) {
  const pixels  = drawSDLogo(size);
  const pngData = encodePNG(pixels, size, size);
  const outPath = path.join(outDir, `icon-${size}.png`);
  fs.writeFileSync(outPath, pngData);
  console.log(`  ✅ icon-${size}.png  (${pngData.length} bytes)`);
}

// Copia o 512 como favicon também
fs.copyFileSync(path.join(outDir, 'icon-512.png'), path.join(__dirname, 'favicon.ico'));

console.log('\n✅ Todos os ícones gerados em /icons/');
console.log('   Faça git add -A e git push para publicar!');
