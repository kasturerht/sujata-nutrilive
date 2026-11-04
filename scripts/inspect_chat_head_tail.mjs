import fs from 'fs';

const content = fs.readFileSync('scripts/whatsapp_dispatch/WhatsApp Chat with Daily orders dispatch .txt', 'utf8');
const lines = content.split(/\r?\n/);
console.log('Total lines:', lines.length);

console.log('\n--- FIRST 30 LINES ---');
console.log(lines.slice(0, 30).join('\n'));

console.log('\n--- LAST 50 LINES ---');
console.log(lines.slice(-50).join('\n'));
