import fs from 'fs';
import { parseExactOrder } from './verify_each_telecaller_order.mjs';

const data = JSON.parse(fs.readFileSync('scripts/telecallers_all_messages_october.json', 'utf8'));

for (const [name, msgs] of Object.entries(data)) {
  console.log(`\n================================================================`);
  console.log(`TELECALLER: ${name} (Total Messages: ${msgs.length})`);
  console.log(`================================================================`);

  const orders = [];
  const nonOrders = [];

  for (const m of msgs) {
    const res = parseExactOrder(m.text);
    if (res && res.isOrder) {
      orders.push({
        idx: m.idx,
        date: m.date,
        time: m.time,
        ...res
      });
    } else {
      nonOrders.push({
        idx: m.idx,
        date: m.date,
        time: m.time,
        text: m.text.replace(/\r?\n/g, ' ')
      });
    }
  }

  console.log(`Total Orders Parsed: ${orders.length}`);
  console.log(`Non-Orders / Chatter: ${nonOrders.length}`);

  let sum = 0;
  for (const o of orders) {
    sum += o.amount;
    const flag = o.amount === 0 ? '❌ ZERO AMOUNT' : (o.isWeb ? '🌐 WEB ORDER' : '✅');
    console.log(`  [#${o.idx}] ${o.date} | ₹${o.amount} | ${o.customer} | ${o.phone} | ${flag}`);
  }

  console.log(`\n>>> TOTAL VALUE FOR ${name}: ₹${sum.toLocaleString('en-IN')}`);

  if (nonOrders.length > 0) {
    console.log(`\n--- NON-ORDERS FOR ${name} (Reviewing chatter to ensure no false negative) ---`);
    for (const no of nonOrders) {
      if (no.text.length > 30) {
        console.log(`  [#${no.idx}] ${no.date} ${no.time}: ${no.text.substring(0, 90)}...`);
      }
    }
  }
}
