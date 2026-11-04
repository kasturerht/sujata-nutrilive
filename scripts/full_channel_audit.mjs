// scripts/full_channel_audit.mjs
// Full channel scan & analysis for Sujata Nutrilive

import fs from 'fs';

const creds = JSON.parse(fs.readFileSync('./social-credentials.json', 'utf8')).youtube;

async function getYouTubeAccessToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: creds.client_id,
      client_secret: creds.client_secret,
      refresh_token: creds.refresh_token,
      grant_type: 'refresh_token'
    })
  });
  const data = await res.json();
  if (!data.access_token) {
    throw new Error('OAuth token fetch failed: ' + JSON.stringify(data));
  }
  return data.access_token;
}

async function fullChannelAudit() {
  const token = await getYouTubeAccessToken();

  // 1. Channel Details
  const chRes = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings,contentDetails&mine=true', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const chData = await chRes.json();
  const channel = chData.items[0];
  console.log('=== CHANNEL OVERVIEW ===');
  console.log('Title:', channel.snippet.title);
  console.log('Custom URL:', channel.snippet.customUrl);
  console.log('Total Subscribers:', channel.statistics.subscriberCount);
  console.log('Total Views:', channel.statistics.viewCount);
  console.log('Total Videos:', channel.statistics.videoCount);

  // 2. Fetch Playlists
  const plListsRes = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&channelId=${channel.id}&maxResults=25`, {
    headers: { Authorization: 'Bearer ' + token }
  });
  const plListsData = await plListsRes.json();
  console.log('\n=== PLAYLISTS ===');
  console.log(`Found ${plListsData.items?.length || 0} playlists:`);
  plListsData.items?.forEach(pl => {
    console.log(`- ${pl.snippet.title} (${pl.contentDetails.itemCount} videos, ID: ${pl.id})`);
  });

  // 3. Fetch All Uploaded Videos
  const uploadsId = channel.contentDetails.relatedPlaylists.uploads;
  let allVideos = [];
  let nextPageToken = '';
  
  do {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsId}&maxResults=50${nextPageToken ? '&pageToken=' + nextPageToken : ''}`;
    const plRes = await fetch(url, {
      headers: { Authorization: 'Bearer ' + token }
    });
    const plData = await plRes.json();
    for (let item of plData.items || []) {
      allVideos.push({
        id: item.contentDetails.videoId,
        title: item.snippet.title,
        publishedAt: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url || ''
      });
    }
    nextPageToken = plData.nextPageToken;
  } while (nextPageToken);

  console.log(`\nTotal Videos Found in Uploads: ${allVideos.length}`);

  // 4. Batch Fetch Statistics & Details (in chunks of 50)
  const videoBatches = [];
  for (let i = 0; i < allVideos.length; i += 50) {
    videoBatches.push(allVideos.slice(i, i + 50));
  }

  let enrichedVideos = [];
  for (const batch of videoBatches) {
    const ids = batch.map(v => v.id).join(',');
    const vRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${ids}`, {
      headers: { Authorization: 'Bearer ' + token }
    });
    const vData = await vRes.json();
    for (let item of vData.items || []) {
      enrichedVideos.push({
        id: item.id,
        title: item.snippet.title,
        publishedAt: item.snippet.publishedAt,
        duration: item.contentDetails.duration,
        views: parseInt(item.statistics.viewCount || '0', 10),
        likes: parseInt(item.statistics.likeCount || '0', 10),
        comments: parseInt(item.statistics.commentCount || '0', 10),
        tagsCount: item.snippet.tags?.length || 0,
        tags: item.snippet.tags || [],
        descLength: item.snippet.description?.length || 0,
        categoryId: item.snippet.categoryId,
        hasCustomThumbnail: item.contentDetails.hasCustomThumbnail
      });
    }
  }

  // Sort by views descending
  enrichedVideos.sort((a, b) => b.views - a.views);

  fs.writeFileSync('scratch/full_channel_audit.json', JSON.stringify({
    channel: {
      id: channel.id,
      title: channel.snippet.title,
      customUrl: channel.snippet.customUrl,
      subscribers: channel.statistics.subscriberCount,
      views: channel.statistics.viewCount,
      videoCount: channel.statistics.videoCount,
      description: channel.snippet.description,
      brandingSettings: channel.brandingSettings
    },
    playlists: plListsData.items || [],
    videos: enrichedVideos
  }, null, 2));

  console.log('\n=== TOP 10 MOST VIEWED VIDEOS ON CHANNEL ===');
  enrichedVideos.slice(0, 10).forEach((v, idx) => {
    console.log(`[${idx+1}] ${v.views} views | ${v.likes} likes | ${v.title} (${v.id}, ${v.duration}, ${v.publishedAt.slice(0, 10)})`);
  });

  console.log('\n=== 10 RECENT VIDEOS ===');
  const recentVideos = [...enrichedVideos].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)).slice(0, 10);
  recentVideos.forEach((v, idx) => {
    console.log(`[${idx+1}] ${v.publishedAt.slice(0, 10)} | ${v.views} views | ${v.title} (${v.id})`);
  });

  const totalViews = enrichedVideos.reduce((acc, v) => acc + v.views, 0);
  const avgViews = Math.round(totalViews / (enrichedVideos.length || 1));
  console.log(`\nAudit Complete! Saved to scratch/full_channel_audit.json`);
  console.log(`Total Channel Views: ${totalViews} | Average Views: ${avgViews}`);
}

fullChannelAudit().catch(console.error);
