import fs from 'fs';

const leads = JSON.parse(fs.readFileSync('scripts/telecaller_leads_dump.json', 'utf8'));
const orders = JSON.parse(fs.readFileSync('scripts/telecaller_orders_dump.json', 'utf8'));
const meta = JSON.parse(fs.readFileSync('scripts/meta_telecaller_3day.json', 'utf8'));

console.log('=== SAMPLE LEAD FIELDS ===');
if (leads.length > 0) {
  console.log('Lead sample:', JSON.stringify(leads[0], null, 2));
}

console.log('\n=== SAMPLE ORDER FIELDS ===');
if (orders.length > 0) {
  console.log('Order sample:', JSON.stringify(orders[0], null, 2));
}

console.log('\n=== META 3-DAY RAW DATA ===');
console.log(JSON.stringify(meta, null, 2));
