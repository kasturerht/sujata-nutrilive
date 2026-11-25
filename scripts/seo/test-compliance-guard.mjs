// scripts/seo/test-compliance-guard.mjs
// Proves the build-time compliance guard catches seeded claims in English, Hindi and Marathi,
// blocks disease-named routes, and leaves compliant copy and the statutory disclaimer alone.
// Usage: node scripts/seo/test-compliance-guard.mjs   (exit 1 on any failure)
import path from 'node:path';
import { scanSource, scanRoute } from '../../plugins/vite-compliance-guard.mjs';

const root = process.cwd();
const page = (name) => path.join(root, 'src', 'pages', 'learn', name);
const body = (text) => `---\nconst x = 1;\n---\n<p>${text}</p>\n`;

const mustFlag = [
  ['en cure', 'Spirulina cures anaemia in weeks.'],
  ['en miracle', 'A miracle superfood for everyone.'],
  ['en fat', 'This blend burns fat while you sleep.'],
  ['hi cure', 'यह कैप्सूल मधुमेह को जड़ से खत्म करता है।'],
  ['hi cure 2', 'यह बीमारी को पूरी तरह ठीक करता है।'],
  ['hi miracle', 'स्पिरुलिना एक रामबाण इलाज है।'],
  ['hi weight', 'रोज़ लेने से वजन घटाता है।'],
  ['mr cure', 'हे कॅप्सूल मधुमेह पूर्णपणे बरा करते.'],
  ['mr cure 2', 'हा आजार मुळापासून नष्ट होतो.'],
  ['mr miracle', 'हा एक चमत्कारी उपाय आहे.'],
  ['mr weight', 'नियमित सेवनाने वजन कमी होते.'],
  ['cosmetic acne', 'Natural Anti-Acne Deep Pore Face Wash.'],
  ['cosmetic hair', 'Ayurvedic Hair Growth & Anti-Dandruff Oil.'],
  ['cosmetic thinning', '2-in-1 Anti-Hair Thinning Shampoo.'],
  ['cosmetic whitening', 'Bridal Whitening & Brightening Cream.'],
];
const mustPass = [
  ['en nutrient claim', 'Iron contributes to normal formation of red blood cells.'],
  ['en disclaimer', 'This product is not intended to diagnose, treat, cure or prevent any disease.'],
  ['hi protein', 'स्पिरुलिना में 62.39% प्रोटीन होता है।'],
  ['hi disclaimer', 'यह दवा नहीं है।'],
  ['mr protein', 'स्पिरुलिनामध्ये 62.39% प्रथिने असतात.'],
  ['mr disclaimer', 'हे औषध नाही.'],
  ['cosmetic handle link', '<a href="/product/sujata-bridal-whitening-cream">Bridal Radiance Cream</a>'],
  ['cosmetic plain', 'A pH-balanced, sulphate-free daily cleanser with aloe vera.'],
];

let failed = 0;
for (const [name, text] of mustFlag) {
  const v = scanSource(page('seed.astro'), body(text));
  if (!v.length) { failed++; console.log(`FAIL (not flagged)  ${name}: ${text}`); } else console.log(`ok   flagged [${v[0].rule}]  ${name}`);
}
for (const [name, text] of mustPass) {
  const v = scanSource(page('seed.astro'), body(text));
  if (v.length) { failed++; console.log(`FAIL (false flag [${v[0].rule}])  ${name}: ${text}`); } else console.log(`ok   passed  ${name}`);
}
for (const [route, expect] of [
  ['spirulina-for-weight-loss.astro', true], ['sea-buckthorn-for-fatty-liver-and-diabetes.astro', true],
  ['secure-checkout.astro', false], ['how-to-take-spirulina.astro', false],
]) {
  const hit = scanRoute(page(route), root).length > 0;
  if (hit !== expect) { failed++; console.log(`FAIL route ${route}: expected ${expect ? 'blocked' : 'allowed'}`); } else console.log(`ok   route ${route} ${hit ? 'blocked' : 'allowed'}`);
}
console.log(failed ? `\n${failed} failure(s)` : '\nAll compliance-guard checks passed.');
process.exit(failed ? 1 : 0);
