// scripts/find-tablet-mentions.mjs
import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scripts/amazon_hl_audit_full.json', 'utf8'));

console.log('====================================================');
console.log('🔍 FORENSIC AUDIT: EVERY OCCURRENCE OF "TABLET"');
console.log('====================================================\n');

for (const [sku, item] of Object.entries(data)) {
  console.log(`\n📦 Amazon SKU: ${sku}`);
  const attrs = item.attributes || {};
  let found = 0;
  for (const [attrName, attrVal] of Object.entries(attrs)) {
    const str = JSON.stringify(attrVal);
    if (/tablet/i.test(str)) {
      found++;
      console.log(`   🔴 Attribute: [${attrName}]`);
      console.log(`      Content: ${str.substring(0, 250)}`);
    }
  }
  if (found === 0) {
    console.log('   ✅ No tablet references found!');
  }
}
