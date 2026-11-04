import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const adsToken = env.META_ADS_ACCESS_TOKEN;
const postId = '122224882352447084'; // from tracking_specs post: 122224882352447084

async function checkAdComments() {
  console.log("Checking comments on ad post:", postId);
  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${postId}/comments?fields=id,from,message,created_time,like_count,comments{id,message,from}&access_token=${adsToken}`);
    const data = await res.json();
    console.log("Comments on ad post:", JSON.stringify(data, null, 2));
  } catch(e) {
    console.error("Error fetching comments:", e.message);
  }
}

checkAdComments();
