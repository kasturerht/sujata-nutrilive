// scripts/inspect_video_details.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const all = JSON.parse(fs.readFileSync(path.join(__dirname, 'all_instagram_videos.json'), 'utf8'));

console.log("=== ALL 42 INSTAGRAM VIDEOS WITH DETAILS ===");
all.forEach((v, i) => {
  console.log(`\n--- [${i + 1}] ID: ${v.id} | Date: ${v.timestamp.slice(0, 10)} ---`);
  console.log(`URL: ${v.permalink}`);
  console.log(`Caption: ${v.caption?.slice(0, 200).replace(/\n/g, ' ')}`);
  console.log(`Likes: ${v.like_count} | Comments: ${v.comments_count}`);
});
