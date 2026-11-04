import fs from 'fs';

const rawData = JSON.parse(fs.readFileSync('scripts/recent_alert_emails_dump.json', 'utf8'));

rawData.forEach((item, idx) => {
  console.log(`\n========================================================================`);
  console.log(`[#${idx + 1}] SUBJECT: ${item.subject} | DATE: ${item.date}`);
  console.log(`========================================================================`);

  // Find base64 blocks in raw
  const b64Matches = item.raw.match(/Content-Transfer-Encoding:\s*base64[\s\S]*?\r?\n\r?\n([A-Za-z0-9+/=\r\n]+)/i);
  if (b64Matches && b64Matches[1]) {
    try {
      const decoded = Buffer.from(b64Matches[1].replace(/\s+/g, ''), 'base64').toString('utf8');
      console.log(decoded.slice(0, 1500));
    } catch(e) {
      console.log('Error decoding base64:', e.message);
    }
  } else {
    // Quoted printable or plaintext
    console.log(item.raw.slice(item.raw.indexOf('\r\n\r\n')).slice(0, 1000));
  }
});
