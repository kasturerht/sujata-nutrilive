// scripts/update_channel_master_seo.mjs
// 🚀 SUJATA NUTRILIVE: MASTER CHANNEL-LEVEL SEO & KNOWLEDGE GRAPH ARCHITECTURE (OCTOBER 2026)
// Targets: Google Knowledge Graph Entity Vectoring, YouTube Browse Seeds, and AI Overviews (GEO)

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

const CHANNEL_ID = 'UCo64JfPDsImjQGc9Aju-T2g';

const CHANNEL_DESCRIPTION = `Welcome to the official YouTube channel of Sujata Nutrilive Agrotech Pvt. Ltd. (Nashik, Maharashtra) — India's premier biotechnology and pure whole-food nutraceutical authority.

🔬 WHO WE ARE & OUR MISSION:
At Sujata Nutrilive, we bridge the gap between ancient superfood wisdom and cutting-edge cellular biochemistry. We specialize in the precision cultivation, clinical extraction, and biosecure manufacturing of nature's most nutrient-dense botanicals — entirely free from synthetic chemicals, artificial fillers, animal gelatin, or toxic additives.

🌿 OUR CORE THERAPEUTIC & NUTRACEUTICAL DIVISIONS:
1. Pure Farm-Cultivated Spirulina (Arthrospira platensis):
Cultivated in our state-of-the-art closed hydro-dome raceway systems in Nashik, Maharashtra. Delivering 60% to 70% bioavailable complete protein (PDCAAS = 1.0), bio-chelated iron, and active C-Phycocyanin for cellular energy, mitochondrial ATP generation, heavy metal detoxification, and immune modulation.

2. Pure Himalayan Sea Buckthorn (Hippophae rhamnoides L.):
Sustainably wild-harvested from the pristine high-altitude cold deserts of Leh-Ladakh (12,000+ ft ASL). Rich in rare plant-based Omega-7 (Palmitoleic Acid) alongside Omega 3, 6, and 9 for cardiovascular vitality, endothelial vasodilation (eNOS), mucosal lining repair, and chronic sciatic nerve relief.

3. Cellular Skincare & Dermal Barrier Restoration:
Formulated with micro-encapsulated Spirulina extract, pure Niacinamide, and multi-peptides to target cystic acne, post-inflammatory hyperpigmentation (PIH), and collagen breakdown for a luminous Korean glass skin finish.

4. Organic Moringa Leaf Superfood:
100% whole-leaf shade-dried moringa offering dense bioavailable vitamins, isothiocyanates, and chlorogenic acid as a clean, chemical-free alternative to synthetic multivitamins.

🏭 SCIENTIFIC MANUFACTURING & QUALITY STANDARDS:
• Biosecure Closed-Dome Cultivation (Protected from acid rain, bird droppings, and industrial pollutants).
• Sub-40°C Cold Solar Dehydration to preserve thermolabile enzymes (Superoxide Dismutase) and Phycocyanin.
• ICP-MS NABL Tested: Heavy Metals (Lead, Mercury, Cadmium, Arsenic) Below 0.01 ppm.
• 100% Plant-Cellulose HPMC Vegetarian Capsules (Zero Bovine Gelatin).
• FSSAI Central License: #11521999000284 | GMP & ISO 9001:2015 Certified.

📦 SHOP DIRECT FROM OUR NASHIK MANUFACTURING FACILITY:
🌐 Official Store: https://www.sujatanutrilive.com
💬 WhatsApp Direct Helpline & COD Booking: +91 98347 83503
📧 Customer Support: care@sujatanutrilive.com
🏢 Headquarters: Plot No. 125, Sai Niwas, Dhandai Colony, Khutwad Nagar, Kamatwade, Nashik, Maharashtra - 422008

Subscribe for weekly clinical breakdowns, customer transformations, superfood science, and authentic farm-to-bottle tours!`;

const CHANNEL_KEYWORDS = `"Sujata Nutrilive" "Spirulina" "Sea Buckthorn" "Spirulina Benefits" "Sea Buckthorn Capsules" "Omega 7" "Moringa Powder" "Spirulina Korean Cream" "Spirulina vs Beef" "Best Spirulina in India" "Sciatica Relief" "High Protein Superfood" "Nashik Spirulina Farm" "Spirulina Manufacturing Process" "Ayurvedic Superfoods" "Phycocyanin" "Spirulina for Skin" "Vegan Protein India" "Himalayan Sea Buckthorn" "Arthrospira platensis"`;

async function updateChannelMasterSEO() {
  console.log('🔄 Fetching YouTube access token...');
  const token = await getYouTubeAccessToken();

  console.log('Description Length:', CHANNEL_DESCRIPTION.length, '(Limit: 1000 chars on some interfaces, up to 4000 on brandingSettings)');
  console.log('Keywords:', CHANNEL_KEYWORDS);

  console.log('🔄 Updating Channel Branding Settings on YouTube...');
  const updateRes = await fetch('https://www.googleapis.com/youtube/v3/channels?part=brandingSettings', {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: CHANNEL_ID,
      brandingSettings: {
        channel: {
          title: 'Sujata Nutrilive',
          description: CHANNEL_DESCRIPTION,
          keywords: CHANNEL_KEYWORDS,
          country: 'IN',
          defaultLanguage: 'en'
        }
      }
    })
  });

  const updateData = await updateRes.json();
  if (updateData.error) {
    throw new Error('Failed to update channel: ' + JSON.stringify(updateData.error));
  }

  console.log('✅ Channel Master SEO Updated Successfully!');
  console.log('Live Title:', updateData.brandingSettings.channel.title);
  console.log('Live Description Length:', updateData.brandingSettings.channel.description?.length);
  console.log('Live Keywords Count:', updateData.brandingSettings.channel.keywords?.split(' ').length);
  console.log('Live Country:', updateData.brandingSettings.channel.country);
}

updateChannelMasterSEO().catch(err => {
  console.error('❌ Error executing channel update:', err);
});
