import fs from 'fs';

const html = fs.readFileSync('reports/b12_page.html', 'utf8');

const bbIdx = html.indexOf('id="desktop_buybox"');
console.log('desktop_buybox index:', bbIdx);
if (bbIdx !== -1) {
  console.log('Buybox snippet:', html.substring(bbIdx, bbIdx + 2000).replace(/\s+/g, ' '));
}

const unavailIdx = html.indexOf('Currently unavailable');
console.log('Currently unavailable index:', unavailIdx);
if (unavailIdx !== -1) {
  console.log('Unavailable snippet:', html.substring(unavailIdx - 200, unavailIdx + 300).replace(/\s+/g, ' '));
}

const sellerIdx = html.indexOf('AD4L5XJBNYMFJ');
console.log('Seller ID in HTML:', sellerIdx !== -1 ? 'FOUND at ' + sellerIdx : 'NOT FOUND');
