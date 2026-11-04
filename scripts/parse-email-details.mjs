import fs from 'fs';

const rawData = JSON.parse(fs.readFileSync('scripts/recent_alert_emails_dump.json', 'utf8'));

rawData.forEach((item, i) => {
  console.log(`\n======================================================`);
  console.log(`EMAIL [${i + 1}]: ${item.subject} | DATE: ${item.date}`);
  console.log(`FROM: ${item.from}`);
  console.log(`======================================================`);

  // Simple decoding of quoted-printable / html
  let text = item.raw;
  // find boundary or html content
  const htmlMatch = text.match(/<body[\s\S]*?<\/body>/i) || text.match(/<html>[\s\S]*?<\/html>/i);
  let cleanText = '';
  if (htmlMatch) {
    cleanText = htmlMatch[0]
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/=[\r\n]+/g, '')
      .replace(/=3D/g, '=')
      .replace(/\s+/g, ' ')
      .trim();
  } else {
    cleanText = text.slice(0, 1500);
  }

  console.log(cleanText.slice(0, 1200));
});
