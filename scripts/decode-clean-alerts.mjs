import fs from 'fs';

const rawData = JSON.parse(fs.readFileSync('scripts/recent_alert_emails_dump.json', 'utf8'));

rawData.forEach((item, idx) => {
  console.log(`\n========================================================================`);
  console.log(`[#${idx + 1}] SUBJECT: ${item.subject} | DATE: ${item.date}`);
  console.log(`FROM: ${item.from}`);
  console.log(`========================================================================`);

  // Extract all base64 chunks
  const lines = item.raw.split('\n');
  let currentB64 = '';
  let inB64 = false;
  let decodedText = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('Content-Transfer-Encoding: base64')) {
      inB64 = true;
      currentB64 = '';
      continue;
    }
    if (inB64) {
      if (trimmed.startsWith('--') || trimmed.startsWith('Content-Type:')) {
        inB64 = false;
        try {
          const dec = Buffer.from(currentB64, 'base64').toString('utf8');
          // If html or text
          const clean = dec.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
          if (clean.length > decodedText.length) decodedText = clean;
        } catch(e) {}
      } else {
        currentB64 += trimmed;
      }
    }
  }

  // If decodedText found
  if (decodedText) {
    console.log(decodedText.slice(0, 1500));
  } else {
    // try direct regex
    const m = item.raw.match(/([A-Za-z0-9+/=]{100,})/g);
    if (m) {
      m.forEach(chunk => {
        try {
          const d = Buffer.from(chunk, 'base64').toString('utf8');
          if (d.includes('Google') || d.includes('Shopify') || d.includes('Search Console') || d.includes('Merchant')) {
            console.log(d.slice(0, 800));
          }
        } catch(e) {}
      });
    }
  }
});
