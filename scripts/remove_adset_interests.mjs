import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const token = env.META_ADS_ACCESS_TOKEN || env.META_PAGE_ACCESS_TOKEN;
const adsetId = '120248771569360630';

async function updateTargeting() {
  console.log("=== 1. FETCHING CURRENT ADSET TARGETING ===");
  const getUrl = `https://graph.facebook.com/v21.0/${adsetId}?access_token=${token}&fields=id,name,targeting`;
  const getRes = await fetch(getUrl);
  const current = await getRes.json();

  if (!current.targeting) {
    console.error("Could not fetch targeting:", current);
    return;
  }

  console.log("Current flexible_spec:", JSON.stringify(current.targeting.flexible_spec, null, 2));

  // Build clean targeting without flexible_spec (interests)
  const updatedTargeting = { ...current.targeting };
  delete updatedTargeting.flexible_spec;

  console.log("\n=== 2. SENDING UPDATED TARGETING VIA META GRAPH API ===");
  const postUrl = `https://graph.facebook.com/v21.0/${adsetId}`;
  
  const body = new URLSearchParams();
  body.append('access_token', token);
  body.append('targeting', JSON.stringify(updatedTargeting));

  const postRes = await fetch(postUrl, {
    method: 'POST',
    body: body
  });

  const postData = await postRes.json();
  console.log("Meta API Response:", JSON.stringify(postData, null, 2));

  if (postData.success) {
    console.log("\n✅ SUCCESS: Targeting updated successfully!");
    
    // Verify by fetching again
    console.log("\n=== 3. VERIFYING UPDATED ADSET TARGETING ===");
    const vRes = await fetch(getUrl);
    const vData = await vRes.json();
    console.log("Verified Targeting in Meta:", JSON.stringify(vData.targeting, null, 2));
  } else {
    console.error("❌ Failed to update targeting:", postData);
  }
}

updateTargeting().catch(console.error);
