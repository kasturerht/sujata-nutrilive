import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scripts/telecallers_all_messages_october.json', 'utf8'));

for (const [name, msgs] of Object.entries(data)) {
  console.log(`\n================ ${name} ================`);
  for (let i = 0; i < msgs.length; i++) {
    const text = msgs[i].text.replace(/(\d),(\d{3})/g, '$1$2');
    // find all occurrences of 3-5 digit numbers
    const matches = text.match(/\b\d{3,5}\b/g) || [];
    // print if text has Prepaid or COD
    if (/cod|prepaid|advance|paid/i.test(text) && /\b\d{10}\b|\b\d{5}\s*\d{5}\b/.test(text)) {
      // Check phone number vs numbers matched
      console.log(`[#${i+1}] ${msgs[i].dateStr || msgs[i].date}:`);
      console.log(text.replace(/\r?\n/g, ' \\n '));
      console.log('---');
    }
  }
}
