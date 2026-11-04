import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scripts/verified_october_telecaller_orders.json', 'utf8'));

console.log('================================================================');
console.log('🏆 SUJATA NUTRILIVE - OCTOBER 2026 WHATSAPP DISPATCH ORDERS 🏆');
console.log('================================================================\n');

let grandTotalOrders = 0;
let grandTotalValue = 0;

for (const [key, caller] of Object.entries(data)) {
  if (key === 'Yash (Admin/Direct)') continue;

  if (key === 'Manjushree Kasture') {
    const directCount = caller.directOrders.length;
    const directVal = caller.directOrders.reduce((sum, o) => sum + o.amt, 0);
    const webCount = caller.webOrders.length;
    const webVal = caller.webOrders.reduce((sum, o) => sum + o.amt, 0);
    const totalCount = directCount + webCount;
    const totalVal = directVal + webVal;

    grandTotalOrders += totalCount;
    grandTotalValue += totalVal;

    console.log(`👤 ${caller.name} (Phone: ${caller.phone}):`);
    console.log(`   • Total Orders in WhatsApp Group: ${totalCount} orders | Total Value: ₹${totalVal.toLocaleString('en-IN')}`);
    console.log(`     - Direct Calling Orders: ${directCount} orders | ₹${directVal.toLocaleString('en-IN')}`);
    console.log(`     - Forwarded Website Orders: ${webCount} orders | ₹${webVal.toLocaleString('en-IN')}`);

    const zeroes = [...caller.directOrders, ...caller.webOrders].filter(o => o.amt === 0);
    if (zeroes.length > 0) console.log(`     ⚠️ WARNING: ${zeroes.length} orders with 0 amount!`);
    console.log('');
  } else {
    const count = caller.orders.length;
    const val = caller.orders.reduce((sum, o) => sum + o.amt, 0);
    grandTotalOrders += count;
    grandTotalValue += val;

    console.log(`👤 ${caller.name} (Phone: ${caller.phone}):`);
    console.log(`   • Total Orders: ${count} orders | Total Value: ₹${val.toLocaleString('en-IN')}`);

    const zeroes = caller.orders.filter(o => o.amt === 0);
    if (zeroes.length > 0) console.log(`     ⚠️ WARNING: ${zeroes.length} orders with 0 amount!`);
    console.log('');
  }
}

console.log('----------------------------------------------------------------');
console.log(`🔥 ALL TELECALLERS GRAND TOTAL (OCTOBER 2026):`);
console.log(`   • Total Orders: ${grandTotalOrders} orders`);
console.log(`   • Total Order Value: ₹${grandTotalValue.toLocaleString('en-IN')}`);
console.log('================================================================');
