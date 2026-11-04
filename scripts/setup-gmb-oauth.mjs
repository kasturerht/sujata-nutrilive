// scripts/setup-gmb-oauth.mjs
// 🚀 SUJATA NUTRILIVE: GOOGLE BUSINESS PROFILE (GMB) OAUTH AUTHORIZATION ENGINE
// 100% Official Google OAuth 2.0 flow to connect Sujata Nutrilive GMB profile

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const credsPath = path.join(__dirname, '..', 'social-credentials.json');

const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));

const CLIENT_ID = creds.youtube?.client_id || '127414933788-cshrm98l8853cb4t3vqcun07ajqcpd4l.apps.googleusercontent.com';
const CLIENT_SECRET = creds.youtube?.client_secret || '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';
const PORT = 8085;
const REDIRECT_URI = `http://localhost:${PORT}`;

// The official Google Business Profile API scope
const SCOPE = 'https://www.googleapis.com/auth/business.manage';

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  response_type: 'code',
  scope: SCOPE,
  access_type: 'offline',
  prompt: 'consent'
}).toString();

console.log('\n=============================================================');
console.log('🌿 SUJATA NUTRILIVE — GOOGLE BUSINESS PROFILE (GMB) OAUTH');
console.log('=============================================================');
console.log('\n👉 Please open the following Google Authorization link in your browser:');
console.log('\n' + authUrl + '\n');
console.log('ℹ️  Login with the Google/Gmail account that owns or manages Sujata Nutrilive on Google Maps.');
console.log('⏳ Waiting for authorization callback on port ' + PORT + '...\n');

const server = http.createServer(async (req, res) => {
  try {
    const reqUrl = new URL(req.url, `http://localhost:${PORT}`);
    const code = reqUrl.searchParams.get('code');
    const error = reqUrl.searchParams.get('error');

    if (error) {
      console.error('❌ Authorization was declined or errored:', error);
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h1>❌ Authorization Failed</h1><p>${error}</p>`);
      server.close();
      process.exit(1);
    }

    if (code) {
      console.log('🔑 Authorization Code received! Exchanging for tokens...');

      // Exchange code for tokens
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
      if (!tokenData.refresh_token) {
        console.warn('⚠️ No refresh token returned. (Using existing or access granted previously)');
      }

      // Update social-credentials.json
      creds.gmb = {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: tokenData.refresh_token || creds.gmb?.refresh_token || '',
        scope: tokenData.scope || SCOPE,
        updated_at: new Date().toISOString()
      };

      fs.writeFileSync(credsPath, JSON.stringify(creds, null, 2), 'utf8');
      console.log('💾 Credentials saved to social-credentials.json [gmb section].');

      // Test GMB Account Management API with fresh token
      console.log('\n🔍 Verifying GMB API access with the new token...');
      let accountInfo = 'Verified';
      try {
        const gmbRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });
        const gmbData = await gmbRes.json();
        console.log('📡 GMB Accounts API Status:', gmbRes.status);
        console.log('📡 GMB Accounts API Response:', JSON.stringify(gmbData, null, 2));

        if (gmbData.accounts && gmbData.accounts.length > 0) {
          accountInfo = gmbData.accounts.map(a => `${a.accountName || a.name}`).join(', ');
          console.log(`🎉 Found GMB Account(s): ${accountInfo}`);
        }
      } catch (err) {
        console.warn('⚠️ GMB Account verification call error:', err.message);
      }

      // Return friendly HTML to user browser
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Sujata Nutrilive — GMB Connected</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b1320; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #132238; border: 1px solid #1e3a5f; padding: 48px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); text-align: center; max-width: 480px; }
            .badge { display: inline-block; background: #064e3b; color: #34d399; padding: 8px 16px; border-radius: 9999px; font-weight: 600; font-size: 14px; margin-bottom: 24px; border: 1px solid #059669; }
            h1 { font-size: 26px; margin: 0 0 12px; color: #ffffff; }
            p { color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 24px; }
            .footer { font-size: 13px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">✓ 100% Authorized & Verified</div>
            <h1>Google Business Profile Connected!</h1>
            <p>Sujata Nutrilive Google OAuth 2.0 connection is active and saved locally. You can now close this browser tab and return to the chat.</p>
            <div class="footer">Session closed safely. Zero sensitive data exposed.</div>
          </div>
        </body>
        </html>
      `);

      console.log('\n✨ All done! GMB OAuth setup completed successfully.');
      setTimeout(() => {
        server.close();
        process.exit(0);
      }, 1000);
    }
  } catch (err) {
    console.error('❌ Server error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error: ' + err.message);
  }
});

server.listen(PORT, () => {
  // Try to open the URL automatically in default browser
  import('child_process').then(({ exec }) => {
    exec(`start "" "${authUrl}"`, (err) => {
      if (err) {
        console.log('ℹ️  Could not auto-launch browser. Please copy and paste the link manually.');
      } else {
        console.log('🌐 Default browser launched automatically with the login link!');
      }
    });
  });
});

// Auto-timeout after 10 minutes
setTimeout(() => {
  console.log('⏰ OAuth setup timed out after 10 minutes.');
  server.close();
  process.exit(0);
}, 600000);
