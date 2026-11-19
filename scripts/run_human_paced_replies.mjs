import fs from 'fs';
import {
  detectLanguage,
  generateSmartReply,
  replyCommentFacebook,
  replyFacebookInboxThread,
  replyInstagramComment,
  sleep,
  randomBetween
} from './smart_human_replier.mjs';

// Load state or initialize
const STATE_FILE = 'scripts/reply_execution_state.json';
let state = { completed: {}, failed: {}, log: [] };
if (fs.existsSync(STATE_FILE)) {
  try {
    state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (e) {}
}

// Function to save state
function saveState() {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// Prepare Queue: Top Priority / Fresh Items
async function buildFreshQueue() {
  const drafts = JSON.parse(fs.readFileSync('scratch/all_pending_replies_drafts.json', 'utf8'));
  const queue = [];

  // 1. FB Inbox (All 11 threads)
  drafts.fbInbox.forEach(item => {
    if (!state.completed[item.threadId]) {
      queue.push({
        type: 'FB_INBOX',
        id: item.threadId,
        author: item.customerName,
        text: item.lastMessage,
        date: item.date
      });
    }
  });

  // 2. Meta Ads (Oct-Nov 2026 Fresh Comments)
  drafts.metaAds.forEach(item => {
    // Only genuine comments (skip blank or spam)
    if (!state.completed[item.commentId] && item.commentText && item.commentText.trim().length > 1 && !item.commentText.includes('IMFA CARE GROUP') && item.date >= '2026-10-01') {
      queue.push({
        type: 'META_AD_COMMENT',
        id: item.commentId,
        author: item.author,
        text: item.commentText,
        date: item.date
      });
    }
  });

  // 3. FB Organic Feed (Oct 2026)
  (drafts.fbFeed || []).forEach(item => {
    if (!state.completed[item.commentId] && item.date >= '2026-10-01') {
      queue.push({
        type: 'FB_FEED_COMMENT',
        id: item.commentId,
        author: item.author,
        text: item.commentText,
        date: item.date
      });
    }
  });

  // 4. IG Organic (Fresh Aug-Nov 2026)
  drafts.instagram.forEach(item => {
    if (!state.completed[item.commentId] && item.date >= '2026-08-01' && !item.commentText.includes('http')) {
      queue.push({
        type: 'IG_COMMENT',
        id: item.commentId,
        author: item.author,
        text: item.commentText,
        date: item.date
      });
    }
  });

  return queue;
}

// Main execution function
async function run() {
  const isDryRun = process.argv.includes('--dry-run');
  const queue = await buildFreshQueue();

  console.log(`====================================================`);
  console.log(`SMART HUMAN-PACED SOCIAL REPLIER ENGINE`);
  console.log(`Mode: ${isDryRun ? 'DRY-RUN (Simulating only)' : 'LIVE EXECUTION (Sending real replies)'}`);
  console.log(`Total Pending in Fresh Priority Queue: ${queue.length}`);
  console.log(`====================================================\n`);

  if (queue.length === 0) {
    console.log("No pending items in queue! All completed.");
    return;
  }

  // Shuffle queue slightly so order is organic and natural
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }

  let processedInThisSession = 0;

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    const lang = detectLanguage(item.text);
    const replyText = generateSmartReply(item.text, item.author, item.type);

    console.log(`\n----------------------------------------------------`);
    console.log(`[${i + 1}/${queue.length}] ${item.type} | ID: ${item.id}`);
    console.log(`Author: ${item.author} | Date: ${item.date}`);
    console.log(`Lang: [${lang.toUpperCase()}] | Message: "${item.text.replace(/\n/g, ' ').slice(0, 50)}"`);
    console.log(`Proposed Smart Reply:\n${replyText}`);

    if (!isDryRun) {
      try {
        let res = null;
        if (item.type === 'FB_INBOX') {
          res = await replyFacebookInboxThread(item.id, replyText);
        } else if (item.type === 'META_AD_COMMENT' || item.type === 'FB_FEED_COMMENT') {
          res = await replyCommentFacebook(item.id, replyText);
        } else if (item.type === 'IG_COMMENT') {
          res = await replyInstagramComment(item.id, replyText);
        }

        if (res && (res.id || res.message_id || res.success)) {
          console.log(`✅ SUCCESS! Response ID: ${res.id || res.message_id}`);
          state.completed[item.id] = {
            at: new Date().toISOString(),
            replyId: res.id || res.message_id,
            lang,
            replyText
          };
        } else {
          console.error(`❌ FAILED / REJECTED:`, JSON.stringify(res));
          state.failed[item.id] = {
            at: new Date().toISOString(),
            error: res?.error?.message || 'Unknown'
          };
        }
      } catch (err) {
        console.error(`❌ EXCEPTION:`, err.message);
        state.failed[item.id] = { at: new Date().toISOString(), error: err.message };
      }

      saveState();
      processedInThisSession++;

      // If more items remain, implement anti-bot human delays
      if (i < queue.length - 1) {
        // Every 3 to 4 messages, take a longer human coffee/tea break
        if (processedInThisSession % randomBetween(3, 4) === 0) {
          const humanBreakSec = randomBetween(65, 120);
          console.log(`\n☕ [HUMAN BREAK] Pausing for ${humanBreakSec} seconds (simulating natural human idle time)...`);
          await sleep(humanBreakSec * 1000);
        } else {
          const jitterSec = randomBetween(20, 42);
          console.log(`\n⏳ [RANDOM DELAY] Waiting ${jitterSec} seconds before typing next reply...`);
          await sleep(jitterSec * 1000);
        }
      }
    }
  }

  console.log(`\n====================================================`);
  console.log(`SESSION COMPLETE! Processed: ${processedInThisSession}`);
  console.log(`====================================================`);
}

run().catch(console.error);
