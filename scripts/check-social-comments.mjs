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
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      env[trimmed.slice(0, idx).trim()] = val;
    }
  });
}

const pageToken = env.META_PAGE_ACCESS_TOKEN;
const adsToken = env.META_ADS_ACCESS_TOKEN;
const igUserId = env.META_INSTAGRAM_ACCOUNT_ID || '17841468384194114';
const pageId = env.META_PAGE_ID || '356279144243520';

const results = {
  instagram: [],
  facebook: [],
  youtube: []
};

// 1. Check Instagram Comments
async function checkInstagramComments() {
  console.log('\n--- 1. CHECKING INSTAGRAM COMMENTS ---');
  try {
    const url = `https://graph.facebook.com/v21.0/${igUserId}/media?fields=id,caption,media_type,permalink,timestamp,comments_count,comments{id,text,timestamp,username,from,like_count,replies{id,text,timestamp,username,from}}&limit=25&access_token=${pageToken}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      console.error('IG Error:', data.error);
      return;
    }

    const posts = data.data || [];
    console.log(`Scanned ${posts.length} Instagram posts/reels.`);

    for (const post of posts) {
      const comments = post.comments?.data || [];
      for (const c of comments) {
        const replies = c.replies?.data || [];
        const hasOwnerReply = replies.some(r => r.username?.toLowerCase().includes('sujata') || r.from?.id === igUserId);
        
        results.instagram.push({
          postId: post.id,
          postUrl: post.permalink,
          postCaption: post.caption?.slice(0, 60) + '...',
          postDate: post.timestamp,
          commentId: c.id,
          author: c.username || c.from?.name || 'Unknown',
          commentText: c.text,
          commentDate: c.timestamp,
          repliesCount: replies.length,
          replies: replies.map(r => ({ author: r.username, text: r.text, date: r.timestamp })),
          hasReply: replies.length > 0,
          hasOwnerReply,
          needsReply: !hasOwnerReply
        });
      }
    }
  } catch (err) {
    console.error('Instagram check failed:', err.message);
  }
}

// 2. Check Facebook Page Comments
async function checkFacebookPageComments() {
  console.log('\n--- 2. CHECKING FACEBOOK PAGE POST COMMENTS ---');
  try {
    const url = `https://graph.facebook.com/v21.0/${pageId}/feed?fields=id,message,created_time,permalink_url,comments{id,message,created_time,from,like_count,comment_count,comments{id,message,created_time,from}}&limit=25&access_token=${pageToken}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      console.error('FB Error:', data.error);
      return;
    }

    const posts = data.data || [];
    console.log(`Scanned ${posts.length} Facebook posts.`);

    for (const post of posts) {
      const comments = post.comments?.data || [];
      for (const c of comments) {
        const replies = c.comments?.data || [];
        const hasOwnerReply = replies.some(r => r.from?.id === pageId || r.from?.name?.toLowerCase().includes('sujata'));
        
        results.facebook.push({
          postId: post.id,
          postUrl: post.permalink_url,
          postMessage: post.message?.slice(0, 60) + '...',
          postDate: post.created_time,
          commentId: c.id,
          author: c.from?.name || 'Unknown',
          authorId: c.from?.id,
          commentText: c.message,
          commentDate: c.created_time,
          repliesCount: replies.length,
          replies: replies.map(r => ({ author: r.from?.name, text: r.message, date: r.created_time })),
          hasReply: replies.length > 0,
          hasOwnerReply,
          needsReply: !hasOwnerReply
        });
      }
    }
  } catch (err) {
    console.error('Facebook check failed:', err.message);
  }
}

// 3. Check YouTube Comments
async function checkYouTubeComments() {
  console.log('\n--- 3. CHECKING YOUTUBE COMMENTS ---');
  try {
    if (!fs.existsSync('./social-credentials.json')) {
      console.log('No social-credentials.json found, skipping YT.');
      return;
    }
    const creds = JSON.parse(fs.readFileSync('./social-credentials.json', 'utf8')).youtube;
    if (!creds) {
      console.log('No YouTube credentials, skipping.');
      return;
    }

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: creds.client_id,
        client_secret: creds.client_secret,
        refresh_token: creds.refresh_token,
        grant_type: 'refresh_token'
      })
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.log('Failed to refresh YouTube token.');
      return;
    }
    const ytToken = tokenData.access_token;

    // Fetch comment threads on channel
    const ctUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&allThreadsRelatedToChannelId=mine&maxResults=50`;
    const ctRes = await fetch(ctUrl, {
      headers: { Authorization: `Bearer ${ytToken}` }
    });
    const ctData = await ctRes.json();

    if (ctData.error) {
      console.error('YouTube API Error:', ctData.error);
      return;
    }

    const threads = ctData.items || [];
    console.log(`Scanned ${threads.length} YouTube comment threads.`);

    for (const t of threads) {
      const top = t.snippet.topLevelComment.snippet;
      const totalReplies = t.snippet.totalReplyCount;
      const replies = t.replies?.comments || [];
      const hasOwnerReply = replies.some(r => r.snippet.authorDisplayName.toLowerCase().includes('sujata'));

      results.youtube.push({
        videoId: t.snippet.videoId,
        author: top.authorDisplayName,
        commentText: top.textDisplay,
        commentDate: top.publishedAt,
        replyCount: totalReplies,
        hasOwnerReply,
        needsReply: !hasOwnerReply && totalReplies === 0
      });
    }
  } catch (err) {
    console.error('YouTube check failed:', err.message);
  }
}

async function run() {
  await checkInstagramComments();
  await checkFacebookPageComments();
  await checkYouTubeComments();

  fs.writeFileSync('scripts/social_comments_audit.json', JSON.stringify(results, null, 2));

  console.log('\n================ AUDIT SUMMARY ================');
  const igPending = results.instagram.filter(c => c.needsReply);
  const fbPending = results.facebook.filter(c => c.needsReply);
  const ytPending = results.youtube.filter(c => c.needsReply);

  console.log(`Instagram Total Comments Found: ${results.instagram.length} | Pending Reply: ${igPending.length}`);
  console.log(`Facebook Total Comments Found: ${results.facebook.length} | Pending Reply: ${fbPending.length}`);
  console.log(`YouTube Total Comments Found: ${results.youtube.length} | Pending Reply: ${ytPending.length}`);

  if (igPending.length > 0) {
    console.log('\n--- PENDING INSTAGRAM COMMENTS ---');
    console.table(igPending.map(c => ({
      Post: c.postCaption?.slice(0, 30),
      Author: c.author,
      Comment: c.commentText,
      Date: new Date(c.commentDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      Url: c.postUrl
    })));
  }

  if (fbPending.length > 0) {
    console.log('\n--- PENDING FACEBOOK COMMENTS ---');
    console.table(fbPending.map(c => ({
      Post: c.postMessage?.slice(0, 30),
      Author: c.author,
      Comment: c.commentText,
      Date: new Date(c.commentDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      Url: c.postUrl
    })));
  }

  if (ytPending.length > 0) {
    console.log('\n--- PENDING YOUTUBE COMMENTS ---');
    console.table(ytPending.map(c => ({
      VideoId: c.videoId,
      Author: c.author,
      Comment: c.commentText?.slice(0, 50),
      Date: new Date(c.commentDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    })));
  }
}

run().catch(console.error);
