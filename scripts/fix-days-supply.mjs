import fs from 'fs';

const filePath = 'src/pages/product/[handle].astro';
let content = fs.readFileSync(filePath, 'utf8');

const target = `                    const numericPrice = parseFloat(vPrice) || 0;
                    const countMatch = (v.title || '').match(/(\\d+)\\s*(Tablets?|Capsules?|Pouch|Bar|ml|g)?/i);
                    const count = countMatch ? parseInt(countMatch[1]) : 0;
                    const isTabletOrCap = /tablet|capsule/i.test(v.title || '') || /tablet|capsule/i.test(productTitle || '');
                    const dailyServing = isTabletOrCap ? 2 : 1;
                    const daysSupply = (count > 0 && isTabletOrCap) ? Math.round(count / dailyServing) : 0;
                    const perDayCost = (daysSupply > 0 && numericPrice > 0) ? (numericPrice / daysSupply).toFixed(2) : null;
                    const isBestValue = /120|180/i.test(v.title || '');`;

const replacement = `                    const numericPrice = parseFloat(vPrice) || 0;
                    
                    // 🌟 Accurately resolve Month-based protocols vs Capsule counts
                    const monthMatch = (v.title || '').match(/(\\d+)\\s*[- ]?Months?/i);
                    let daysSupply = 0;
                    if (monthMatch) {
                      daysSupply = parseInt(monthMatch[1]) * 30;
                    } else {
                      const countMatch = (v.title || '').match(/(\\d+)\\s*(Tablets?|Capsules?|Pouch|Bar|ml|g)?/i);
                      const count = countMatch ? parseInt(countMatch[1]) : 0;
                      const isTabletOrCap = /tablet|capsule/i.test(v.title || '') || /tablet|capsule/i.test(productTitle || '');
                      const dailyServing = isTabletOrCap ? 2 : 1;
                      daysSupply = (count > 0 && isTabletOrCap) ? Math.round(count / dailyServing) : 0;
                    }
                    const perDayCost = (daysSupply > 0 && numericPrice > 0) ? Math.round(numericPrice / daysSupply) : null;
                    const isBestValue = /120|180|3-month|mega/i.test(v.title || '');`;

const normContent = content.replace(/\r\n/g, '\n');
const normTarget = target.replace(/\r\n/g, '\n');

if (normContent.includes(normTarget)) {
  const newContent = normContent.replace(normTarget, replacement);
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('✅ Successfully patched month-based daysSupply calculation in [handle].astro!');
} else {
  console.error('❌ Target string not found in [handle].astro');
}
