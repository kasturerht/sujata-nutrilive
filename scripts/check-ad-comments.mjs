import fs from 'fs';
import path from 'path';

const env = {};
if (fs.existsSync('.env')) {
  fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      env[trimmed.slice(0, idx).trim()] = val;
    }
  });
}

const adsToken = env.META_ADS_ACCESS_TOKEN;
const pageToken = env.META_PAGE_ACCESS_TOKEN;
const adAccountId = env.META_AD_ACCOUNT_ID || 'act_1045791637117525';

async function checkAdComments() {
  console.log('\n--- CHECKING COMMENTS ON META ADS (DARK POSTS) ---');
  // 1. Get all active & recent ads with their effective_object_story_id
  const url = `https://graph.facebook.com/v21.0/${adAccountId}/ads?fields=id,name,effective_status,creative{id,name,effective_object_story_id}&limit=50&access_token=${adsToken}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    console.error('Error fetching ads:', data.error);
    return;
  }

  const ads = data.data || [];
  console.log(`Found ${ads.length} ads. Checking comments on each ad creative...`);

  const adComments = [];

  for (const ad of ads) {
    const storyId = ad.creative?.effective_object_story_id;
    if (!storyId) continue;

    try {
      const cUrl = `https://graph.facebook.com/v21.0/${storyId}/comments?fields=id,message,created_time,from,like_count,comments{id,message,created_time,from}&access_token=${pageToken}`;
      const cRes = await fetch(cUrl);
      const cData = await cRes.json();

      if (cData.data && cData.data.length > 0) {
        for (const c of cData.data) {
          const replies = c.comments?.data || [];
          const hasOwnerReply = replies.some(r => r.from?.id === env.META_PAGE_ID || r.from?.name?.toLowerCase().includes('sujata'));
          adComments.push({
            adName: ad.name,
            adStatus: ad.effective_status,
            storyId,
            commentId: c.id,
            author: c.from?.name || 'User',
            comment: c.message,
            date: c.created_time,
            repliesCount: replies.length,
            hasOwnerReply,
            needsReply: !hasOwnerReply
          });
        }
      }
    } catch (e) {
      // ignore individual ad permission errors
    }
  }

  console.log(`\nTotal Comments Found on Ads: ${adComments.length}`);
  const pendingAdComments = adComments.filter(c => c.needsReply);
  console.log(`Pending Reply on Ads: ${pendingAdComments.length}`);

  if (pendingAdComments.length > 0) {
    console.table(pendingAdComments.map(c => ({
      Ad: c.adName,
      Status: c.adStatus,
      Author: c.author,
      Comment: c.comment,
      Date: new Date(c.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    })));
  }

  // Save to json
  fs.writeFileSync('scripts/ad_comments_audit.json', JSON.stringify({ adComments, pendingAdComments }, null, 2));
}

checkAdComments().catch(console.error);
