// scripts/fetch_all_instagram_videos.mjs
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
const token = env.META_PAGE_ACCESS_TOKEN;

async function fetchAll() {
  let allMedia = [];
  const fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count';
  let url = `https://graph.facebook.com/v21.0/${igAccountId}/media?fields=${fields}&limit=50&access_token=${token}`;

  while (url && allMedia.length < 200) {
    console.log("Fetching page...", url.slice(0, 80));
    const res = await fetch(url);
    const data = await res.json();
    if (!data.data) {
      console.log("No data / error:", data);
      break;
    }
    allMedia = allMedia.concat(data.data);
    url = data.paging?.next || null;
  }

  console.log(`Total items fetched: ${allMedia.length}`);
  const videos = allMedia.filter(m => m.media_type === 'VIDEO' || m.caption?.toLowerCase().includes('reel'));
  console.log(`Total video/reels fetched: ${videos.length}`);

  fs.writeFileSync(path.join(__dirname, 'all_instagram_videos.json'), JSON.stringify(videos, null, 2));

  // Print a summary of each video
  videos.forEach((v, idx) => {
    console.log(`\n#${idx + 1} ID: ${v.id} | Date: ${v.timestamp.slice(0, 10)}`);
    console.log(`Link: ${v.permalink}`);
    console.log(`Caption: ${v.caption ? v.caption.slice(0, 150).replace(/\n/g, ' ') : 'No caption'}`);
    console.log(`Has MediaURL: ${!!v.media_url} | Has Thumb: ${!!v.thumbnail_url}`);
  });
}

fetchAll().catch(console.error);
