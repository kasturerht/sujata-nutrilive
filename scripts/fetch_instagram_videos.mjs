// scripts/fetch_instagram_videos.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const igAccountId = env.META_INSTAGRAM_ACCOUNT_ID;
const pageToken = env.META_PAGE_ACCESS_TOKEN;
const adsToken = env.META_ADS_ACCESS_TOKEN;

console.log("IG Account ID:", igAccountId);

async function tryFetchIG(token, tokenName) {
  console.log(`\nTrying with ${tokenName}...`);
  try {
    const fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count,children{media_type,media_url,thumbnail_url}';
    const url = `https://graph.facebook.com/v21.0/${igAccountId}/media?fields=${fields}&limit=50&access_token=${token}`;
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (err) {
    return { error: err.message };
  }
}

async function main() {
  let result = await tryFetchIG(pageToken, 'META_PAGE_ACCESS_TOKEN');
  if (result.error) {
    console.log("Page Token failed:", result.error);
    result = await tryFetchIG(adsToken, 'META_ADS_ACCESS_TOKEN');
  }

  if (result.error) {
    console.error("Both tokens failed. Error:", result.error);
    return;
  }

  const items = result.data || [];
  console.log(`Fetched ${items.length} total media items from Instagram!`);

  // Filter video / reels items
  const videos = items.filter(item => item.media_type === 'VIDEO' || item.media_type === 'REELS' || item.caption?.toLowerCase().includes('reel') || item.children?.data?.some(c => c.media_type === 'VIDEO'));
  console.log(`Found ${videos.length} video/reel items!`);

  // Save raw data
  fs.writeFileSync(path.join(__dirname, 'instagram_media_dump.json'), JSON.stringify(items, null, 2));

  // Log summary of items
  items.forEach((item, idx) => {
    console.log(`[${idx + 1}] Type: ${item.media_type} | Date: ${item.timestamp}`);
    console.log(`     Permalink: ${item.permalink}`);
    console.log(`     Caption: ${item.caption ? item.caption.slice(0, 100).replace(/\n/g, ' ') : 'NO CAPTION'}...`);
    console.log(`     MediaURL: ${item.media_url ? item.media_url.slice(0, 60) + '...' : 'N/A'}`);
    console.log(`     ThumbURL: ${item.thumbnail_url ? item.thumbnail_url.slice(0, 60) + '...' : 'N/A'}`);
    console.log('----------------------------------------------------');
  });
}

main().catch(console.error);
