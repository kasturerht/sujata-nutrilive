import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        let val = trimmed.substring(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[trimmed.substring(0, idx).trim()] = val;
      }
    }
  }
}
loadEnv();

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

console.log(`Telegram Bot Token: ${botToken ? 'Loaded (len: ' + botToken.length + ')' : 'MISSING'}`);
console.log(`Telegram Chat ID: ${chatId || 'MISSING'}`);

if (!botToken || !chatId) {
  console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env');
  process.exit(1);
}

const filesToSend = [
  {
    filePath: path.join(rootDir, '.env'),
    fileName: '.env',
    caption: '🔐 Sujata Nutrilive: Updated .env configuration file (with Amazon SP-API, Shopify Admin API, Analytics & Support tokens).'
  },
  {
    filePath: path.join(rootDir, 'scripts', 'sujata-nutrilive-seo-7e48e83a62a6.json'),
    fileName: 'sujata-nutrilive-seo-7e48e83a62a6.json',
    caption: '🔑 Sujata Nutrilive: Google Cloud SEO & Search Console Service Account JSON credentials.'
  }
];

async function sendDocument(fileInfo) {
  const { filePath, fileName, caption } = fileInfo;
  if (!fs.existsSync(filePath)) {
    console.error(`File does not exist: ${filePath}`);
    return false;
  }

  console.log(`\nSending ${fileName} to Telegram Chat ID ${chatId}...`);
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: 'application/octet-stream' });

  const formData = new FormData();
  formData.append('chat_id', chatId);
  formData.append('document', blob, fileName);
  if (caption) {
    formData.append('caption', caption);
  }

  const url = `https://api.telegram.org/bot${botToken}/sendDocument`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.ok) {
      console.log(`✅ Successfully sent ${fileName}! Message ID: ${data.result?.message_id}`);
      return true;
    } else {
      console.error(`❌ Failed to send ${fileName}:`, JSON.stringify(data, null, 2));
      return false;
    }
  } catch (err) {
    console.error(`Fetch error sending ${fileName}:`, err.message);
    return false;
  }
}

async function main() {
  for (const f of filesToSend) {
    await sendDocument(f);
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log('\n🎉 Finished dispatching all requested files to Telegram!');
}

main();
