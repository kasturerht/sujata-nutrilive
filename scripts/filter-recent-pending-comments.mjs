// scripts/filter-recent-pending-comments.mjs
import fs from 'fs';

// Read ad comments
let adComments = [];
if (fs.existsSync('scripts/ad_comments_audit.json')) {
  // if exists
}

// Let's re-run a targeted filter on the data from task-238 or fetch live comments from active ads
const env = {};
fs.readFileSync('.env', 'utf8').split('\n').forEach(line => {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
});

const adsToken = env.META_ADS_ACCESS_TOKEN;
const pageToken = env.META_PAGE_ACCESS_TOKEN;
const adAccountId = env.META_AD_ACCOUNT_ID || 'act_1045791637117525';
const pageId = env.META_PAGE_ID || '356279144243520';

async function getRecentActiveComments() {
  const url = `https://graph.facebook.com/v21.0/${adAccountId}/ads?fields=id,name,effective_status,creative{id,name,effective_object_story_id}&limit=50&access_token=${adsToken}`;
  const res = await fetch(url);
  const data = await res.json();
  const ads = (data.data || []).filter(a => a.effective_status === 'ACTIVE');
  console.log(`Found ${ads.length} currently ACTIVE ads.`);

  const recentPending = [];

  for (const ad of ads) {
    const storyId = ad.creative?.effective_object_story_id;
    if (!storyId) continue;

    try {
      const cUrl = `https://graph.facebook.com/v21.0/${storyId}/comments?fields=id,message,created_time,from,like_count,comments{id,message,created_time,from}&access_token=${pageToken}`;
      const cRes = await fetch(cUrl);
      const cData = await cRes.json();

      if (cData.data) {
        for (const c of cData.data) {
          const replies = c.comments?.data || [];
          const hasOwnerReply = replies.some(r => r.from?.id === pageId || r.from?.name?.toLowerCase().includes('sujata'));
          
          // Check if created in last 7 days (after Oct 20)
          const cDate = new Date(c.created_time);
          const isRecent = cDate.getTime() > new Date('2026-10-20').getTime();

          if (!hasOwnerReply && isRecent) {
            recentPending.push({
              platform: 'Meta Ads (Active Ad: ' + ad.name + ')',
              storyId,
              commentId: c.id,
              author: c.from?.name || 'Customer',
              authorId: c.from?.id,
              message: c.message,
              date: c.created_time,
              istDate: cDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
            });
          }
        }
      }
    } catch(e) {}
  }

  // Also check Facebook Page recent posts
  const pUrl = `https://graph.facebook.com/v21.0/${pageId}/feed?fields=id,message,created_time,permalink_url,comments{id,message,created_time,from,comments{id,message,created_time,from}}&limit=15&access_token=${pageToken}`;
  const pRes = await fetch(pUrl);
  const pData = await pRes.json();
  for (const p of pData.data || []) {
    for (const c of p.comments?.data || []) {
      const replies = c.comments?.data || [];
      const hasOwnerReply = replies.some(r => r.from?.id === pageId || r.from?.name?.toLowerCase().includes('sujata'));
      const cDate = new Date(c.created_time);
      if (!hasOwnerReply && cDate.getTime() > new Date('2026-10-20').getTime()) {
        recentPending.push({
          platform: 'Facebook Page Post',
          postUrl: p.permalink_url,
          commentId: c.id,
          author: c.from?.name || 'Customer',
          message: c.message,
          date: c.created_time,
          istDate: cDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        });
      }
    }
  }

  // Also check Instagram recent media
  const igUserId = env.META_INSTAGRAM_ACCOUNT_ID || '17841468384194114';
  const igUrl = `https://graph.facebook.com/v21.0/${igUserId}/media?fields=id,permalink,comments{id,text,timestamp,username,replies{id,text,timestamp,username}}&limit=15&access_token=${pageToken}`;
  const igRes = await fetch(igUrl);
  const igData = await igRes.json();
  for (const m of igData.data || []) {
    for (const c of m.comments?.data || []) {
      const replies = c.replies?.data || [];
      const hasOwnerReply = replies.some(r => r.username?.toLowerCase().includes('sujata'));
      const cDate = new Date(c.timestamp);
      if (!hasOwnerReply && cDate.getTime() > new Date('2026-10-20').getTime()) {
        recentPending.push({
          platform: 'Instagram Reel/Post',
          postUrl: m.permalink,
          commentId: c.id,
          author: c.username || 'Customer',
          message: c.text,
          date: c.timestamp,
          istDate: cDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        });
      }
    }
  }

  fs.writeFileSync('scripts/recent_pending_comments.json', JSON.stringify(recentPending, null, 2));
  console.log(`\nFound ${recentPending.length} RECENT pending comments:`);
  recentPending.forEach((c, i) => {
    console.log(`${i+1}. [${c.istDate}] [${c.platform}] ${c.author}: "${c.message}"`);
  });
}

getRecentActiveComments().catch(console.error);
