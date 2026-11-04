// scripts/check-token-owner.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const credsPath = path.join(__dirname, '..', 'social-credentials.json');

const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));

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
  return data.access_token;
}

async function run() {
  try {
    const token = await getAccessToken();
    console.log('Token acquired!');

    // 1. Check tokeninfo
    const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${token}`);
    const tokenInfo = await tokenInfoRes.json();
    console.log('\n--- TOKEN INFO ---');
    console.log(JSON.stringify(tokenInfo, null, 2));

    // 2. Check userinfo
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const userInfo = await userInfoRes.json();
    console.log('\n--- USER INFO ---');
    console.log(JSON.stringify(userInfo, null, 2));

  } catch (err) {
    console.error('Error:', err);
  }
}

run();
