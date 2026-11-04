import fs from 'fs';

const filePath = 'src/pages/api/webhooks/shopify-order.ts';
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(
  "const gmailPass = (typeof process !== 'undefined' && process.env?.GMAIL_APP_PASSWORD) || '';",
  "const gmailPass = (typeof process !== 'undefined' && process.env?.GMAIL_APP_PASSWORD) || 'ysla kiuk wjju kbct';"
);

fs.writeFileSync(filePath, code, 'utf8');
console.log('✅ Fallback added successfully');
