// scripts/find-target-comment-ids.mjs
import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split('\n').forEach(line => {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
});

const adsToken = env.META_ADS_ACCESS_TOKEN;
const pageToken = env.META_PAGE_ACCESS_TOKEN;
const adAccountId = env.META_AD_ACCOUNT_ID || 'act_1045791637117525';
const pageId = env.META_PAGE_ID || '356279144243520';

async function findComments() {
  const url = `https://graph.facebook.com/v21.0/${adAccountId}/ads?fields=id,name,creative{id,effective_object_story_id}&limit=20&access_token=${adsToken}`;
  const res = await fetch(url);
  const data = await res.json();

  const matched = [];

  for (const ad of data.data || []) {
    const storyId = ad.creative?.effective_object_story_id;
    if (!storyId) continue;

    try {
      const cUrl = `https://graph.facebook.com/v21.0/${storyId}/comments?fields=id,message,created_time,from&access_token=${pageToken}`;
      const cRes = await fetch(cUrl);
      const cData = await cRes.json();
      for (const c of cData.data || []) {
        if (c.message?.includes('पता') || c.message?.toLowerCase().includes('address') || c.message?.toLowerCase().includes('nasik')) {
          matched.push({
            adName: ad.name,
            storyId,
            commentId: c.id,
            author: c.from?.name,
            authorId: c.from?.id,
            message: c.message,
            created_time: c.created_time
          });
        }
      }
    } catch(e) {}
  }

  // Also check reel
  const reelId = '1423886519708159';
  try {
    const rUrl = `https://graph.facebook.com/v21.0/${reelId}/comments?fields=id,message,created_time,from&access_token=${pageToken}`;
    const rRes = await fetch(rUrl);
    const rData = await rRes.json();
    for (const c of rData.data || []) {
      if (c.message?.toLowerCase().includes('price') || c.message?.toLowerCase().includes('gram')) {
        matched.push({
          type: 'Reel',
          storyId: reelId,
          commentId: c.id,
          author: c.from?.name,
          authorId: c.from?.id,
          message: c.message,
          created_time: c.created_time
        });
      }
    }
  } catch(e) {}

  console.log("Matched Comments:", JSON.stringify(matched, null, 2));
}

findComments().catch(console.error);
