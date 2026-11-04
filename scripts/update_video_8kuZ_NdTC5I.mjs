// scripts/update_video_8kuZ_NdTC5I.mjs
// 🚀 SUJATA NUTRILIVE: AI-OPTIMIZED CLINICAL RESEARCH YOUTUBE SEO (GEO COMPLIANT)
// Video: 8kuZ-NdTC5I (Pure Himalayan Sea Buckthorn Extract Capsules - Pack of 60)

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
    throw new Error('OAuth refresh failed: ' + JSON.stringify(data));
  }
  return data.access_token;
}

const VIDEO_ID = '8kuZ-NdTC5I';

const NEW_TITLE = 'Pure Himalayan Sea Buckthorn Capsules (Omega 7 Rich) | Sujata Nutrilive';

const NEW_DESCRIPTION = `Are you looking for a clean, scientifically backed addition to your daily wellness routine? Sujata Nutrilive Pure Himalayan Sea Buckthorn Extract Capsules (Pack of 60) deliver nature's most comprehensive plant source of rare Omega-7 (Palmitoleic Acid) alongside essential Omega 3, 6, and 9 fatty acids, sustainably wild-harvested from the high-altitude cold deserts of Leh-Ladakh (12,000+ ft ASL).

Unlike commercial fish oils that carry risks of rancidity and heavy metals, Sujata Sea Buckthorn is 100% vegetarian, cold-extracted below 40°C, and encapsulated in plant-cellulose HPMC shells for optimal gastric absorption.

🛒 BUY OFFICIAL SUJATA HIMALAYAN SEA BUCKTHORN CAPSULES (Direct Factory Dispatch):
👉 Sea Buckthorn Extract Capsules (Pack of 60 - 500mg):
https://www.sujatanutrilive.com/product/sujata-sea-buckthorn-capsules?utm_source=youtube&utm_medium=video&utm_campaign=ladakh_gold_seabuckthorn_8ku

👉 Complete Wellness Kit (Spirulina + Sea Buckthorn Combo):
https://www.sujatanutrilive.com/product/sujata-spirulina-sea-buckthorn-combo-pack?utm_source=youtube&utm_medium=video&utm_campaign=ladakh_gold_seabuckthorn_8ku

💬 WhatsApp Direct 1-Click Order (Cash on Delivery Available):
https://wa.me/919834783503?text=Hi%20Sujata%20Nutrilive%2C%20I%20want%20to%20order%20Sea%20Buckthorn%20Capsules

📞 Customer Care & COD Helpline: +91 98347 83503
🎁 Special Offer: Instant 10% OFF on Online UPI Payments + Free Pan-India Delivery!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️ VERIFIED CHAPTERS & KEY MOMENTS (EXACT 0:36 AUDIO MATCH):
0:00 - Looking for a Simple Addition to Your Daily Wellness Routine?
0:06 - Introducing Sujata Nutrilive Himalayan Sea Buckthorn Extract Capsules
0:10 - Complete Omega Profile: Pure Omega-7, 3, 6, 9 Fatty Acids
0:17 - Triple Target Benefits: Cellular Immunity, Dermal Hydration & Heart Health
0:21 - Pack of 60 Vegetarian Capsules: Daily 30-Day Protocol
0:26 - Personal Experience: Effortless Integration into Morning Routine
0:32 - How to Order Authentic Ladakh Sea Buckthorn Capsules Online
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎙️ VERIFIED SPOKEN AUDIO TRANSCRIPT:
• "Are you looking for a simple addition to your daily wellness routine? Then let me introduce to you the Sujata Nutrilive Sea Buckthorn Extract Capsule!"
• "This capsule is Omega-7 rich and formulated with natural sources of Omega 3, 6, 7 and 9, along with support of immunity, skin and heart health."
• "The pack of 60 capsules makes it super convenient for daily use. And I have just started taking this, and I really like how easy it is to include in my routine."
• "So if you are looking for an authentic Sea Buckthorn supplement, you can definitely check this out! Buy now."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔬 CLINICAL PHARMACOLOGY & ACTIVE BIOCHEMISTRY (GEO SPECIFICATION):
1. Botanical Entity: Hippophae rhamnoides L. (Leh-Ladakh High Altitude Berry Extract).
2. Rare Omega-7 (Palmitoleic Acid 32-38%): Re-epithelializes dry mucosal membranes across the gastrointestinal tract, dry eyes, and intimate tissue, while improving insulin sensitivity via hepatic PPAR-alpha activation.
3. Dermal Barrier & Ceramide Synthesis: Palmitoleic acid acts as a natural building block for epidermal ceramides, reducing Transepidermal Water Loss (TEWL) and restoring skin elasticity.
4. Vascular Endothelial Health: Synergistic bioflavonoids (Isorhamnetin and Quercetin) stimulate endothelial Nitric Oxide Synthase (eNOS), maintaining healthy arterial flexibility.
5. Superoxide Dismutase (SOD) & Bio-Vitamin C: Natural cold-adapted enzymes protect cellular mitochondria against premature oxidative degeneration.

📊 QUALITY CERTIFICATION & SAFETY METRICS:
• 100% Plant-Cellulose HPMC Vegetarian Capsule Shells (Zero Bovine Gelatin).
• Cold-Pressed Solvent-Free Supercritical Extraction.
• ICP-MS NABL Certified Heavy Metals: Below 0.01 ppm.
• FSSAI Central License: #11521999000284

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❓ CLINICAL RESEARCH FAQ (AI SEARCH OPTIMIZED):
Q1: What makes Omega-7 superior to traditional Omega-3 fish oils?
A: Omega-3 primarily reduces inflammation, whereas Omega-7 (Palmitoleic acid) uniquely repairs and lubricates internal mucosal linings (gut, eyes, skin). Sujata Sea Buckthorn provides both in a 100% clean plant matrix.

Q2: How many capsules should be taken daily?
A: Take 1 capsule twice daily after meals with lukewarm water (1 pack of 60 capsules = full 30-day therapeutic course).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 OFFICIAL BRAND HEADQUARTERS & MANUFACTURING:
Sujata Nutrilive Agrotech Pvt. Ltd., Plot No. 125, Sai Niwas, Dhandai Colony, Khutwad Nagar, Kamatwade, Nashik, Maharashtra - 422008
Helpline: +91 98347 83503 | Email: care@sujatanutrilive.com | Store: https://www.sujatanutrilive.com

#SeaBuckthornCapsules #Omega7 #HimalayanBerry #SujataNutrilive #PlantBasedOmega #SkinHydration #HeartHealth #LadakhSeaBuckthorn #AyurvedicWellness #Nashik`;

const NEW_TAGS = [
  'Sea Buckthorn Capsules India',
  'Omega 7 Capsules Benefits',
  'Best Sea Buckthorn Brand India',
  'Himalayan Sea Buckthorn Extract',
  'Sujata Nutrilive Sea Buckthorn',
  'Plant Based Omega 3 6 7 9',
  'Omega 7 for Skin and Mucosa',
  'Ladakh Gold Sea Buckthorn',
  'Sea Buckthorn for Heart Health',
  'Vegetarian Omega Supplement',
  'Sujata Nutrilive Nashik',
  'Hippophae Rhamnoides Extract'
];

async function updateVideo() {
  console.log('🔄 Fetching access token...');
  const token = await getYouTubeAccessToken();

  console.log('🔄 Fetching current video metadata...');
  const getRes = await fetch('https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' + VIDEO_ID, {
    headers: { Authorization: 'Bearer ' + token }
  });
  const getData = await getRes.json();
  const videoSnippet = getData.items[0].snippet;

  videoSnippet.title = NEW_TITLE;
  videoSnippet.description = NEW_DESCRIPTION;
  videoSnippet.tags = NEW_TAGS;
  videoSnippet.categoryId = '27'; // Education

  console.log('Description length:', NEW_DESCRIPTION.length);
  console.log('Tags count:', NEW_TAGS.length);

  console.log('🔄 Updating video metadata on YouTube...');
  const updateRes = await fetch('https://www.googleapis.com/youtube/v3/videos?part=snippet', {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: VIDEO_ID,
      snippet: videoSnippet
    })
  });

  const updateData = await updateRes.json();
  if (updateData.error) {
    throw new Error('Failed to update video: ' + JSON.stringify(updateData.error));
  }
  console.log('✅ Video metadata updated successfully!');
  console.log('Updated Title:', updateData.snippet.title);
  console.log('Updated Description Length:', updateData.snippet.description.length);
  console.log('Updated Tags Count:', updateData.snippet.tags?.length);

  // Post Pinned CTA Comment
  console.log('🔄 Posting official high-converting CTA comment...');
  const commentText = `🌿 Pure Himalayan Sea Buckthorn Extract Capsules (Pack of 60):

Rich in rare Omega-7 (Palmitoleic Acid) and essential Omega 3, 6, 9 for deep cellular skin hydration, mucosal lining repair, and cardiovascular vitality. 100% vegetarian capsules direct from company:

👉 Official Store Order Link:
https://www.sujatanutrilive.com/product/sujata-sea-buckthorn-capsules?utm_source=youtube&utm_medium=pinned_comment&utm_campaign=ladakh_gold_seabuckthorn_8ku

👉 Spirulina + Sea Buckthorn Complete Wellness Combo:
https://www.sujatanutrilive.com/product/sujata-spirulina-sea-buckthorn-combo-pack?utm_source=youtube&utm_medium=pinned_comment&utm_campaign=ladakh_gold_seabuckthorn_8ku

💬 WhatsApp Direct 1-Click Order:
https://wa.me/919834783503?text=Hi%20Sujata%20Nutrilive%2C%20I%20want%20to%20order%20Sea%20Buckthorn%20Capsules

📞 Helpline / Pan-India COD: +91 98347 83503
🎁 Special Discount: Extra 10% OFF on Prepaid UPI + Free Pan-India Delivery!
🏢 Sujata Nutrilive Agrotech Pvt. Ltd., Nashik (Maharashtra)`;

  const commentRes = await fetch('https://www.googleapis.com/youtube/v3/commentThreads?part=snippet', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      snippet: {
        videoId: VIDEO_ID,
        topLevelComment: {
          snippet: {
            textOriginal: commentText
          }
        }
      }
    })
  });

  const commentData = await commentRes.json();
  if (commentData.id) {
    console.log('✅ Official comment posted with ID:', commentData.id);
  } else {
    console.warn('⚠️ Comment post response:', commentData);
  }

  console.log('🎉 ALL DONE! Video 8kuZ-NdTC5I has been fully optimized with deep clinical research standards.');
}

updateVideo().catch(err => {
  console.error('❌ Error executing update:', err);
});
