// scripts/check-meta-audiences.mjs
import fs from 'fs';
import path from 'path';

// Load .env
const env = {};
if (fs.existsSync('.env')) {
  fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[trimmed.slice(0, idx).trim()] = val;
    }
  });
}

const adsToken = env.META_ADS_ACCESS_TOKEN;
const adAccountId = env.META_AD_ACCOUNT_ID || 'act_1045791637117525';

async function checkAudiences() {
  console.log(`Checking Custom Audiences & Lookalikes for Ad Account: ${adAccountId}...\n`);

  const fields = [
    'id',
    'name',
    'description',
    'subtype',
    'time_created',
    'time_updated',
    'operation_status',
    'delivery_status',
    'approximate_count_lower_bound',
    'approximate_count_upper_bound',
    'customer_file_source',
    'lookalike_spec',
    'permission_for_actions'
  ].join(',');

  const url = `https://graph.facebook.com/v21.0/${adAccountId}/customaudiences?fields=${fields}&limit=50&access_token=${adsToken}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    console.error("Meta API Error:", data.error);
    return;
  }

  const audiences = data.data || [];
  console.log(`Found ${audiences.length} total Custom Audiences.`);

  fs.writeFileSync('scripts/meta_audiences_dump.json', JSON.stringify(audiences, null, 2));

  // Sort by time_created or time_updated desc
  audiences.sort((a, b) => (b.time_updated || b.time_created) - (a.time_updated || a.time_created));

  audiences.forEach((aud, i) => {
    const createdDate = new Date(aud.time_created * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const updatedDate = aud.time_updated ? new Date(aud.time_updated * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'N/A';
    console.log(`\n--------------------------------------------------`);
    console.log(`#${i + 1}: ${aud.name} (ID: ${aud.id})`);
    console.log(`Subtype: ${aud.subtype} | Source: ${aud.customer_file_source || 'N/A'}`);
    console.log(`Created: ${createdDate} | Updated: ${updatedDate}`);
    console.log(`Operation Status:`, aud.operation_status);
    console.log(`Delivery Status:`, aud.delivery_status);
    console.log(`Approx Size: ${aud.approximate_count_lower_bound} - ${aud.approximate_count_upper_bound}`);
    if (aud.lookalike_spec) {
      console.log(`Lookalike Spec:`, JSON.stringify(aud.lookalike_spec));
    }
  });
}

checkAudiences().catch(console.error);
