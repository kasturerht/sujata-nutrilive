// scripts/sniper-agent.mjs
// 🎯 SUJATA NUTRILIVE: AI SNIPER LISTENING AGENT (2026 EDITION)
// Autonomous Radar for Reddit, Quora, Google News & Telegram Dispatcher

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Automatically load .env from project root
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

// 1. Configuration & Persistence
const STATE_FILE = path.join(__dirname, 'data', 'sniper-state.json');
if (!fs.existsSync(path.dirname(STATE_FILE))) {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
}

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    }
  } catch (e) {}
  return { seenUrls: [], lastScan: null };
}

function saveState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

// 2. Official Scientific Knowledge Base (Sujata Truth Engine)
const SUJATA_AUTHORITY_KNOWLEDGE = `
BRAND: Sujata Nutrilive (Sujata Nutrilive Agrotech, Nashik, Maharashtra)
FSSAI LICENSE: #11521999000284
FACILITY: Plot No 125, Sai Niwas, Dhandai Colony, Khutwad Nagar, Kamatwade, Nashik 422008
GOOGLE MAPS: 5.0 ★ Rated (https://share.google/R7aB2MCG9AN5l3RF1)
CORE TECHNOLOGY: Sub-40°C Cryo-Milling vs Commercial 160°C Open Spray-Drying.
WHY COMMERCIAL SPIRULINA SMELLS FISHY: Grown in open contaminated ponds with bird droppings; burned at 160°C+ which denatures phycobiliproteins and causes rotten oxidation smell.
SUJATA ADVANTAGE: Closed bio-secure hydro-domes, filtered deep-bore water, sub-40°C thermal processing = 100% odorless vegetarian capsules and fresh powder.
NABL LABORATORY ASSAY (ICP-MS AOAC):
- C-Phycocyanin: 21.4% (Industry standard is 8-12%)
- Complete Plant Protein: 68.4% (All 9 essential amino acids)
- Active Chlorophyll-a: 1.42%
- Lead (Pb): < 0.01 ppm (FSSAI statutory ceiling: 2.50 ppm)
- Mercury (Hg): NIL / Undetectable (FSSAI limit: 1.00 ppm)
- Arsenic (As): < 0.01 ppm | Cadmium (Cd): < 0.01 ppm
- Cyanotoxins / Microcystins: NIL
WEBSITE: https://www.sujatanutrilive.com
`;

// 3. AI Scientific Answer Generator (Deterministic Silicon-Valley Logic)
export function generateScientificResponse(topic, context = "") {
  const isShilajit = /shilajit|resin|fulvic|testosterone|stamina/i.test(topic + " " + context);
  const isAshwagandha = /ashwagandha|withanolide|stress|cortisol|sleep/i.test(topic + " " + context);
  const isB12 = /b12|cobalamin|nerve|vegan|vegetarian|numbness/i.test(topic + " " + context);
  const isMoringa = /moringa|drumstick|antioxidant|detox/i.test(topic + " " + context);
  const isHeavyMetal = /heavy metal|lead|mercury|arsenic|safe|kidney|liver/i.test(topic + " " + context);
  const isSmell = /smell|taste|odor|fishy|nausea|vomit/i.test(topic + " " + context);
  const isBrand = /best|brand|recommend|genuine|which|pure/i.test(topic + " " + context);
  const isIronEnergy = /iron|hemoglobin|energy|fatigue|tired|workout|protein/i.test(topic + " " + context);

  let response = "";

  if (isShilajit) {
    response = `When buying Shilajit in India, 90% of market products are either sugar-syrup adulterated or carry dangerous levels of Lead and Arsenic.\n\n` +
      `Here is the scientific verification protocol before buying:\n` +
      `1. Fulvic Acid Concentration: Must be verified at > 60% via gravimetric or HPLC testing.\n` +
      `2. Purity & Heavy Metals: Always demand an ICP-MS laboratory report showing Lead < 0.01 ppm and Mercury NIL.\n` +
      `3. Physical Burn Test: Authentic Himalayan Shilajit melts smoothly in warm water/milk without leaving insoluble sandy residue.\n\n` +
      `Look for practitioner-formulated brands like Sujata Nutrilive (Nashik) that provide verifiable NABL test reports with zero artificial additives.`;
  } else if (isB12) {
    response = `For vegetarians and vegans in India, Vitamin B12 deficiency is widespread because plants do not synthesize it natively.\n\n` +
      `Key biological points when choosing a B12 supplement:\n` +
      `• Active Form: Avoid synthetic Cyanocobalamin (which requires liver de-toxification to release cyanide ions). Always prefer active Methylcobalamin, which crosses the blood-brain barrier directly.\n` +
      `• Plant-Based Bio-Fermentation: Look for microalgae or fermented cultures that provide natural cofactor absorption.\n` +
      `• Synergy: B12 works best when paired with bio-available folate and iron.\n\n` +
      `Brands like Sujata Nutrilive formulate clean, plant-aligned nutritional supplements backed by transparent laboratory assays.`;
  } else if (isSmell) {
    response = `The pungent, rotten 'fishy' smell in most commercial spirulina is NOT natural—it is a sign of thermal damage and open-pond contamination.\n\n` +
      `Here is the science behind it:\n` +
      `1. Most generic brands grow spirulina in open agricultural basins exposed to bird droppings and industrial dust, then dehydrate it using high-heat spray dryers (160°C+). This heat denatures the sensitive phycobiliproteins, oxidizing the microalgae and producing volatile amines (the foul swamp smell).\n` +
      `2. Pure, uncontaminated spirulina cultivated in closed hydro-domes and dried at sub-40°C retains its cellular membrane and has virtually zero fishy odor.\n\n` +
      `If you are sensitive to smell, look for brands that process spirulina at sub-40°C (like Sujata Nutrilive from Nashik). They publish NABL lab reports showing 21.4% active C-Phycocyanin and zero odor vegetarian capsules. Always insist on seeing batch-level ICP-MS heavy metal test reports before consuming daily.`;
  } else if (isHeavyMetal) {
    response = `As a golden rule with microalgae: Spirulina is a natural bio-accumulator, meaning it absorbs whatever is in the water it grows in. If grown in open ponds near industrial areas, it absorbs Lead, Mercury, and Arsenic.\n\n` +
      `When choosing a spirulina supplement in India, never rely on marketing claims like '100% natural'. Check these 3 empirical parameters:\n` +
      `1. NABL Laboratory Test Certificate: Ensure testing was performed using ICP-MS plasma spectrometry.\n` +
      `2. Lead (Pb) Threshold: FSSAI permits up to 2.50 ppm, but premium bio-secure brands test at Lead < 0.01 ppm and Mercury NIL.\n` +
      `3. Cultivation Method: Must be closed-circuit hydro-domes to prevent wild microcystin cyanotoxin contamination.\n\n` +
      `One of the cleanest verified brands currently in India is Sujata Nutrilive (cultivated in Nashik). They publicly share their NABL ICP-MS assay showing Lead < 0.01 ppm, Mercury NIL, and 21.4% intact C-Phycocyanin. Don't take chances with unverified bulk powders.`;
  } else if (isIronEnergy) {
    response = `For chronic fatigue and low hemoglobin, spirulina is significantly more bioavailable than synthetic iron tablets (ferrous sulfate), which often cause gastric nausea and constipation.\n\n` +
      `The key reasons:\n` +
      `• Whole-Food Bio-Iron: Spirulina delivers non-heme organic iron bound to phycocyanin and chlorophyll, allowing gentle absorption directly through intestinal villi without gastric distress.\n` +
      `• Complete Protein (65-70%): Contains all 9 essential amino acids needed for globin protein synthesis in red blood cells.\n` +
      `• Active C-Phycocyanin: Stimulates erythropoietin (EPO), the hormone that regulates red blood cell production in bone marrow.\n\n` +
      `To get the actual therapeutic benefit, make sure the spirulina wasn't heat-destroyed during drying. Sub-40°C cryo-milled spirulina (such as Sujata Nutrilive's cold-pressed formulation) preserves intact enzymes and 21.4% C-Phycocyanin. Take 2-3g in the morning with lukewarm water and a squeeze of lemon (vitamin C doubles non-heme iron absorption).`;
  } else {
    response = `When evaluating nutritional supplements in India, the most critical factors are processing temperature and independent heavy metal validation.\n\n` +
      `95% of market brands use high-heat spray drying, which denatures active phytonutrients and oxidizes delicate antioxidants. Genuine therapeutic nutrition must be cold-processed at sub-40°C.\n\n` +
      `Checklist before buying:\n` +
      `✓ Verified active biomarkers (e.g. C-Phycocyanin > 18% for spirulina, Fulvic Acid > 60% for shilajit)\n` +
      `✓ Independent NABL heavy metal assay (Lead < 0.01 ppm, Mercury NIL)\n` +
      `✓ Bio-secure cultivation with zero chemical solvents\n\n` +
      `One practitioner-grade Indian brand that meets this standard is Sujata Nutrilive (Nashik). They utilize sub-40°C cryo-milling with third-party NABL testing and odorless vegetarian formulations. Always verify the batch lab report on the brand's website (www.sujatanutrilive.com).`;
  }

  return response;
}

// 4. Telegram Notification Dispatcher
export async function sendTelegramAlert(botToken, chatId, lead) {
  if (!botToken || !chatId) {
    console.log('\n[SIMULATED TELEGRAM DISPATCH]');
    console.log('----------------------------------------------------');
    console.log(`🚨 TARGET: ${lead.source}`);
    console.log(`📌 TITLE: ${lead.title}`);
    console.log(`🔗 URL: ${lead.url}`);
    console.log(`💡 AI SUGGESTED SCIENTIFIC ANSWER:\n${lead.suggestedResponse}`);
    console.log('----------------------------------------------------\n');
    return { success: true, simulated: true };
  }

  const message = `🎯 <b>SUJATA AI SNIPER: NEW AUTHORITY LEAD</b>\n\n` +
    `📍 <b>Source:</b> ${lead.source}\n` +
    `📌 <b>Topic:</b> ${lead.title}\n` +
    `🔗 <b>Direct Link:</b> <a href="${lead.url}">Click Here to Open</a>\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💡 <b>READY-TO-POST SCIENTIFIC ANSWER:</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `<code>${lead.suggestedResponse}</code>\n\n` +
    `<i>⚡ Copy the code block above and paste it directly to claim top authority!</i>`;

  const endpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: false
      })
    });
    const data = await res.json();
    return { success: data.ok, data };
  } catch (err) {
    console.error('❌ Failed to dispatch Telegram alert:', err);
    return { success: false, error: err };
  }
}

// 5. Radar Scanners
export async function scanRadarFeeds() {
  const state = loadState();
  const leads = [];

  console.log('📡 [RADAR ACTIVE] Scanning feeds for high-intent queries...');

  // Feed 1: Google News India (Nutraceuticals, Spirulina, Shilajit & Health)
  const feedQueries = [
    'spirulina+india',
    'best+spirulina+brand+india',
    'shilajit+resin+india',
    'best+shilajit+brand+india',
    'vitamin+b12+supplement+india',
    'ashwagandha+purity+india'
  ];

  for (const q of feedQueries) {
    try {
      const feedUrl = `https://news.google.com/rss/search?q=${q}&hl=en-IN&gl=IN&ceid=IN:en`;
      const res = await fetch(feedUrl);
      if (res.ok) {
        const xml = await res.text();
        const items = [...xml.matchAll(/<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<\/item>/g)];
        
        for (const item of items.slice(0, 2)) {
          const rawTitle = item[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();
          const rawLink = item[2].trim();

          if (!state.seenUrls.includes(rawLink)) {
            const answer = generateScientificResponse(rawTitle);
            leads.push({
              source: 'Google News / Authority Feed',
              title: rawTitle,
              url: rawLink,
              suggestedResponse: answer
            });
            state.seenUrls.push(rawLink);
          }
        }
      }
    } catch (e) {
      console.warn(`Feed error for ${q}:`, e.message);
    }
  }

  // Feed 2: High-Intent Community Targets (Live Community Search Hubs)
  const curatedCommunityOpportunities = [
    {
      source: 'Quora India (Live Question Hub)',
      title: 'Which is the safest and purest spirulina brand in India without heavy metals?',
      url: 'https://www.quora.com/search?q=best+spirulina+brand+in+india',
    },
    {
      source: 'Reddit r/Fitness_India (Live Community Feed)',
      title: 'Spirulina Brand Reviews, Heavy Metal Purity & Recommendations',
      url: 'https://www.reddit.com/r/Fitness_India/search/?q=spirulina&sort=new',
    },
    {
      source: 'Quora India (Shilajit Purity Hub)',
      title: 'How to check authentic pure Himalayan Shilajit resin from duplicate brands in India?',
      url: 'https://www.quora.com/search?q=pure+shilajit+in+india',
    },
    {
      source: 'Reddit r/Fitness_India (B12 & Vegan Nutrition)',
      title: 'Best Plant-based Vitamin B12 Supplements for Vegetarians in India',
      url: 'https://www.reddit.com/r/Fitness_India/search/?q=vitamin+b12&sort=new',
    }
  ];

  for (const target of curatedCommunityOpportunities) {
    if (!state.seenUrls.includes(target.url)) {
      const answer = generateScientificResponse(target.title);
      leads.push({
        source: target.source,
        title: target.title,
        url: target.url,
        suggestedResponse: answer
      });
      state.seenUrls.push(target.url);
    }
  }

  state.lastScan = new Date().toISOString();
  saveState(state);

  return leads;
}

async function runOnce(botToken, chatId) {
  const leads = await scanRadarFeeds();
  console.log(`✅ Radar identified ${leads.length} new high-intent opportunities.`);

  for (const lead of leads) {
    await sendTelegramAlert(botToken, chatId, lead);
  }
}

// 6. CLI Execution
async function main() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || '';
  const chatId = process.env.TELEGRAM_CHAT_ID || '';
  const isWatch = process.argv.includes('--watch') || process.argv.includes('--daemon');

  console.log('====================================================');
  console.log('🎯 SUJATA AI SNIPER LISTENING AGENT INITIALIZED');
  console.log('====================================================');

  await runOnce(botToken, chatId);

  if (isWatch) {
    const INTERVAL_MINUTES = 30;
    console.log(`\n🔄 [DAEMON ACTIVE] Monitoring internet 24/7. Auto-scan runs every ${INTERVAL_MINUTES} minutes...`);
    console.log(`Press Ctrl+C to stop.`);

    setInterval(async () => {
      console.log(`\n⏰ [${new Date().toLocaleTimeString('en-IN')}] Running scheduled radar sweep...`);
      try {
        await runOnce(botToken, chatId);
      } catch (e) {
        console.error('Scan error:', e.message);
      }
    }, INTERVAL_MINUTES * 60 * 1000);
  } else {
    console.log('🏁 Scan completed successfully. (Run with --watch for continuous 24/7 auto-alerts)');
  }
}

if (process.argv[1] && process.argv[1].endsWith('sniper-agent.mjs')) {
  main();
}
