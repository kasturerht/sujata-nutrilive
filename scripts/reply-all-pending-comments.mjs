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

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function replyFacebookComment(commentId, message) {
  try {
    const url = `https://graph.facebook.com/v21.0/${commentId}/comments`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        access_token: pageToken
      })
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return { error: err.message };
  }
}

async function replyInstagramComment(commentId, message) {
  try {
    const url = `https://graph.facebook.com/v21.0/${commentId}/replies`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        access_token: pageToken
      })
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return { error: err.message };
  }
}

async function runBulkReplies() {
  console.log('=== STARTING AUTOMATED REPLIES TO ALL PENDING COMMENTS ===\n');

  // 1. RECENT ACTIVE ADS COMMENTS
  const adTasks = [
    {
      commentId: '122224478414447084_1048060548290119',
      original: 'किंमत भी बताया जाएं',
      message: `नमस्ते जी! 🙏
सुजाता नेचुरल स्पिरुलिना का दैनिक खर्च सिर्फ ₹18 आता है!
खास चालू डिस्काउंट ऑफर, NABL लैब टेस्ट रिपोर्ट देखने और घर बैठे आर्डर करने के लिए नीचे दिए गए लिंक पर क्लिक करें:
👉 https://www.sujatanutrilive.com/product/sujata-spirulina-capsules

(किसी भी सहायता के लिए सीधे WhatsApp करें: 9834783503)`
    },
    {
      commentId: '122215132118447084_1573525637793300',
      original: 'दोन्ही product ची किंमत सांगा',
      message: `नमस्कार! 🙏
स्पिरुलिना + सी-बकथॉर्न (Synergy Combo Pack):
या २ महिन्यांच्या कॉम्बोवर (१२० कॅप्सूल्स) सध्या खास सवलत सुरू आहे! 

आजची कॉम्बो ऑफर किंमत पाहण्यासाठी आणि घरपोच मागवण्यासाठी खालील लिंकवर क्लिक करा:
👉 https://www.sujatanutrilive.com/product/sujata-spirulina-sea-buckthorn-combo-pack

(थेट WhatsApp वर बुक करण्यासाठी: 9834783503)`
    },
    {
      commentId: '122224733744447084_3051458648545003',
      original: 'M/S. IMFA CARE GROUP B2B inquiry',
      message: `Greetings from Sujata Nutrilive Agrotech! 🌿
Thank you for your bulk supply and distribution inquiry. Please share your company profile and procurement details directly with our management team on WhatsApp at +91 9834783503 or email us at sujatanutrilive@gmail.com. Our B2B representative will get in touch with you promptly.`
    },
    {
      commentId: '122215132118447084_1628566995278340',
      original: 'Cost',
      message: `Hello! 🙏
Sujata Natural Spirulina costs just ₹18 per day!
To check today's special discount offer, NABL certified lab reports, and place your order directly:
👉 https://www.sujatanutrilive.com/product/sujata-spirulina-capsules
(For instant WhatsApp support: 9834783503)`
    },
    {
      commentId: '122215132118447084_1844279800063619',
      original: 'किमत',
      message: `नमस्कार! 🙏
सुजाता नॅचरल स्पिरुलिनाचा दररोजचा खर्च फक्त ₹१८ येतो!
खास चालू सवलत ऑफर आणि NABL लॅब टेस्ट रिपोर्ट पाहण्यासाठी खालील लिंकवर क्लिक करा:
👉 https://www.sujatanutrilive.com/product/sujata-spirulina-capsules
(ऑर्डर किंवा मदतीसाठी WhatsApp करा: 9834783503)`
    },
    {
      commentId: '122215132118447084_38563621959891742',
      original: 'Wonderful nice',
      message: `Thank you so much for your appreciation and trust in Sujata Nutrilive! 🌿 Stay healthy and energized! ✨`
    }
  ];

  console.log(`--- Replying to ${adTasks.length} Active Facebook Ad Comments ---`);
  for (const t of adTasks) {
    console.log(`Replying to [${t.commentId}] ("${t.original}")...`);
    const res = await replyFacebookComment(t.commentId, t.message);
    console.log('Result:', res);
    await delay(1500);
  }

  // 2. FACEBOOK ORGANIC COMMENTS
  console.log('\n--- Replying to Facebook Organic Comments ---');
  const fbCollabId = '122167826588447084_480026214876615';
  console.log(`Replying to Collab proposal [${fbCollabId}]...`);
  const fbRes = await replyFacebookComment(fbCollabId, `Hello! Thank you for reaching out. Please send your collaboration proposal and portfolio to our official email: sujatanutrilive@gmail.com or WhatsApp: 9834783503. Our team will review it. Best regards, Team Sujata Nutrilive 🌿`);
  console.log('Result:', fbRes);
  await delay(1500);

  // 3. INSTAGRAM ORGANIC COMMENTS
  console.log('\n--- Replying to Instagram Organic Comments ---');
  const igTasks = [
    {
      id: '18129491515709447',
      user: 'its___max___love__770',
      message: `@its___max___love__770 Hello! Thank you for reaching out. Please share your proposal directly via DM or email us at sujatanutrilive@gmail.com. Our team will review it. 🌿`
    },
    {
      id: '18069839318453572',
      user: 'apocalypse.317',
      message: `@apocalypse.317 Thank you for your support! Stay healthy and energized! 🔥🌿`
    },
    {
      id: '17906007042506048',
      user: 'ashishhhhhhsennn',
      message: `@ashishhhhhhsennn Thank you so much! 🙏🌿`
    },
    {
      id: '18038975252375147',
      user: 'jw2u377do',
      message: `@jw2u377do Hello! Yes, absolutely. For retail and health store distribution, please WhatsApp us at 9834783503 or DM us your store details. Our B2B team will connect with you! 🌿`
    },
    {
      id: '18089281798664688',
      user: 'shreekaameshsakre',
      message: `@shreekaameshsakre Hello! Yes, please share your location and contact details on WhatsApp: 9834783503 or via DM for distributorship queries. We will get back to you! 📦`
    }
  ];

  for (const t of igTasks) {
    console.log(`Replying to IG Comment [${t.id}] (@${t.user})...`);
    const res = await replyInstagramComment(t.id, t.message);
    console.log('IG Result:', res);
    await delay(1500);
  }

  console.log('\n=== ALL TARGET REPLIES COMPLETED! ===');
}

runBulkReplies().catch(console.error);
