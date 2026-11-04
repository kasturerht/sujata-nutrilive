// scripts/post-gmb-replies.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const credsPath = path.join(__dirname, '..', 'social-credentials.json');

const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));

// Verified Reviews Data for Sujata Nutrilive
const REPLIES_TO_POST = [
  {
    reviewer: 'Abhishek Ahire',
    reviewId: 'Ci9DQUlRQUNvZENodHljRjlvT25oWVdtNHhWMUZHY21WMGJsWkhPRkpUV0RKd1QxRRAB',
    comment: 'अभिषेकजी, सुजाता न्यूट्रिलिव्हवर विश्वास ठेवल्याबद्दल आणि आपला बहुमूल्य अभिप्राय दिल्याबद्दल मनःपूर्वक धन्यवाद! 🙏 सुरक्षित पॅकिंग, वेळेवर डिलिव्हरी आणि १००% शुद्ध व लॅब-टेस्टेड उत्पादने आपल्यापर्यंत पोहोचवणे हेच आमचे ध्येय आहे. आमच्या टीमचा अनुभव तुम्हाला आवडला याचा आम्हाला मनापासून आनंद आहे. आपल्या उत्तम आरोग्यासाठी सुजाता न्यूट्रिलिव्ह नेहमीच कटिबद्ध राहील! 🌿✨'
  },
  {
    reviewer: 'Rajesh patode',
    reviewId: 'Ci9DQUlRQUNvZENodHljRjlvT214cVV6TkZaMGh3U1c0ek9ITkpZV1F6UjJvMVIzYxAB',
    comment: 'राजेशजी, आपला हा अनुभव वाचून आम्हाला अतिशय आनंद झाला! 🙏 सुजाता स्पिरुलीनामधील नैसर्गिक वनस्पती प्रथिने (Protein) आणि सी बकथॉर्नमधील दुर्मिळ ओमेगा-७ मुळे शरीराला ऊर्जा मिळून थकवा दूर होण्यास मदत होते, याचा तुम्हाला प्रत्यक्ष अनुभव आला हे वाचून खूप समाधान वाटले. नियमित सेवन चालू ठेवा आणि निरोगी राहा. काहीही शंका किंवा मार्गदर्शन हवे असल्यास आमच्या वैद्यांशी संपर्क करू शकता. धन्यवाद! 🌿💪'
  },
  {
    reviewer: 'pratik Tatkar',
    reviewId: 'Ci9DQUlRQUNvZENodHljRjlvT2tGaVlUaFZhUzFpUVdkcU5IZEJNbk5EUm1GRWJIYxAB',
    comment: 'प्रतीकजी, सुजाता न्यूट्रिलिव्हला ५-स्टार रेटिंग दिल्याबद्दल मनापासून धन्यवाद! 🙏 १००% शुद्ध आणि नैसर्गिक सप्लिमेंट्स आपल्यापर्यंत पोहोचवण्यासाठी आम्ही सदैव कटिबद्ध आहोत. आपले आरोग्य उत्तम राहो हीच सदिच्छा! 🌿'
  }
];

async function getAccessToken() {
  const params = new URLSearchParams({
    client_id: creds.gmb.client_id,
    client_secret: creds.gmb.client_secret,
    refresh_token: creds.gmb.refresh_token,
    grant_type: 'refresh_token'
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  const data = await res.json();
  if (!data.access_token) {
    throw new Error('Failed to refresh access token: ' + JSON.stringify(data));
  }
  return data.access_token;
}

async function run() {
  try {
    console.log('🔄 Getting GMB Access Token...');
    const token = await getAccessToken();
    console.log('✅ Access Token acquired successfully!');

    // 1. Fetch Accounts
    const accRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const accData = await accRes.json();
    console.log('📡 GMB Accounts:', JSON.stringify(accData, null, 2));

    if (!accData.accounts || accData.accounts.length === 0) {
      console.log('⚠️ No accounts returned from API.');
      return;
    }

    const account = accData.accounts[0];
    const accountName = account.name; // e.g. "accounts/17925629354114124583" or "accounts/..."

    // 2. Fetch locations
    const locRes = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title,storefrontAddress`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const locData = await locRes.json();
    console.log('📡 GMB Locations:', JSON.stringify(locData, null, 2));

    let locationName = '';
    if (locData.locations && locData.locations.length > 0) {
      locationName = locData.locations[0].name; // e.g. "locations/..."
    } else {
      // Fallback location ID from our extracted metadata
      locationName = 'locations/1857937387266284431';
    }

    console.log(`\n🚀 Posting replies to Account: ${accountName}, Location: ${locationName}`);

    for (const item of REPLIES_TO_POST) {
      console.log(`\n💬 Posting reply to ${item.reviewer} (Review ID: ${item.reviewId})...`);
      
      const replyUrl = `https://mybusiness.googleapis.com/v4/${accountName}/${locationName}/reviews/${item.reviewId}/reply`;
      console.log('Endpoint:', replyUrl);

      const replyRes = await fetch(replyUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          comment: item.comment
        })
      });

      const replyData = await replyRes.json();
      console.log(`Status: ${replyRes.status}`, replyData);
      if (replyRes.ok) {
        console.log(`✅ Successfully replied to ${item.reviewer}!`);
      } else {
        console.warn(`⚠️ Failed to reply to ${item.reviewer}:`, replyData);
      }
    }

  } catch (err) {
    console.error('❌ Error in post-gmb-replies:', err.message);
  }
}

run();
