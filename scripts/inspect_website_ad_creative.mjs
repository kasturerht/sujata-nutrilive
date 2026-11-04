// scripts/inspect_website_ad_creative.mjs
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    }
  });
}

const metaToken = env.META_ADS_ACCESS_TOKEN || env.META_PAGE_ACCESS_TOKEN;
const adId = '120249010265760630';

async function run() {
  const url = `https://graph.facebook.com/v21.0/${adId}?access_token=${metaToken}&fields=id,name,status,creative{id,name,asset_feed_spec,object_story_spec,effective_object_story_id}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log('Ad Creative Data:');
  console.log(JSON.stringify(data, null, 2));

  // If there's an effective_object_story_id, fetch post link
  const storyId = data.creative?.effective_object_story_id;
  if (storyId) {
    const postRes = await fetch(`https://graph.facebook.com/v21.0/${storyId}?access_token=${metaToken}&fields=id,message,call_to_action,link`);
    const postData = await postRes.json();
    console.log('Post / CTA details:', JSON.stringify(postData, null, 2));
  }
}

run().catch(console.error);
