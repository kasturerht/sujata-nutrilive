// scripts/test-direct-reply-call.mjs
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
  const token = await getAccessToken();
  console.log('Token acquired!');

  // Test combinations of account & location
  const pairs = [
    { acc: 'accounts/17925629354114124583', loc: 'locations/1857937387266284431' },
    { acc: 'accounts/110750389898929424113', loc: 'locations/1857937387266284431' },
    { acc: 'accounts/17925629354114124583', loc: 'locations/ChIJt_E7hSnr3TsRj5vsvjW4yBk' }
  ];

  const reviewId = 'Ci9DQUlRQUNvZENodHljRjlvT25oWVdtNHhWMUZHY21WMGJsWkhPRkpUV0RKd1QxRRAB';
  const comment = 'अभिषेकजी, सुजाता न्यूट्रिलिव्हवर विश्वास ठेवल्याबद्दल आणि आपला बहुमूल्य अभिप्राय दिल्याबद्दल मनःपूर्वक धन्यवाद! 🙏';

  for (const pair of pairs) {
    const url = `https://mybusiness.googleapis.com/v4/${pair.acc}/${pair.loc}/reviews/${reviewId}/reply`;
    console.log('\nTrying endpoint:', url);
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ comment })
    });
    console.log('Status:', res.status);
    const data = await res.json().catch(() => ({}));
    console.log('Response:', data);
  }
}

run();
