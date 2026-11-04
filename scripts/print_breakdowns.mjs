import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scripts/website_ad_breakdowns.json', 'utf8'));

console.log("=== 1. PLATFORM & PLACEMENT BREAKDOWN ===");
(data.placement || []).forEach(p => {
  const spend = parseFloat(p.spend || '0').toFixed(2);
  const clicks = p.inline_link_clicks || 0;
  const pur = (p.actions || []).find(a => a.action_type === 'purchase')?.value || 0;
  const purVal = (p.action_values || []).find(a => a.action_type === 'purchase')?.value || 0;
  console.log(`${p.publisher_platform.padEnd(10)} | ${p.platform_position.padEnd(15)} | Spend: ₹${spend.padStart(7)} | Imp: ${String(p.impressions).padStart(5)} | Clicks: ${String(clicks).padStart(3)} | Purchases: ${pur} (₹${purVal})`);
});

console.log("\n=== 2. AGE & GENDER BREAKDOWN ===");
(data.demographics || []).forEach(d => {
  const spend = parseFloat(d.spend || '0').toFixed(2);
  const clicks = d.inline_link_clicks || 0;
  const pur = (d.actions || []).find(a => a.action_type === 'purchase')?.value || 0;
  const purVal = (d.action_values || []).find(a => a.action_type === 'purchase')?.value || 0;
  console.log(`${d.gender.padEnd(6)} | ${d.age.padEnd(6)} | Spend: ₹${spend.padStart(7)} | Imp: ${String(d.impressions).padStart(5)} | Clicks: ${String(clicks).padStart(3)} | Purchases: ${pur} (₹${purVal})`);
});
