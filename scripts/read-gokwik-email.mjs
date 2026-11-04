// scripts/read-gokwik-email.mjs
import tls from 'tls';
import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.resolve('.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        env[trimmed.slice(0, idx).trim()] = val;
      }
    });
  }
  return env;
}

const env = loadEnv();
const user = env.GMAIL_USER || 'sujatanutrilive@gmail.com';
const pass = (env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

async function fetchLatestGokwikEmail() {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(993, 'imap.gmail.com', { rejectUnauthorized: false }, () => {});
    let buffer = '';
    let step = 0;

    socket.setEncoding('utf8');

    socket.on('data', (chunk) => {
      buffer += chunk;

      if (step === 0 && buffer.includes('* OK')) {
        step = 1;
        buffer = '';
        socket.write(`a001 LOGIN ${user} ${pass}\r\n`);
      } else if (step === 1 && buffer.includes('a001 OK')) {
        step = 2;
        buffer = '';
        socket.write('a002 SELECT INBOX\r\n');
      } else if (step === 2 && buffer.includes('a002 OK')) {
        const countMatch = buffer.match(/\*\s+(\d+)\s+EXISTS/);
        const total = countMatch ? parseInt(countMatch[1]) : 0;
        step = 3;
        buffer = '';
        const start = Math.max(1, total - 10 + 1);
        // Fetch full body of the last 10 emails
        socket.write(`a003 FETCH ${start}:${total} (BODY[HEADER.FIELDS (DATE FROM SUBJECT)] BODY[TEXT])\r\n`);
      } else if (step === 3 && buffer.includes('a003 OK')) {
        socket.write('a004 LOGOUT\r\n');
        socket.end();
        resolve(buffer);
      }
    });

    socket.on('error', reject);
  });
}

async function run() {
  console.log("Fetching latest emails from inbox...");
  const raw = await fetchLatestGokwikEmail();
  fs.writeFileSync('scripts/gokwik_email_raw.txt', raw);

  // Search for Gokwik mentions
  const lines = raw.split(/\r?\n/);
  console.log("Total raw length:", raw.length);
  
  // Extract emails
  const items = raw.split(/\*\s+\d+\s+FETCH/);
  console.log("Total email items parsed:", items.length);
  
  let gokwikFound = false;
  items.forEach((item, idx) => {
    if (item.toLowerCase().includes('gokwik') || item.toLowerCase().includes('kwik') || item.toLowerCase().includes('activated') || item.toLowerCase().includes('account')) {
      console.log(`\n========================================`);
      console.log(`MATCH FOUND IN ITEM #${idx}:`);
      console.log(`========================================`);
      console.log(item.slice(0, 3000));
      gokwikFound = true;
    }
  });

  if (!gokwikFound) {
    console.log("No explicit Gokwik keyword found in last 10 emails, showing headers of last 5 items:");
    items.slice(-5).forEach(it => {
      const subj = it.match(/Subject:\s*([^\r\n]+)/i)?.[1];
      const from = it.match(/From:\s*([^\r\n]+)/i)?.[1];
      const date = it.match(/Date:\s*([^\r\n]+)/i)?.[1];
      console.log(`- Date: ${date} | From: ${from} | Subj: ${subj}`);
    });
  }
}

run().catch(console.error);
