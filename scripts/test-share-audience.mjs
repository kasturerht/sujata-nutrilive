// scripts/test-share-audience.mjs
import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split('\n').forEach(line => {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
});

const token = env.META_ADS_ACCESS_TOKEN;
const audienceId = '120250704911380554'; // Lookalike ID
const sourceAudienceId = '120250704896800554'; // Custom Audience ID
const targetAdAccountId = '1045791637117525'; // Main Ad Account

async function testShare() {
  console.log(`Attempting to share audiences with Main Ad Account: ${targetAdAccountId}...\n`);

  // First share source custom audience (required by Meta before Lookalike can be shared/used)
  const url1 = `https://graph.facebook.com/v21.0/${sourceAudienceId}/adaccounts`;
  const res1 = await fetch(url1, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      adaccounts: [targetAdAccountId],
      access_token: token
    })
  });
  const data1 = await res1.json();
  console.log("Source Custom Audience Share Result:", data1);

  // Then share Lookalike
  const url2 = `https://graph.facebook.com/v21.0/${audienceId}/adaccounts`;
  const res2 = await fetch(url2, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      adaccounts: [targetAdAccountId],
      access_token: token
    })
  });
  const data2 = await res2.json();
  console.log("Lookalike Audience Share Result:", data2);
}

testShare().catch(console.error);
