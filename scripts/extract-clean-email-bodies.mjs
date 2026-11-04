import fs from 'fs';

const rawData = JSON.parse(fs.readFileSync('scripts/recent_alert_emails_dump.json', 'utf8'));

function decodeQuotedPrintable(str) {
  return str.replace(/=[\r\n]+/g, '').replace(/=([0-9A-F]{2})/gi, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
}

rawData.forEach((item, i) => {
  console.log(`\n========================================================================`);
  console.log(`[#${i + 1}] SUBJECT: ${item.subject} | DATE: ${item.date}`);
  console.log(`========================================================================`);

  const decoded = decodeQuotedPrintable(item.raw);
  const plainTextMatches = decoded.match(/Content-Type:\s*text\/(?:plain|html)[\s\S]*?\r?\n\r?\n([\s\S]*?)(?=\r?\n--|$)/i);
  let content = plainTextMatches ? plainTextMatches[1] : decoded;

  // Clean html tags
  const clean = content
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

  // Look for issue details specifically
  const issueMatch = clean.match(/(Search Console has found|issues? detected|prevent pages from being indexed|following issues?|Critical|Error|Warning|Top issues)[\s\S]{0,600}/i);
  if (issueMatch) {
    console.log('📌 ISSUE EXCERPT:');
    console.log(issueMatch[0]);
  } else {
    console.log(clean.slice(0, 500));
  }
});
