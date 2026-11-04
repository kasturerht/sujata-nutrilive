// scripts/search-gokwik-mail.mjs
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

async function searchMail() {
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
        // Select All Mail
        socket.write('a002 SELECT "[Gmail]/All Mail"\r\n');
      } else if (step === 2 && buffer.includes('a002 OK')) {
        step = 3;
        buffer = '';
        // Search for SUBJECT or TEXT with gokwik
        socket.write('a003 SEARCH TEXT "gokwik"\r\n');
      } else if (step === 3 && buffer.includes('a003 OK')) {
        const idsMatch = buffer.match(/\*\s+SEARCH\s+([\d\s]+)/);
        const ids = idsMatch ? idsMatch[1].trim().split(/\s+/).filter(Boolean) : [];
        console.log(`Found ${ids.length} emails matching "gokwik":`, ids);

        if (ids.length === 0) {
          // Try searching for "activated"
          step = 4;
          buffer = '';
          socket.write('a004 SEARCH TEXT "activated"\r\n');
        } else {
          step = 5;
          const targetIds = ids.slice(-3).join(',');
          buffer = '';
          socket.write(`a005 FETCH ${targetIds} (BODY[HEADER.FIELDS (DATE FROM TO SUBJECT)] BODY[TEXT])\r\n`);
        }
      } else if (step === 4 && buffer.includes('a004 OK')) {
        const idsMatch = buffer.match(/\*\s+SEARCH\s+([\d\s]+)/);
        const ids = idsMatch ? idsMatch[1].trim().split(/\s+/).filter(Boolean) : [];
        console.log(`Found ${ids.length} emails matching "activated":`, ids.slice(-5));
        if (ids.length > 0) {
          step = 5;
          const targetIds = ids.slice(-3).join(',');
          buffer = '';
          socket.write(`a005 FETCH ${targetIds} (BODY[HEADER.FIELDS (DATE FROM TO SUBJECT)] BODY[TEXT])\r\n`);
        } else {
          socket.write('a006 LOGOUT\r\n');
          socket.end();
          resolve("No emails found");
        }
      } else if (step === 5 && buffer.includes('a005 OK')) {
        socket.write('a006 LOGOUT\r\n');
        socket.end();
        resolve(buffer);
      }
    });

    socket.on('error', reject);
  });
}

async function run() {
  const result = await searchMail();
  fs.writeFileSync('scripts/gokwik_search_result.txt', result);
  console.log("Result saved to scripts/gokwik_search_result.txt. Length:", result.length);
}

run().catch(console.error);
