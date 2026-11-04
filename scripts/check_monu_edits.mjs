import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scripts/telecallers_all_messages_october.json', 'utf8'));
const monu = data['Monu'];

console.log('=== VERIFYING MONU ORDERS ONE BY ONE ===');

// Let's print all parsed orders for Monu
import { parseExactOrder } from './verify_each_telecaller_order.mjs';

// We will inspect each message
for (let i = 0; i < monu.length; i++) {
  const m = monu[i];
  if (i + 1 === 107 || i + 1 === 108) {
    console.log(`[MSG ${i+1}] ${m.date}: ${m.text.replace(/\r?\n/g, ' ')}`);
  }
}
