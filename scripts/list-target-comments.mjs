import fs from 'fs';

const activeAdComments = JSON.parse(fs.readFileSync('scripts/recent_active_ad_comments.json', 'utf8'));
console.log(`Active Ad Comments count: ${activeAdComments.length}`);

activeAdComments.forEach((c, i) => {
  console.log(`\n[${i+1}] ID: ${c.commentId}`);
  console.log(`    Date: ${new Date(c.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
  console.log(`    Ad: ${c.adName}`);
  console.log(`    Comment: "${c.comment}"`);
});

// Also check Instagram pending comments
const socialData = JSON.parse(fs.readFileSync('scripts/social_comments_audit.json', 'utf8'));
const igPending = (socialData.instagram || []).filter(c => c.needsReply);
console.log(`\nIG Pending Comments count: ${igPending.length}`);
igPending.slice(0, 10).forEach((c, i) => {
  console.log(`\n[IG ${i+1}] ID: ${c.commentId} | User: @${c.author}`);
  console.log(`    Date: ${new Date(c.commentDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
  console.log(`    Comment: "${c.commentText}"`);
  console.log(`    Post URL: ${c.postUrl}`);
});
