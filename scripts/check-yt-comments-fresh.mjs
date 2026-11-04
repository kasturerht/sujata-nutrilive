// scripts/check-yt-comments-fresh.mjs
import fs from 'fs';
import path from 'path';

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

async function checkYouTube() {
  console.log("=== CHECKING YOUTUBE COMMENTS ===");
  const clientId = env.YOUTUBE_CLIENT_ID;
  const clientSecret = env.YOUTUBE_CLIENT_SECRET;
  const refreshToken = env.YOUTUBE_REFRESH_TOKEN;

  console.log("Client ID:", clientId?.slice(0, 20) + "...");
  console.log("Has refresh token:", !!refreshToken);

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });
  const data = await res.json();
  console.log("OAuth response:", data.access_token ? "SUCCESS" : data);

  if (data.access_token) {
    const ytToken = data.access_token;
    
    // 1. Get channel comments
    const ctUrl = 'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&allThreadsRelatedToChannelId=mine&maxResults=50';
    const ctRes = await fetch(ctUrl, {
      headers: { Authorization: `Bearer ${ytToken}` }
    });
    const ctData = await ctRes.json();
    console.log("CommentThreads API HTTP:", ctRes.status);
    const items = ctData.items || [];
    console.log(`Found ${items.length} YouTube comment threads:`);

    const unreplied = [];
    items.forEach(it => {
      const top = it.snippet.topLevelComment.snippet;
      const repliesCount = it.snippet.totalReplyCount;
      const hasReplies = repliesCount > 0;
      console.log(`- [${top.publishedAt}] ${top.authorDisplayName}: "${top.textDisplay}" (Replies: ${repliesCount})`);
      if (!hasReplies) {
        unreplied.push({
          videoId: it.snippet.videoId,
          author: top.authorDisplayName,
          comment: top.textDisplay,
          publishedAt: top.publishedAt
        });
      }
    });

    console.log(`\nUnreplied YouTube comments: ${unreplied.length}`);
    fs.writeFileSync('scripts/yt_comments_audit.json', JSON.stringify({ items, unreplied }, null, 2));
  }
}

checkYouTube().catch(console.error);
