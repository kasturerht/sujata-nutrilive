import fs from 'fs';

const ordersByTelecaller = JSON.parse(fs.readFileSync('scripts/parsed_telecaller_orders.json', 'utf8'));

console.log('=== INSPECTING "OTHERS" ORDERS ===');
ordersByTelecaller['Others'].forEach((o, i) => {
  console.log(`\n--- [Other ${i + 1}] ${o.date} ${o.time} by ${o.sender} | Amt: ₹${o.amount} ---`);
  console.log(o.text);
});

console.log('\n=== INSPECTING ZERO-AMOUNT ORDERS FOR MANJUSHREE ===');
ordersByTelecaller['Manjushree Kasture'].filter(o => o.amount === 0).forEach((o, i) => {
  console.log(`\n--- [Manju Zero ${i + 1}] ${o.date} ${o.time} ---`);
  console.log(o.text);
});

console.log('\n=== INSPECTING ZERO-AMOUNT ORDERS FOR MONU ===');
ordersByTelecaller['Monu'].filter(o => o.amount === 0).forEach((o, i) => {
  console.log(`\n--- [Monu Zero ${i + 1}] ${o.date} ${o.time} ---`);
  console.log(o.text);
});
