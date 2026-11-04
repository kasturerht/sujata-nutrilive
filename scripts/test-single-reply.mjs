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

async function testPostReply() {
  const commentId = '122224478870447084_1846100486842328';
  const replyMessage = `नमस्कार सर! 🙏
हो, नक्कीच! स्पिरुलिना हे १००% नैसर्गिक वनस्पतीजन्य सुपरफूड आहे. तुमचे नेहमीचे घरचे जेवण (भाजी-भाकरी) नेहमीप्रमाणेच चालू ठेवायचे आहे. जेवणानंतर किंवा सकाळी १-१ कॅप्सूल कोमट पाण्यासोबत घ्यायची आहे. ✨

खास ऑफर आणि सविस्तर माहितीसाठी लिंक:
👉 https://www.sujatanutrilive.com/product/sujata-spirulina-capsules
(मदतीसाठी थेट WhatsApp: 9834783503)`;

  console.log(`Posting reply to Facebook comment ${commentId}...`);
  const url = `https://graph.facebook.com/v21.0/${commentId}/comments`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: replyMessage,
      access_token: pageToken
    })
  });

  const data = await res.json();
  console.log('Result:', data);
}

testPostReply().catch(console.error);
