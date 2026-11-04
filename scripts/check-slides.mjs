import fs from 'fs';
const content = fs.readFileSync('src/components/StoreHero.astro', 'utf8');

const regex = /id="(hero-slide-\d)"/g;
let match;
while ((match = regex.exec(content)) !== null) {
  console.log('Found:', match[1]);
}
