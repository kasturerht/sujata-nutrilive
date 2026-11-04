import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

// 1. Firebase Setup
const serviceAccountPath = 'C:\\Users\\Admin\\Downloads\\nexaleads-98a12-firebase-adminsdk-fbsvc-2d9799d686.json';
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);
const orgId = 'ORG_SUJATA_NUTRILIVE_8117';
const orgRef = db.collection('organizations').doc(orgId);

// 2. Meta Setup
const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const metaToken = env.META_ADS_ACCESS_TOKEN;

const telecallersConfig = [
  {
    name: 'Monu',
    phone: '9503434653',
    firebaseUserId: 'BuHMGdqFxWO6WtWf1j2MUb3W3wO2',
    metaCampaignId: '120248455999830630',
    metaCampaignName: 'Spirulina India - hindi   95034 34653'
  },
  {
    name: 'Vaishnavi Diwate',
    phone: '9922534443',
    firebaseUserId: 'Qj5em1x3JwheIqPKbLQzeoMiPRO2',
    metaCampaignId: '120248311886590630',
    metaCampaignName: 'Spirulina MH-99225 34443 04/09'
  },
  {
    name: 'Punam Kasture (Shirsath)',
    phone: '9922500344',
    firebaseUserId: 'jdZdyrOfhXcsliQrRQTy0UeB78D3',
    metaCampaignId: '120247944916240630',
    metaCampaignName: 'Spirulina MH- Marathi 9922500344'
  },
  {
    name: 'Manjushree Kasture',
    phone: '9272471529',
    firebaseUserId: 'J5WsatITDjhPe6sMc42EqneEdhs1',
    metaCampaignId: '120248181830330630',
    metaCampaignName: 'Spirulina MH- Marathi 9272471529  25/08'
  },
  {
    name: 'Karishma Patil',
    phone: '9922577344',
    firebaseUserId: 'XfqaxFK5CJhGzx9jkmp4u9LZico2',
    metaCampaignId: '120249008529620630',
    metaCampaignName: 'Spirulina MH- Marathi 9922577344'
  }
];

const targetDates = ['2026-10-27', '2026-10-28', '2026-10-29'];

async function run() {
  console.log('================================================================');
  console.log('AUDITING META ADS & NEXA LEADS FOR OCT 27, 28, 29');
  console.log('================================================================\n');

  // STEP A: Fetch Meta Daywise Insights for each telecaller campaign
  const metaDaywise = {};
  for (const t of telecallersConfig) {
    metaDaywise[t.name] = {};
    const dateRange = JSON.stringify({ since: '2026-10-27', until: '2026-10-29' });
    const url = `https://graph.facebook.com/v21.0/${t.metaCampaignId}/insights?time_increment=1&time_range=${encodeURIComponent(dateRange)}&fields=campaign_id,campaign_name,date_start,date_stop,spend,impressions,clicks,actions&access_token=${metaToken}`;
    const res = await fetch(url);
    const data = await res.json();
    
    (data.data || []).forEach(d => {
      let leads = 0;
      let messagingConversations = 0;
      let linkClicks = 0;

      (d.actions || []).forEach(a => {
        if (a.action_type === 'lead' || a.action_type === 'on_facebook_lead') {
          leads += parseInt(a.value || '0');
        }
        if (a.action_type === 'onsite_conversion.messaging_conversation_started_7d') {
          messagingConversations += parseInt(a.value || '0');
        }
        if (a.action_type === 'link_click') {
          linkClicks += parseInt(a.value || '0');
        }
      });

      metaDaywise[t.name][d.date_start] = {
        spend: parseFloat(d.spend || '0'),
        impressions: parseInt(d.impressions || '0'),
        clicks: parseInt(d.clicks || '0'),
        linkClicks,
        leads,
        messagingConversations,
        rawActions: d.actions
      };
    });
  }

  // STEP B: Fetch Firestore Leads
  const leadsSnap = await orgRef.collection('leads').get();
  console.log(`Loaded ${leadsSnap.size} total leads from Firestore.`);

  // Let's inspect lead structure to see date fields and caller mapping fields
  const leadsList = [];
  leadsSnap.forEach(doc => {
    leadsList.push({ id: doc.id, ...doc.data() });
  });

  // STEP C: Fetch Firestore Orders
  const ordersSnap = await orgRef.collection('orders_data').get();
  console.log(`Loaded ${ordersSnap.size} total orders from Firestore.`);
  const ordersList = [];
  ordersSnap.forEach(doc => {
    ordersList.push({ id: doc.id, ...doc.data() });
  });

  fs.writeFileSync('scripts/telecaller_leads_dump.json', JSON.stringify(leadsList, null, 2), 'utf8');
  fs.writeFileSync('scripts/telecaller_orders_dump.json', JSON.stringify(ordersList, null, 2), 'utf8');
  fs.writeFileSync('scripts/meta_telecaller_3day.json', JSON.stringify(metaDaywise, null, 2), 'utf8');

  console.log('Saved raw dumps. Analyzing date parsing...');
}

run().catch(console.error);
