// scripts/check-pdp-links.mjs
import fs from 'fs';

const content = fs.readFileSync('src/pages/product/[handle].astro', 'utf8');
const matches = [...content.matchAll(/href=["'](\/product\/[^"']+)["']/g)].map(m => m[1]);
console.log('Product links inside [handle].astro:', [...new Set(matches)]);
