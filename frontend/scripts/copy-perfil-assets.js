import fs from 'fs';
import path from 'path';

const root = path.resolve();
const srcDir = path.join(root, 'src', 'PerfilZoa', 'public');
const outDir = path.join(root, 'public');

const files = [
  'Calendar@2x.png',
  'image-17@2x.png',
  'image-19@2x.png',
  'image-21@2x.png',
  'Line-8.svg',
  'Rectangle-1.svg',
  'Rectangle-20.svg',
  'vite.svg'
];

if (!fs.existsSync(srcDir)) {
  console.error('Source directory not found:', srcDir);
  process.exit(1);
}
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

for (const f of files) {
  const from = path.join(srcDir, f);
  const to = path.join(outDir, f);
  if (!fs.existsSync(from)) {
    console.warn('Skipping missing file:', from);
    continue;
  }
  fs.copyFileSync(from, to);
  console.log('Copied', f);
}

// copy fonts folder if present
const fontsSrc = path.join(srcDir, 'fonts');
const fontsOut = path.join(outDir, 'fonts');
if (fs.existsSync(fontsSrc)) {
  fs.mkdirSync(fontsOut, { recursive: true });
  const fontFiles = fs.readdirSync(fontsSrc);
  for (const f of fontFiles) {
    const from = path.join(fontsSrc, f);
    const to = path.join(fontsOut, f);
    fs.copyFileSync(from, to);
    console.log('Copied font', f);
  }
}

console.log('PerfilZoa assets copy complete.');
