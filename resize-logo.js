const sharp = require('sharp');
const path  = require('path');
const fs    = require('fs');

const SRC    = path.join(__dirname, 'logo-source.jpg');
const OUTDIR = path.join(__dirname, 'icons');
const SIZES  = [72, 96, 128, 144, 152, 192, 384, 512];

if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });

console.log('🎨 Gerando ícones PWA da logo SD Sistemas...\n');

(async () => {
  for (const size of SIZES) {
    const out = path.join(OUTDIR, `icon-${size}.png`);
    await sharp(SRC)
      .resize(size, size, { fit: 'cover', position: 'centre' })
      .png({ compressionLevel: 9 })
      .toFile(out);
    const bytes = fs.statSync(out).size;
    console.log(`  ✅ icon-${size}.png  (${bytes} bytes)`);
  }

  // favicon.ico = icon-192 renomeado
  fs.copyFileSync(path.join(OUTDIR, 'icon-192.png'), path.join(__dirname, 'favicon.ico'));
  console.log('\n✅ Todos os ícones gerados com a logo real!');
})();
