// scripts/fetch-full-alert-body.mjs
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

function decodeQuotedPrintable(str) {
  return str.replace(/=[\r\n]+/g, '').replace(/=([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

async function fetchBodies() {
  const targetIds = [2571, 2566, 2554, 2535, 2515, 2514, 2513, 2512];

  return new Promise((resolve, reject) => {
    const socket = tls.connect(993, 'imap.gmail.com', { rejectUnauthorized: false }, () => {});
    let buffer = '';
    let step = 0;
    const emailTexts = {};

    socket.setEncoding('utf8');

    function sendCmd(cmd) {
      buffer = '';
      socket.write(cmd + '\r\n');
    }

    socket.on('data', (chunk) => {
      buffer += chunk;

      if (step === 0 && buffer.includes('* OK')) {
        step = 1;
        sendCmd(`a01 LOGIN ${user} ${pass}`);
      } else if (step === 1 && buffer.includes('a01 OK')) {
        step = 2;
        sendCmd('a02 SELECT INBOX');
      } else if (step === 2 && buffer.includes('a02 OK')) {
        step = 3;
        sendNextFetch();
      } else if (step >= 3 && step < 3 + targetIds.length) {
        const currentTag = `f${step - 3}`;
        if (buffer.includes(`${currentTag} OK`)) {
          const currentId = targetIds[step - 3];
          emailTexts[currentId] = buffer;
          step++;
          if (step < 3 + targetIds.length) {
            sendNextFetch();
          } else {
            sendCmd('a99 LOGOUT');
            socket.end();
            resolve(emailTexts);
          }
        }
      }
    });

    function sendNextFetch() {
      const idx = step - 3;
      const id = targetIds[idx];
      sendCmd(`f${idx} FETCH ${id} (BODY.PEEK[])`);
    }

    socket.on('error', reject);
  });
}

fetchBodies().then(data => {
  console.log('\n========================================================================');
  console.log('🔍 FULL EXTRACTION OF ALL GOOGLE SEARCH CONSOLE & MERCHANT ALERTS');
  console.log('========================================================================\n');

  for (const [id, raw] of Object.entries(data)) {
    const subject = (raw.match(/^Subject:\s*(.*)$/mi) || [])[1] || 'No Subject';
    const date = (raw.match(/^Date:\s*(.*)$/mi) || [])[1] || '';
    const from = (raw.match(/^From:\s*(.*)$/mi) || [])[1] || '';

    const decoded = decodeQuotedPrintable(raw);
    const cleanText = decoded
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '\n')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('--') && !l.startsWith('Content-') && !l.startsWith('ARC-') && !l.startsWith('DKIM-') && !l.startsWith('Received:') && !l.startsWith('X-') && !l.startsWith('MIME-'))
      .join('\n');

    console.log(`------------------------------------------------------------------------`);
    console.log(`📩 [ID ${id}] DATE: ${date}`);
    console.log(`FROM: ${from}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`CONTENT SUMMARY:\n`);

    // Look for lines after "Search Console has found" or "Top issues"
    const lines = cleanText.split('\n');
    let record = false;
    let snippet = [];
    for (const l of lines) {
      if (/Search Console has found|Search Console has detected|New reasons prevent|Top issues|Merchant listings|Datasets|Videos|Review snippets|Product snippets/i.test(l)) {
        record = true;
      }
      if (record) {
        snippet.push(l);
        if (snippet.length > 25) break;
      }
    }

    if (snippet.length > 0) {
      console.log(snippet.join('\n'));
    } else {
      console.log(cleanText.slice(0, 800));
    }
    console.log('\n');
  }
}).catch(console.error);
