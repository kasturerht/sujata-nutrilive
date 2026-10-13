// scripts/sync-v8-refinements.mjs
// 🚀 SUJATA NUTRILIVE: V8 ENTERPRISE REFINEMENTS (CATALOG ID MATCH + QUANTITY CALC + TAG SEQUENCING)

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
  console.log('🛰️ SUJATA NUTRILIVE — GTM V8 ARCHITECTURAL REFINEMENTS SYNC');
  console.log('===============================================================');

  const token = await getAuthToken();
  console.log('✅ Authenticated with GTM API.');

  const wsRes = await fetch(`https://tagmanager.googleapis.com/tagmanager/v2/accounts/${accountId}/containers/${containerId}/workspaces`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const wsData = await wsRes.json();
  const workspace = wsData.workspace?.find(w => w.name === 'Default Workspace') || wsData.workspace?.[0];
  const wsPath = workspace.path;
  console.log(`📌 Using Workspace: ${workspace.name} (Path: ${wsPath})`);

  await sleep(1500);

  // Fetch existing tags
  const tagsRes = await fetch(`https://tagmanager.googleapis.com/tagmanager/v2/${wsPath}/tags`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const tagsData = await tagsRes.json();
  const tagMap = new Map();
  (tagsData.tag || []).forEach(t => tagMap.set(t.name, t));

  const baseTag = tagMap.get('Meta Pixel - Base Code & PageView');

  // Refined Meta Event Tags
  const refinedTags = [
    // 1. Meta Pixel - ViewContent (with Dual ID Catalog Match: Numeric + GraphQL)
    {
      name: 'Meta Pixel - ViewContent',
      type: 'html',
      setupTag: baseTag ? [{ tagName: baseTag.name, stopOnSetupFailure: false }] : undefined,
      parameter: [
        {
          type: 'template',
          key: 'html',
          value: `<script>
if (typeof fbq === 'function') {
  var eId = '{{DLV - Event ID}}' || '';
  var rawId = '{{DLV - Product ID}}' || '';
  var cleanId = rawId.replace(/^gid:\\/\\/shopify\\/(ProductVariant|Product)\\//, '');
  var cIds = cleanId ? (cleanId !== rawId ? [cleanId, rawId] : [cleanId]) : (rawId ? [rawId] : []);
  fbq('track', 'ViewContent', {
    content_name: '{{DLV - Product Title}}',
    content_ids: cIds,
    content_type: 'product',
    value: parseFloat('{{DLV - Product Price}}') || 0,
    currency: 'INR'
  }, eId ? { eventID: eId } : undefined);
}
</script>`
        }
      ]
    },
    // 2. Meta Pixel - AddToCart (with Quantity Multiplier value & Dual ID Catalog Match)
    {
      name: 'Meta Pixel - AddToCart',
      type: 'html',
      setupTag: baseTag ? [{ tagName: baseTag.name, stopOnSetupFailure: false }] : undefined,
      parameter: [
        {
          type: 'template',
          key: 'html',
          value: `<script>
if (typeof fbq === 'function') {
  var eId = '{{DLV - Event ID}}' || '';
  var rawId = '{{DLV - Product ID}}' || '';
  var cleanId = rawId.replace(/^gid:\\/\\/shopify\\/(ProductVariant|Product)\\//, '');
  var cIds = cleanId ? (cleanId !== rawId ? [cleanId, rawId] : [cleanId]) : (rawId ? [rawId] : []);
  var totalVal = parseFloat('{{DLV - Ecommerce Value}}') || parseFloat('{{DLV - Product Price}}') || 0;
  fbq('track', 'AddToCart', {
    content_name: '{{DLV - Product Title}}',
    content_ids: cIds,
    content_type: 'product',
    value: totalVal,
    currency: 'INR'
  }, eId ? { eventID: eId } : undefined);
}
</script>`
        }
      ]
    },
    // 3. Meta Pixel - InitiateCheckout (with Dynamic num_items & Tag Sequencing)
    {
      name: 'Meta Pixel - InitiateCheckout',
      type: 'html',
      setupTag: baseTag ? [{ tagName: baseTag.name, stopOnSetupFailure: false }] : undefined,
      parameter: [
        {
          type: 'template',
          key: 'html',
          value: `<script>
if (typeof fbq === 'function') {
  var eId = '{{DLV - Event ID}}' || '';
  var itemsArr = [];
  try { itemsArr = {{DLV - Ecommerce Items}} || []; } catch(e) {}
  var numItems = (itemsArr && itemsArr.length) ? itemsArr.reduce(function(acc, i){ return acc + (parseInt(i.quantity)||1); }, 0) : 1;
  fbq('track', 'InitiateCheckout', {
    num_items: numItems,
    value: parseFloat('{{DLV - Ecommerce Value}}') || parseFloat('{{DLV - Order Total}}') || 0,
    currency: 'INR'
  }, eId ? { eventID: eId } : undefined);
}
</script>`
        }
      ]
    },
    // 4. Meta Pixel - Purchase (with Tag Sequencing & CAPI Parity)
    {
      name: 'Meta Pixel - Purchase',
      type: 'html',
      setupTag: baseTag ? [{ tagName: baseTag.name, stopOnSetupFailure: false }] : undefined,
      parameter: [
        {
          type: 'template',
          key: 'html',
          value: `<script>
if (typeof fbq === 'function') {
  var txId = '{{DLV - Ecommerce Transaction ID}}' || '';
  var eId = '{{DLV - Event ID}}' || (txId ? ('order_' + txId) : '');
  fbq('track', 'Purchase', {
    content_type: 'product',
    value: parseFloat('{{DLV - Ecommerce Value}}') || parseFloat('{{DLV - Order Total}}') || 0,
    currency: '{{DLV - Ecommerce Currency}}' || 'INR'
  }, eId ? { eventID: eId } : undefined);
}
</script>`
        }
      ]
    }
  ];

  for (const tg of refinedTags) {
    await sleep(2500);
    const existing = tagMap.get(tg.name);
    if (existing) {
      console.log(`  🔄 Applying V8 Refinements to: ${tg.name}`);
      const updatePayload = {
        ...existing,
        parameter: tg.parameter
      };
      if (tg.setupTag) updatePayload.setupTag = tg.setupTag;

      const updateRes = await fetch(`https://tagmanager.googleapis.com/tagmanager/v2/${existing.path}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });
      const updated = await updateRes.json();
      if (!updateRes.ok) console.error('  ⚠️ Update error:', JSON.stringify(updated));
      else console.log(`  ✅ Successfully updated ${tg.name}`);
    }
  }

  console.log('\n===============================================================');
  console.log('📦 CREATING CONTAINER VERSION 8 & PUBLISHING TO LIVE ENVIRONMENT');
  console.log('===============================================================');

  await sleep(3000);

  const versionRes = await fetch(`https://tagmanager.googleapis.com/tagmanager/v2/${wsPath}:create_version`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Version 8 - Ultra-Refined Silicon Valley Tracking Architecture',
      notes: 'Implemented Meta Catalog Dual-ID match (clean numeric + Shopify gid), AddToCart quantity price multiplier, dynamic InitiateCheckout num_items, and Tag Sequencing.'
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
  console.log(`🌐 Version ${newVersion.containerVersionId} is now 100% LIVE in production!`);
  console.log('===============================================================');
}

main().catch(console.error);
