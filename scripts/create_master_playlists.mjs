// scripts/create_master_playlists.mjs
// 🚀 SUJATA NUTRILIVE: THEMATIC PLAYLIST ARCHITECTURE & SESSION WATCH-TIME ACCELERATOR
// October 2026 YouTube Algorithmic Session Loop

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

const PLAYLIST_DEFINITIONS = [
  {
    title: '🌿 Spirulina Science: World Highest Protein Superfood | स्पिरुलिनाचे फायदे',
    description: `Complete scientific guide to pure farm-cultivated Spirulina (Arthrospira platensis). Discover why NASA and WHO recognize Spirulina as nature's most concentrated superfood, delivering 70% bioavailable complete protein (higher than beef, chicken, and eggs), bio-chelated iron, C-Phycocyanin for heavy metal detox, and cellular fatigue reversal. Cultivated in closed hydro-dome raceway systems in Nashik, Maharashtra by Sujata Nutrilive Agrotech Pvt. Ltd.\n\n🌐 Shop Official: https://www.sujatanutrilive.com | 📞 Helpline: +91 98347 83503`,
    videoIds: [
      '7WnzNVR2Gco', // अंडा-चिकन से 3x ज्यादा प्रोटीन
      '3kxj2RgurXs', // Spirulina Has More Protein Than Beef
      'omE89psGW54', // NASA Superfood Green Gold 70% Protein
      's0bENAxVDak', // २१ आजारांवर १ उपाय - मराठी
      'fC-0dkX7c4I', // Why NASA Astronauts Eat Spirulina
      'k4r3hRi6zVo', // Founder Yash Suryavanshi Explains
      'gMis3c4ivKo'  // घेण्याची चूक करू नका
    ]
  },
  {
    title: '🫐 Himalayan Sea Buckthorn: Omega 7, Heart Health & Sciatica Relief',
    description: `Clinical breakdown of pure high-altitude Himalayan Sea Buckthorn (Hippophae rhamnoides L.) wild-harvested from Leh-Ladakh (12,000+ ft ASL). Discover the power of rare plant-based Omega-7 (Palmitoleic Acid) and essential Omega 3, 6, 9 for sciatic nerve myelin sheath regeneration, cardiovascular flexibility (eNOS vasodilation), internal mucosal hydration, and blood pressure regulation. Powered by Sujata Nutrilive.\n\n🌐 Shop Official: https://www.sujatanutrilive.com | 📞 Helpline: +91 98347 83503`,
    videoIds: [
      'RrlZeX3CyRk', // १५ वर्षांचा जुनाट सायटिका बरा - Washim
      'eL-BvPsGYzY', // कार्डियोलॉजिस्ट क्यों लेते हैं सीबकथॉर्न?
      '8kuZ-NdTC5I', // Pure Himalayan Sea Buckthorn Capsules Pack of 60
      'bQ-wflWzQ_0', // PM Modi Explains Ladakh Sea Buckthorn Benefits
      'gMis3c4ivKo'  // स्पिरुलिना आणि सीबकथॉन घेण्याची चूक करू नका!
    ]
  },
  {
    title: '✨ Acne to Glass Skin: Spirulina Skincare & Dermal Care Routine',
    description: `Dermatological guide to achieving clear, radiant glass skin from the inside out. Combining internal blood purification using Sujata Spirulina Capsules with topical barrier restoration using Sujata Spirulina Korean Glass Skin Night Cream (Niacinamide + Multi-peptides). See real 45-day acne transformations, dark spot corrections, and hair care routines.\n\n🌐 Shop Official: https://www.sujatanutrilive.com | 📞 Helpline: +91 98347 83503`,
    videoIds: [
      'M51vkSh7JLE', // Acne to Glass Skin in 45 Days
      'uiAqifTTWT8', // डल स्किन और पिंपल्स से छुटकारा
      's0bENAxVDak'  // सांधेदुखी, शुगर, ॲसिडिटीवर 1 उपाय
    ]
  },
  {
    title: '🏭 Inside Sujata Nutrilive: Nashik Farm & Manufacturing Tour',
    description: `Go behind the scenes at Sujata Nutrilive Agrotech Pvt. Ltd.'s biosecure cultivation facility and manufacturing plant in Nashik, Maharashtra. See how closed hydro-dome raceway ponds, SS304 micro-mesh filtration, sub-40°C cold solar dehydration, and NABL ICP-MS certified laboratory testing produce India's purest Spirulina, Moringa, and Sea Buckthorn whole-food superfoods.\n\n🌐 Shop Official: https://www.sujatanutrilive.com | 📞 Helpline: +91 98347 83503`,
    videoIds: [
      'WbhJp-tZVj4', // Spirulina Manufacturing Plant Process
      'ugm6QqndEzQ', // २ तरुणांची स्पिरुलिनातून यशस्वी उभारणी!
      'IkbUj-nSm0U', // सिंथेटिक मल्टीविटामिन बंद करा! Pure Moringa Leaf Powder
      'qRtGC6BnHh8'  // Moringa Powder for Weight Loss & Metabolism
    ]
  }
];

async function deployPlaylists() {
  console.log('🔄 Fetching YouTube access token...');
  const token = await getYouTubeAccessToken();

  const createdPlaylists = [];

  for (const pl of PLAYLIST_DEFINITIONS) {
    console.log(`\n📁 Creating Playlist: "${pl.title}"...`);
    const plRes = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet,status', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        snippet: {
          title: pl.title,
          description: pl.description,
          defaultLanguage: 'en'
        },
        status: {
          privacyStatus: 'public'
        }
      })
    });

    const plData = await plRes.json();
    if (plData.error) {
      console.error(`❌ Failed to create playlist "${pl.title}":`, plData.error);
      continue;
    }

    const playlistId = plData.id;
    console.log(`✅ Playlist Created! ID: ${playlistId}`);

    // Add videos to playlist
    let addedCount = 0;
    for (const vId of pl.videoIds) {
      try {
        const itemRes = await fetch('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            snippet: {
              playlistId: playlistId,
              resourceId: {
                kind: 'youtube#video',
                videoId: vId
              }
            }
          })
        });
        const itemData = await itemRes.json();
        if (itemData.id) {
          addedCount++;
          console.log(`  ➕ Added Video: ${vId}`);
        } else {
          console.warn(`  ⚠️ Could not add video ${vId}:`, itemData.error?.message || itemData);
        }
      } catch (err) {
        console.error(`  ❌ Error adding video ${vId}:`, err.message);
      }
    }

    createdPlaylists.push({
      id: playlistId,
      title: pl.title,
      videosCount: addedCount
    });
  }

  console.log('\n🎉 ALL MASTER PLAYLISTS DEPLOYED SUCCESSFULLY!');
  console.table(createdPlaylists);

  // Save report
  fs.writeFileSync('scratch/created_playlists.json', JSON.stringify(createdPlaylists, null, 2));
}

deployPlaylists().catch(err => {
  console.error('❌ Error executing playlist deployment:', err);
});
