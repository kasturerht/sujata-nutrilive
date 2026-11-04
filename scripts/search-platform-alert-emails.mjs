// scripts/search-platform-alert-emails.mjs
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

function runImapCommand(socket, tag, cmd) {
  return new Promise((resolve, reject) => {
    let buffer = '';
    const onData = (chunk) => {
      buffer += chunk;
      if (buffer.includes(`${tag} OK`)) {
        socket.removeListener('data', onData);
        resolve({ ok: true, buffer });
      } else if (buffer.includes(`${tag} NO`) || buffer.includes(`${tag} BAD`)) {
        socket.removeListener('data', onData);
        resolve({ ok: false, buffer });
      }
    };
    socket.on('data', onData);
    socket.write(`${tag} ${cmd}\r\n`);
  });
}

async function searchAndFetchAlerts() {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(993, 'imap.gmail.com', { rejectUnauthorized: false }, async () => {
      try {
        // Wait for welcome
        await new Promise((res) => socket.once('data', res));

        // 1. Login
        let res = await runImapCommand(socket, 'a01', `LOGIN ${user} ${pass}`);
        if (!res.ok) throw new Error('Login failed: ' + res.buffer);

        // 2. Select Inbox
        res = await runImapCommand(socket, 'a02', 'SELECT INBOX');
        if (!res.ok) throw new Error('Select failed: ' + res.buffer);

        // 3. Search queries for GSC, Merchant, Shopify, Analytics
        const queries = [
          'FROM "google.com"',
          'FROM "shopify.com"',
          'SUBJECT "Search Console"',
          'SUBJECT "Merchant"',
          'SUBJECT "issue"',
          'SUBJECT "detected"'
        ];

        const allUids = new Set();
        for (let i = 0; i < queries.length; i++) {
          const sRes = await runImapCommand(socket, `s${i}`, `SEARCH ${queries[i]}`);
          const match = sRes.buffer.match(/\*\s+SEARCH\s+([\d\s]+)/);
          if (match && match[1]) {
            match[1].trim().split(/\s+/).forEach(num => {
              if (num && !isNaN(parseInt(num))) allUids.add(parseInt(num));
            });
          }
        }

        console.log(`Found ${allUids.size} candidate emails matching platforms/issues.`);
        const sortedIds = Array.from(allUids).sort((a, b) => b - a).slice(0, 20); // latest 20 emails

        const results = [];
        for (let j = 0; j < sortedIds.length; j++) {
          const id = sortedIds[j];
          const fRes = await runImapCommand(socket, `f${j}`, `FETCH ${id} (BODY.PEEK[])`);
          const raw = fRes.buffer;

          // Parse headers & body
          const subject = (raw.match(/^Subject:\s*(.*)$/mi) || [])[1] || 'No Subject';
          const from = (raw.match(/^From:\s*(.*)$/mi) || [])[1] || 'Unknown';
          const date = (raw.match(/^Date:\s*(.*)$/mi) || [])[1] || '';

          // Basic text snippet
          let snippet = raw.replace(/\r\n/g, '\n');
          // Filter only relevant emails
          const isRelevant = /Search Console|Merchant|Analytics|Shopify|issue|warning|detected|disapproved|alert|violation/i.test(subject + ' ' + from);
          if (isRelevant) {
            results.push({ id, from: from.trim(), subject: subject.trim(), date: date.trim(), raw: raw.slice(0, 5000) });
          }
        }

        await runImapCommand(socket, 'a99', 'LOGOUT');
        socket.end();
        resolve(results);
      } catch (err) {
        socket.destroy();
        reject(err);
      }
    });
  });
}

searchAndFetchAlerts().then(emails => {
  console.log(`\n======================================================`);
  console.log(`📋 FOUND ${emails.length} RELEVANT PLATFORM ALERT/ISSUE EMAILS:`);
  console.log(`======================================================\n`);

  emails.forEach((e, idx) => {
    console.log(`------------------------------------------------------`);
    console.log(`[#${idx + 1}] DATE: ${e.date}`);
    console.log(`FROM: ${e.from}`);
    console.log(`SUBJECT: ${e.subject}`);
    
    // Extract key parts of the body
    const bodyLines = e.raw.split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('Content-') && !l.startsWith('--') && !l.startsWith('Received:') && !l.startsWith('DKIM-') && !l.startsWith('ARC-') && !l.startsWith('X-') && !l.startsWith('MIME-'));
    
    const preview = bodyLines.slice(0, 30).join(' ').slice(0, 400);
    console.log(`BODY PREVIEW: ${preview}...`);
  });

  fs.writeFileSync('scripts/recent_alert_emails_dump.json', JSON.stringify(emails, null, 2));
}).catch(console.error);
