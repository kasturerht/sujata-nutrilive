// scripts/categorize_instagram_videos.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const videos = JSON.parse(fs.readFileSync(path.join(__dirname, 'all_instagram_videos.json'), 'utf8'));

console.log(`Analyzing ${videos.length} reels/videos...`);

const categorized = {
  models_creators_reviews: [],
  brand_promos_educational: [],
  festive_greetings_shorts: []
};

videos.forEach((v, i) => {
  const cap = v.caption || '';
  const item = {
    index: i + 1,
    id: v.id,
    date: v.timestamp.slice(0, 10),
    permalink: v.permalink,
    captionSnippet: cap.slice(0, 120).replace(/\n/g, ' '),
    fullCaption: cap,
    mediaUrl: v.media_url,
    thumbnailUrl: v.thumbnail_url
  };

  // Check language & keywords
  const isCreatorStyle = 
    cap.includes("I’ve been using") ||
    cap.includes("तुम्हाला माहीत आहे का") ||
    cap.includes("क्या आपको पता है") ||
    cap.includes("जगाने मान्य केलय") ||
    cap.includes("Glow from inside") ||
    cap.includes("Glass skin glow") ||
    cap.includes("Natural & Fresh") ||
    cap.includes("Say hello to") ||
    cap.includes("Discover the secret") ||
    cap.includes("Weight loss result") ||
    cap.includes("Fuel your body") ||
    cap.includes("HEALTH COMBO OFFER");

  if (isCreatorStyle) {
    categorized.models_creators_reviews.push(item);
  } else {
    categorized.brand_promos_educational.push(item);
  }
});

console.log(`\nPotential Model/Creator/Testimonial Reels: ${categorized.models_creators_reviews.length}`);
categorized.models_creators_reviews.forEach(c => {
  console.log(`[#${c.index}] ${c.date} | ${c.permalink} | ${c.captionSnippet}`);
});

fs.writeFileSync(path.join(__dirname, 'categorized_instagram_videos.json'), JSON.stringify(categorized, null, 2));
