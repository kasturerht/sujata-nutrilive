// scripts/check-learn-links.mjs
import fs from 'fs';

const pages = [
  'src/pages/learn/spirulina-in-marathi.astro',
  'src/pages/learn/best-spirulina-brand-in-india.astro',
  'src/pages/learn/sea-buckthorn-in-hindi.astro',
  'src/pages/learn/which-company-sea-buckthorn-is-best.astro',
  'src/pages/science.astro'
];

for (const p of pages) {
  const content = fs.readFileSync(p, 'utf8');
  const matches = [...content.matchAll(/href=["']([^"']+)["']/g)].map(m => m[1]);
  const prods = matches.filter(m => m.includes('/product/'));
  console.log(`=== ${p} ===`);
  console.log(`Product links (${prods.length}):`, [...new Set(prods)]);
}
