// scripts/get_all_yesterday_campaigns.mjs
import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('scripts/meta_yesterday_raw.json', 'utf8'));

// Telecaller phone mappings from NexaLeads database
const TELECALLER_MAP = {
  '9922500344': 'Punam Shirsath (पूनम शिरसाठ)',
  '9922534443': 'Vaishnavi Divate (वैष्णवी दिवटे)',
  '9922577344': 'Karishma Patil (करिष्मा पाटील)',
  '9272471529': 'Monu / Darshan Bayas (मोनू)'
};

console.log('--- ALL ACTIVE CAMPAIGNS YESTERDAY (2026-10-26) ---');

let grandTotalWhatsappLeads = 0;
let grandTotalSpend = 0;

raw.data.forEach((row, i) => {
  let whatsappConversations = 0;
  let firstReply = 0;
  let leadsGrouped = 0;

  (row.actions || []).forEach(a => {
    if (a.action_type === 'onsite_conversion.messaging_conversation_started_7d') {
      whatsappConversations = parseInt(a.value || 0);
    }
    if (a.action_type === 'onsite_conversion.messaging_first_reply') {
      firstReply = parseInt(a.value || 0);
    }
    if (a.action_type === 'onsite_conversion.lead_grouped') {
      leadsGrouped = parseInt(a.value || 0);
    }
  });

  const spend = parseFloat(row.spend || 0);
  grandTotalSpend += spend;
  grandTotalWhatsappLeads += whatsappConversations;

  // Extract phone from campaign name
  const phoneMatch = row.campaign_name.match(/(\d{10})/);
  const phone = phoneMatch ? phoneMatch[1] : 'Website / No Phone';
  const telecaller = TELECALLER_MAP[phone] || 'Website Sales Campaign (No Telecaller)';

  console.log(`\n#${i + 1}: ${row.campaign_name}`);
  console.log(`  Ad: ${row.ad_name} (${row.ad_id})`);
  console.log(`  Telecaller Assigned: ${telecaller}`);
  console.log(`  WhatsApp Number: ${phone}`);
  console.log(`  Spend: ₹${spend.toFixed(2)}`);
  console.log(`  WhatsApp Conversations Started (Leads): ${whatsappConversations}`);
  console.log(`  Messaging First Replies: ${firstReply}`);
});

console.log(`\n======================================================`);
console.log(`TOTAL WHATSAPP LEADS YESTERDAY: ${grandTotalWhatsappLeads}`);
console.log(`TOTAL SPEND YESTERDAY: ₹${grandTotalSpend.toFixed(2)}`);
console.log(`======================================================`);
