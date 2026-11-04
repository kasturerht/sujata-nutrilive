import fs from 'fs';

const rawData = JSON.parse(fs.readFileSync('scripts/recent_alert_emails_dump.json', 'utf8'));

[1, 3, 5, 6, 9, 10, 11].forEach((idx) => {
  const item = rawData[idx];
  if (!item) return;

  console.log(`\n========================================================================`);
  console.log(`[#${idx + 1}] SUBJECT: ${item.subject} | DATE: ${item.date}`);
  console.log(`FROM: ${item.from}`);
  console.log(`========================================================================`);

  // Split headers and body
  const parts = item.raw.split(/\r?\n\r?\n/);
  const body = parts.slice(1).join('\n\n');

  // Decode quoted printable
  const decoded = body
    .replace(/=[\r\n]+/g, '')
    .replace(/=([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('--') && !l.startsWith('Content-'))
    .join('\n');

  console.log(decoded.slice(0, 1500));
});
