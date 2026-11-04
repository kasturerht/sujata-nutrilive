// scripts/post-staggered-replies.mjs
import fs from 'fs';
import path from 'path';

// 1. Load .env
const env = {};
if (fs.existsSync('.env')) {
  fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[trimmed.slice(0, idx).trim()] = val;
    }
  });
}

const pageToken = env.META_PAGE_ACCESS_TOKEN;

// Helper function for random sleep (in ms)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const getRandomGap = (minSec, maxSec) => Math.floor(Math.random() * (maxSec - minSec + 1) + minSec) * 1000;

const targets = [
  {
    name: "Comment 1 (पता कुठे आहे)",
    commentId: "122224478870447084_2318029079094001",
    message: `नमस्कार सर! 🙏
सुजाता न्यूट्रिलाइव्हचे अधिकृत ऑफिस पत्ता खालीलप्रमाणे आहे:
🏢 प्लॉट नं. १२५, साई निवास, धनदाई कॉलनी, खुटवड नगर, कामटवाडे, नाशिक, महाराष्ट्र - ४२२००८

आमचे १००% शुद्ध स्पिरुलिना प्रॉडक्ट्स संपूर्ण भारतात मोफत होम डिलिव्हरीसह (Free Delivery & COD) उपलब्ध आहेत. अधिक माहिती किंवा ऑर्डरसाठी संपर्क: 9922500344 / 9272471529 किंवा आमच्या वेबसाइटला भेट द्या: 👉 www.sujatanutrilive.com`
  },
  {
    name: "Comment 2 (Address सांगा nasik...)",
    commentId: "122224733744447084_2221546118423248",
    message: `नमस्कार सर! आमचा नाशिकमधील पत्ता:
🏢 प्लॉट नं. १२५, साई निवास, धनदाई कॉलनी, खुटवड नगर, कामटवाडे, नाशिक (महाराष्ट्र) - ४२२००८

थेट घरपोच फ्रेश डिलिव्हरी मागवण्यासाठी आपण आमच्या अधिकृत वेबसाइटला भेट देऊ शकता:
👉 www.sujatanutrilive.com
(मदतीसाठी कॉल/व्हॉट्सॲप: 9922500344)`
  },
  {
    name: "Comment 3 (With price please & Gram)",
    commentId: "122223745766447084_1755563085501591",
    message: `Hello! 🙏
Sujata Spirulina is available in various premium formulations (Pure Cold-Pressed Capsules, 100% Vegan Tablets, Organic Powder, and Synergistic Healthy Life Combos).

To explore all product options, exact gram weights, certified lab reports, and special ongoing offers, we kindly request you to visit our official website:
👉 www.sujatanutrilive.com

(For direct assistance, you can also connect with our team on WhatsApp: +91 99225 00344).`
  }
];

async function postRepliesStaggered() {
  console.log(`Starting staggered reply posting for ${targets.length} comments...\n`);

  for (let i = 0; i < targets.length; i++) {
    const item = targets[i];
    console.log(`[${i + 1}/${targets.length}] Posting reply to: ${item.name} (${item.commentId})...`);

    try {
      const url = `https://graph.facebook.com/v21.0/${item.commentId}/comments`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: item.message,
          access_token: pageToken
        })
      });

      const data = await res.json();

      if (data.id) {
        console.log(`✅ Success! Posted reply ID: ${data.id}`);
      } else {
        console.error(`❌ Meta API Error:`, data);
      }
    } catch (err) {
      console.error(`❌ Network error posting reply:`, err.message);
    }

    // If there is a next comment, wait random gap between 20 to 35 seconds
    if (i < targets.length - 1) {
      const gapMs = getRandomGap(22, 36);
      console.log(`⏳ Waiting ${gapMs / 1000} seconds before next reply to look natural...\n`);
      await sleep(gapMs);
    }
  }

  console.log(`\n🎉 All replies completed successfully!`);
}

postRepliesStaggered().catch(console.error);
