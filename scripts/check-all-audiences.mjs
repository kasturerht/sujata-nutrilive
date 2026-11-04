// scripts/check-all-audiences.mjs
import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split('\n').forEach(line => {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) {
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[m[1]] = val;
  }
});

const token = env.META_ADS_ACCESS_TOKEN;
const accounts = ['act_1045791637117525', 'act_706658852401103'];

async function check() {
  for (const acc of accounts) {
    console.log(`\n==============================================`);
    console.log(`Checking Ad Account: ${acc}`);
    console.log(`==============================================`);
    const fields = 'id,name,description,subtype,time_created,time_updated,operation_status,delivery_status,approximate_count_lower_bound,approximate_count_upper_bound,customer_file_source,lookalike_spec,rule,retention_days';
    const url = `https://graph.facebook.com/v21.0/${acc}/customaudiences?fields=${fields}&limit=50&access_token=${token}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log(`Total Custom Audiences returned: ${data.data ? data.data.length : JSON.stringify(data)}`);
    if (data.data && data.data.length > 0) {
      data.data.forEach((a, i) => {
        const created = new Date(a.time_created * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        const updated = a.time_updated ? new Date(a.time_updated * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'N/A';
        console.log(`\n#${i+1}. ${a.name} [ID: ${a.id}]`);
        console.log(`   Subtype: ${a.subtype} | Source: ${a.customer_file_source || 'N/A'}`);
        console.log(`   Created: ${created} | Updated: ${updated}`);
        console.log(`   Operation Status:`, JSON.stringify(a.operation_status));
        console.log(`   Delivery Status:`, JSON.stringify(a.delivery_status));
        console.log(`   Approx Size: ${a.approximate_count_lower_bound} to ${a.approximate_count_upper_bound}`);
        if (a.lookalike_spec) {
          console.log(`   Lookalike Spec:`, JSON.stringify(a.lookalike_spec));
        }
      });
    }
  }
}

check().catch(console.error);
