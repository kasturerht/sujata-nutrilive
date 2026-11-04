// scripts/test-google-indexing-api.mjs
import fs from 'fs';
import crypto from 'crypto';

const key = JSON.parse(fs.readFileSync('scripts/sujata-nutrilive-seo-7e48e83a62a6.json', 'utf8'));

function createJwt(scopes) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: key.client_email,
    scope: scopes.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };
  const base64Url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const signInput = base64Url(header) + '.' + base64Url(payload);
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signInput);
  return signInput + '.' + sign.sign(key.private_key, 'base64url');
}

async function testIndexingApi() {
  const assertion = createJwt(['https://www.googleapis.com/auth/indexing']);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    })
  });
  const data = await res.json();
  const token = data.access_token;
  console.log('Token acquired:', !!token);

  const testUrl = 'https://www.sujatanutrilive.com/product/sujata-spirulina-powder';
  const apiRes = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: testUrl,
      type: 'URL_UPDATED'
    })
  });

  console.log('Indexing API Status:', apiRes.status);
  const resData = await apiRes.json();
  console.log('Response:', JSON.stringify(resData, null, 2));
}

testIndexingApi();
