// scripts/gmail-inbox-manager.mjs
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

export async function fetchRecentEmails(limit = 5) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(993, 'imap.gmail.com', { rejectUnauthorized: false }, () => {});
    let buffer = '';
    let step = 0;
    const emails = [];

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
        const start = Math.max(1, total - limit + 1);
        socket.write(`a003 FETCH ${start}:${total} (FLAGS BODY[HEADER.FIELDS (DATE FROM SUBJECT)])\r\n`);
      } else if (step === 3 && buffer.includes('a003 OK')) {
        socket.write('a004 LOGOUT\r\n');
        socket.end();

        // Parse headers
        const regex = /BODY\[HEADER\.FIELDS[^\]]*\]\s*\{(\d+)\}\r?\n([\s\S]*?)(?=\*\s+\d+\s+FETCH|a003 OK)/g;
        let match;
        while ((match = regex.exec(buffer)) !== null) {
          const headerText = match[2];
          const subject = (headerText.match(/^Subject:\s*(.*)$/mi) || [])[1] || 'No Subject';
          const from = (headerText.match(/^From:\s*(.*)$/mi) || [])[1] || 'Unknown';
          const date = (headerText.match(/^Date:\s*(.*)$/mi) || [])[1] || '';
          emails.push({ from: from.trim(), subject: subject.trim(), date: date.trim() });
        }
        resolve(emails.reverse());
      }
    });

    socket.on('error', reject);
  });
}

// If run directly
if (process.argv[1]?.endsWith('gmail-inbox-manager.mjs')) {
  fetchRecentEmails(5).then(list => {
    console.log('📬 LATEST 5 EMAILS IN SUJATA NUTRILIVE INBOX:');
    list.forEach((e, idx) => {
      console.log(`\n[${idx + 1}] Date: ${e.date}`);
      console.log(`    From: ${e.from}`);
      console.log(`    Subject: ${e.subject}`);
    });
  }).catch(console.error);
}
