// scripts/gmb-auth-and-reply.mjs
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const credsPath = path.join(__dirname, '..', 'social-credentials.json');

const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));

const CLIENT_ID = creds.gmb?.client_id || creds.youtube?.client_id || '127414933788-cshrm98l8853cb4t3vqcun07ajqcpd4l.apps.googleusercontent.com';
const CLIENT_SECRET = creds.gmb?.client_secret || creds.youtube?.client_secret || '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';
const PORT = 8085;
const REDIRECT_URI = `http://localhost:${PORT}`;

const SCOPE = 'https://www.googleapis.com/auth/business.manage';

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

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  response_type: 'code',
  scope: SCOPE,
  access_type: 'offline',
  prompt: 'consent'
}).toString();

console.log('\n=============================================================');
console.log('🌿 SUJATA NUTRILIVE — GMB OAUTH & DIRECT REPLY ENGINE');
console.log('=============================================================');
console.log('\n👉 Opening Google Authorization URL in your default browser...');
console.log(authUrl);
console.log('\n⏳ Listening on port ' + PORT + ' for user authorization callback...\n');

const server = http.createServer(async (req, res) => {
  try {
    const reqUrl = new URL(req.url, `http://localhost:${PORT}`);
    const code = reqUrl.searchParams.get('code');
    const error = reqUrl.searchParams.get('error');

    if (error) {
      console.error('❌ Authorization was declined or errored:', error);
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h1>❌ Authorization Failed: ${error}</h1>`);
      server.close();
      process.exit(1);
    }

    if (code) {
      console.log('🔑 Authorization Code received! Exchanging for tokens...');

      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: REDIRECT_URI
        })
      });

      const tokenData = await tokenRes.json();

      if (!tokenData.access_token) {
        console.error('❌ Token exchange failed:', tokenData);
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<h1>❌ Token Exchange Failed</h1><pre>${JSON.stringify(tokenData, null, 2)}</pre>`);
        server.close();
        process.exit(1);
      }

      console.log('✅ Access Token & Refresh Token acquired successfully!');

      // Save token in social-credentials.json
      creds.gmb = {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: tokenData.refresh_token || creds.gmb?.refresh_token || '',
        scope: tokenData.scope || SCOPE,
        updated_at: new Date().toISOString()
      };
      fs.writeFileSync(credsPath, JSON.stringify(creds, null, 2), 'utf8');
      console.log('💾 Updated social-credentials.json with fresh GMB token.');

      // Now fetch GMB Accounts & Locations
      const token = tokenData.access_token;
      let postingResults = [];

      try {
        console.log('📡 Fetching GMB Accounts...');
        const accRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const accData = await accRes.json();
        console.log('Accounts data:', JSON.stringify(accData, null, 2));

        let accountName = accData?.accounts?.[0]?.name;
        let locationName = '';

        if (accountName) {
          const locRes = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const locData = await locRes.json();
          console.log('Locations data:', JSON.stringify(locData, null, 2));
          locationName = locData?.locations?.[0]?.name;
        }

        if (!accountName) accountName = 'accounts/110750389898929424113';
        if (!locationName) locationName = 'locations/1857937387266284431';

        console.log(`\n🚀 Posting 3 review replies to ${accountName}/${locationName}...`);

        for (const item of REPLIES_TO_POST) {
          console.log(`\n💬 Replying to ${item.reviewer}...`);
          const replyUrl = `https://mybusiness.googleapis.com/v4/${accountName}/${locationName}/reviews/${item.reviewId}/reply`;

          const replyRes = await fetch(replyUrl, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ comment: item.comment })
          });

          const replyJson = await replyRes.json().catch(() => ({}));
          console.log(`Status ${replyRes.status}:`, replyJson);

          postingResults.push({
            reviewer: item.reviewer,
            status: replyRes.status,
            ok: replyRes.ok,
            response: replyJson
          });
        }

      } catch (err) {
        console.error('API Posting Error:', err);
      }

      // Render response in browser
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Sujata Nutrilive — GMB Replies</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #064e3b; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
            .card { background: #022c22; border: 1px solid #059669; padding: 40px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); text-align: center; max-width: 580px; }
            .badge { display: inline-block; background: #065f46; color: #34d399; padding: 8px 16px; border-radius: 9999px; font-weight: 600; font-size: 14px; margin-bottom: 20px; }
            h1 { font-size: 24px; margin: 0 0 16px; color: #ffffff; }
            p { color: #a7f3d0; font-size: 15px; line-height: 1.6; margin: 0 0 20px; }
            .result-item { background: #064e3b; border-radius: 10px; padding: 12px; margin-bottom: 10px; text-align: left; font-size: 14px; }
            .footer { font-size: 12px; color: #6ee7b7; margin-top: 24px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">✓ Google Business Profile Connected</div>
            <h1>Google Reviews Reply Engine Finished!</h1>
            <p>Sujata Nutrilive Google Account Authorized successfully.</p>
            <div>
              ${postingResults.map(r => `
                <div class="result-item">
                  <strong>${r.reviewer}</strong>: ${r.ok ? '✅ Reply Posted!' : ('Status: ' + r.status + ' (' + (r.response?.error?.message || 'Processed') + ')')}
                </div>
              `).join('')}
            </div>
            <div class="footer">You can now close this browser tab and check Antigravity chat.</div>
          </div>
        </body>
        </html>
      `);

      console.log('\n✨ Finished processing. Closing server in 3 seconds...');
      setTimeout(() => {
        server.close();
        process.exit(0);
      }, 3000);
    }
  } catch (err) {
    console.error('❌ Server error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server Error: ' + err.message);
  }
});

server.listen(PORT, () => {
  // Launch browser automatically
  import('child_process').then(({ exec }) => {
    exec(`start "" "${authUrl}"`, (err) => {
      if (err) {
        console.log('ℹ️ Could not auto-launch browser. URL:', authUrl);
      } else {
        console.log('🌐 Google Login opened in Chrome!');
      }
    });
  });
});

// Auto-timeout after 5 minutes
setTimeout(() => {
  console.log('⏰ OAuth timed out after 5 minutes.');
  server.close();
  process.exit(0);
}, 300000);
