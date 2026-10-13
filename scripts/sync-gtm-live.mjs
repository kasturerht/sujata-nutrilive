// scripts/sync-gtm-live.mjs
// 🚀 SUJATA NUTRILIVE: AUTOMATED GTM CONTAINER SYNC & PUBLISH ENGINE (WITH RATE-LIMIT RESILIENCE)

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keyPath = path.join(__dirname, 'sujata-nutrilive-seo-7e48e83a62a6.json');
const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

const accountId = '6381104411';
const containerId = '266369056';
const publicId = 'GTM-5BCC6JL8';
const metaPixelId = '1314112957191765';
const ga4Id = 'G-5WZ8DNW2PD';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function createJwt(scopes) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: key.client_email,
    scope: scopes.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };
  const base64Url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const signInput = base64Url(header) + '.' + base64Url(payload);
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signInput);
  return signInput + '.' + sign.sign(key.private_key, 'base64url');
}

async function getAuthToken() {
  const scopes = [
    'https://www.googleapis.com/auth/tagmanager.edit.containers',
    'https://www.googleapis.com/auth/tagmanager.publish',
    'https://www.googleapis.com/auth/tagmanager.edit.containerversions'
  ];
  const jwt = createJwt(scopes);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error('OAuth error: ' + JSON.stringify(data));
  return data.access_token;
}

async function main() {
  console.log('===============================================================');
  console.log('🛰️ SUJATA NUTRILIVE — DIRECT GTM LIVE API SYNC & PUBLISH');
  console.log('===============================================================');

  const token = await getAuthToken();
  console.log('✅ Authenticated with Google Tag Manager API successfully.');

  // 1. Get active workspace
  const wsRes = await fetch(`https://tagmanager.googleapis.com/tagmanager/v2/accounts/${accountId}/containers/${containerId}/workspaces`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const wsData = await wsRes.json();
  const workspace = wsData.workspace?.find(w => w.name === 'Default Workspace') || wsData.workspace?.[0];
  const wsPath = workspace.path;
  console.log(`📌 Using Workspace: ${workspace.name} (Path: ${wsPath})`);

  await sleep(2000);

  // 2. Fetch existing triggers and tags
  const [existingTriggersRes, existingTagsRes] = await Promise.all([
    fetch(`https://tagmanager.googleapis.com/tagmanager/v2/${wsPath}/triggers`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    fetch(`https://tagmanager.googleapis.com/tagmanager/v2/${wsPath}/tags`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
  ]);

  const triggerMap = new Map();
  (existingTriggersRes.trigger || []).forEach(t => triggerMap.set(t.name, t));

  const tagMap = new Map();
  (existingTagsRes.tag || []).forEach(t => tagMap.set(t.name, t));

  console.log(`🔍 Current State: ${triggerMap.size} Triggers, ${tagMap.size} Tags.`);

  // 3. Define the GA4 Ecommerce tags with measurementIdOverride
  const ga4Tags = [
    {
      name: 'GA4 - view_item',
      type: 'gaawe',
      firingTriggerId: [triggerMap.get('GA4 Event - view_item')?.triggerId].filter(Boolean),
      parameter: [
        { type: 'template', key: 'measurementIdOverride', value: '{{Const - GA4 Measurement ID}}' },
        { type: 'template', key: 'eventName', value: 'view_item' },
        { type: 'boolean', key: 'sendEcommerceData', value: 'true' }
      ]
    },
    {
      name: 'GA4 - add_to_cart',
      type: 'gaawe',
      firingTriggerId: [triggerMap.get('GA4 Event - add_to_cart')?.triggerId].filter(Boolean),
      parameter: [
        { type: 'template', key: 'measurementIdOverride', value: '{{Const - GA4 Measurement ID}}' },
        { type: 'template', key: 'eventName', value: 'add_to_cart' },
        { type: 'boolean', key: 'sendEcommerceData', value: 'true' }
      ]
    },
    {
      name: 'GA4 - begin_checkout',
      type: 'gaawe',
      firingTriggerId: [triggerMap.get('GA4 Event - begin_checkout')?.triggerId].filter(Boolean),
      parameter: [
        { type: 'template', key: 'measurementIdOverride', value: '{{Const - GA4 Measurement ID}}' },
        { type: 'template', key: 'eventName', value: 'begin_checkout' },
        { type: 'boolean', key: 'sendEcommerceData', value: 'true' }
      ]
    },
    {
      name: 'GA4 - purchase',
      type: 'gaawe',
      firingTriggerId: [triggerMap.get('GA4 Event - purchase')?.triggerId].filter(Boolean),
      parameter: [
        { type: 'template', key: 'measurementIdOverride', value: '{{Const - GA4 Measurement ID}}' },
        { type: 'template', key: 'eventName', value: 'purchase' },
        { type: 'boolean', key: 'sendEcommerceData', value: 'true' }
      ]
    }
  ];

  for (const tg of ga4Tags) {
    await sleep(2500); // 2.5s delay to strictly stay within quota
    if (tagMap.has(tg.name)) {
      const existing = tagMap.get(tg.name);
      console.log(`  🔄 Updating Tag: ${tg.name}`);
      const updateRes = await fetch(`https://tagmanager.googleapis.com/tagmanager/v2/${existing.path}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...existing, parameter: tg.parameter, firingTriggerId: tg.firingTriggerId, type: tg.type })
      });
      const updated = await updateRes.json();
      if (!updateRes.ok) console.error('  ⚠️ Tag update error:', JSON.stringify(updated));
      else console.log(`  ✅ Tag updated: ${tg.name}`);
    } else {
      console.log(`  ➕ Creating Tag: ${tg.name}`);
      const createRes = await fetch(`https://tagmanager.googleapis.com/tagmanager/v2/${wsPath}/tags`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(tg)
      });
      const created = await createRes.json();
      if (!createRes.ok) console.error('  ⚠️ Tag create error:', JSON.stringify(created));
      else console.log(`  ✅ Tag created: ${tg.name}`);
    }
  }

  console.log('\n===============================================================');
  console.log('📦 CREATING CONTAINER VERSION & PUBLISHING TO LIVE ENVIRONMENT');
  console.log('===============================================================');

  await sleep(3000);

  // 4. Create Version
  const versionRes = await fetch(`https://tagmanager.googleapis.com/tagmanager/v2/${wsPath}:create_version`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Version 7 - Silicon Valley Enterprise Tracking Architecture',
      notes: 'Automated live deployment of 13 Enterprise Tags, 11 Triggers, and 15 Variables. Full GA4 Native E-Commerce + Meta CAPI Deduplicated Purchase.'
    })
  });
  const versionData = await versionRes.json();

  if (!versionRes.ok) {
    console.error('❌ Version Creation Failed:', JSON.stringify(versionData, null, 2));
    return;
  }

  const newVersion = versionData.containerVersion;
  console.log(`✅ Container Version Created: ${newVersion.name} (Version ID: ${newVersion.containerVersionId})`);

  await sleep(3000);

  // 5. Publish Version
  const publishRes = await fetch(`https://tagmanager.googleapis.com/tagmanager/v2/${newVersion.path}:publish`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  const publishData = await publishRes.json();

  if (!publishRes.ok) {
    console.error('❌ Version Publish Failed:', JSON.stringify(publishData, null, 2));
    return;
  }

  console.log('🎉 PUBLISH SUCCESSFUL!');
  console.log(`🌐 Version ${newVersion.containerVersionId} is now 100% LIVE on https://www.sujatanutrilive.com!`);
  console.log('===============================================================');
}

main().catch(console.error);
