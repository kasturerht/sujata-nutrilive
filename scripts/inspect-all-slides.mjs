import fs from 'fs';

const content = fs.readFileSync('src/components/StoreHero.astro', 'utf8');
const lines = content.split('\r\n');

lines.forEach((line, i) => {
  if (line.includes('id="hero-slide-')) {
    console.log(`Line ${i + 1}: ${line}`);
  }
});
