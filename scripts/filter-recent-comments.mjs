import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scripts/ad_comments_audit.json', 'utf8'));
const pending = data.pendingAdComments || [];

console.log('Total pending ad comments:', pending.length);

// Filter by ACTIVE ads and recent (October 2026)
const activeAdComments = pending.filter(c => c.adStatus === 'ACTIVE');
console.log('Pending on ACTIVE Ads:', activeAdComments.length);

// Sort by date desc
activeAdComments.sort((a, b) => new Date(b.date) - new Date(a.date));

console.log('\n--- TOP RECENT COMMENTS ON ACTIVE ADS (OCTOBER 2026) ---');
console.table(activeAdComments.slice(0, 15).map(c => ({
  Ad: c.adName,
  Comment: c.comment,
  Date: new Date(c.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  StoryId: c.storyId
})));

fs.writeFileSync('scripts/recent_active_ad_comments.json', JSON.stringify(activeAdComments, null, 2));
