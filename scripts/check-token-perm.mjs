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

const pageToken = env.META_PAGE_ACCESS_TOKEN;

async function checkToken() {
  const res = await fetch(`https://graph.facebook.com/v21.0/me?access_token=${pageToken}&fields=id,name`);
  const data = await res.json();
  console.log('Me response:', data);

  // Check an actual comment from recent active ads
  const adComments = JSON.parse(fs.readFileSync('scripts/recent_active_ad_comments.json', 'utf8'));
  console.log('Sample ad comment ID:', adComments[0]?.commentId);
}

checkToken().catch(console.error);
