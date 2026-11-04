// scripts/test-gmb-reviews.mjs
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
  if (!data.access_token) {
    throw new Error('Failed to refresh access token: ' + JSON.stringify(data));
  }
  return data.access_token;
}

async function run() {
  try {
    console.log('🔄 Refreshing GMB Access Token...');
    const token = await getAccessToken();
    console.log('✅ Access Token acquired!');

    // 1. Get Accounts
    console.log('📡 Fetching GMB Accounts...');
    const accRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const accData = await accRes.json();
    console.log('Accounts response:', JSON.stringify(accData, null, 2));

    if (!accData.accounts || accData.accounts.length === 0) {
      console.log('⚠️ No accounts found.');
      return;
    }

    for (const account of accData.accounts) {
      console.log(`\n🏢 Checking Account: ${account.name} (${account.accountName || 'No Name'})`);

      // 2. Fetch locations
      // New Business Information API
      const locUrl = `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,storefrontAddress,metadata`;
      console.log('Fetching locations from:', locUrl);
      const locRes = await fetch(locUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const locData = await locRes.json();
      console.log('Locations response:', JSON.stringify(locData, null, 2));

      // Also try fetching reviews via v4 endpoint: accounts/{accId}/locations/{locId}/reviews
      // Note: In v4, account name is often "accounts/..."
      if (locData.locations && locData.locations.length > 0) {
        for (const loc of locData.locations) {
          console.log(`\n📍 Location: ${loc.title} (${loc.name})`);
          // loc.name is "locations/{locationId}"
          // Reviews endpoint is https://mybusiness.googleapis.com/v4/{account.name}/{loc.name}/reviews
          const reviewsUrl = `https://mybusiness.googleapis.com/v4/${account.name}/${loc.name}/reviews`;
          console.log('Fetching reviews from:', reviewsUrl);
          const revRes = await fetch(reviewsUrl, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const revData = await revRes.json();
          console.log('Reviews response:', JSON.stringify(revData, null, 2));
        }
      }
    }
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

run();
