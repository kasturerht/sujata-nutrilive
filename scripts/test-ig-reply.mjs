import fs from 'fs';
import path from 'path';

const env = {};
if (fs.existsSync('.env')) {
  fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      env[trimmed.slice(0, idx).trim()] = val;
    }
  });
}

const pageToken = env.META_PAGE_ACCESS_TOKEN;

async function testInstagramReply() {
  const commentId = '18175144648428074'; // smita.sonarkar.54 'Pp'
  const replyMessage = `@smita.sonarkar.54 नमस्कार! 🙏 सुजाता नॅचरल स्पिरुलिनाचा दररोजचा खर्च फक्त ₹१८ येतो! खास चालू सवलत ऑफर पाहण्यासाठी आणि ऑर्डर करण्यासाठी आमच्या बायोमधील (Bio) अधिकृत लिंकवर क्लिक करा किंवा WhatsApp करा: 9834783503 ✨`;

  console.log(`Posting reply to Instagram comment ${commentId}...`);
  const url = `https://graph.facebook.com/v21.0/${commentId}/replies`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: replyMessage,
      access_token: pageToken
    })
  });

  const data = await res.json();
  console.log('IG Result:', data);
}

testInstagramReply().catch(console.error);
