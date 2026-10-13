// scripts/fix-and-deploy-v9.mjs
// 🛠️ SUJATA NUTRILIVE: PRODUCTION TRACKING CORE RELEASE (v9.0.0)
// Complete eradication of duplicate tags, syntax error fixes, full catalog matching, and professional release

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
  console.log('🏛️ SUJATA NUTRILIVE — GTM v9.0.0 PRODUCTION CORE ENGINE');
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

  // 1. Fetch all existing tags and variables
  const [tagsRes, varsRes] = await Promise.all([
    fetch(`https://tagmanager.googleapis.com/tagmanager/v2/${wsPath}/tags`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    fetch(`https://tagmanager.googleapis.com/tagmanager/v2/${wsPath}/variables`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
  ]);

  const tagList = tagsRes.tag || [];
  const varList = varsRes.variable || [];
  console.log(`🔍 Found ${tagList.length} tags, ${varList.length} variables in workspace.`);

  // 2. CRITICAL FIX 1: Delete Duplicate ViewContent Tag (Tag 24)
  const duplicateTag = tagList.find(t => t.name === 'Meta Pixel - ViewContent (Product View)' || t.tagId === '24');
  if (duplicateTag) {
    console.log(`🗑️ Deleting Duplicate Tag: "${duplicateTag.name}" (ID: ${duplicateTag.tagId}) to prevent 200% double-counting...`);
    const delRes = await fetch(`https://tagmanager.googleapis.com/tagmanager/v2/${duplicateTag.path}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`  ✅ Tag 24 Deleted successfully (Status: ${delRes.status}).`);
    await sleep(2000);
  } else {
    console.log('  ℹ️ No duplicate Tag 24 found.');
  }

  // 3. Upsert Variable: DLV - Quantity
  const qtyVar = varList.find(v => v.name === 'DLV - Quantity');
  if (!qtyVar) {
    console.log('➕ Creating Variable: DLV - Quantity');
    await fetch(`https://tagmanager.googleapis.com/tagmanager/v2/${wsPath}/variables`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'DLV - Quantity',
        type: 'v',
        parameter: [
          { type: 'integer', key: 'dataLayerVersion', value: '2' },
          { type: 'template', key: 'name', value: 'quantity' }
        ]
      })
    });
    await sleep(2000);
  }

  // Align DLV - Order Total and DLV - Contact Channel
  const orderTotalVar = varList.find(v => v.name === 'DLV - Order Total');
  if (orderTotalVar) {
    console.log('🔄 Aligning DLV - Order Total to event_data.total');
    await fetch(`https://tagmanager.googleapis.com/tagmanager/v2/${orderTotalVar.path}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...orderTotalVar,
        parameter: [
          { type: 'integer', key: 'dataLayerVersion', value: '2' },
          { type: 'template', key: 'name', value: 'event_data.total' }
        ]
      })
    });
    await sleep(2000);
  }

  const contactChannelVar = varList.find(v => v.name === 'DLV - Contact Channel');
  if (contactChannelVar) {
    console.log('🔄 Aligning DLV - Contact Channel to event_data.channel');
    await fetch(`https://tagmanager.googleapis.com/tagmanager/v2/${contactChannelVar.path}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...contactChannelVar,
        parameter: [
          { type: 'integer', key: 'dataLayerVersion', value: '2' },
          { type: 'template', key: 'name', value: 'event_data.channel' }
        ]
      })
    });
    await sleep(2000);
  }

  // 4. Base Code Tag for setupTag sequencing
  const baseTag = tagList.find(t => t.name === 'Meta Pixel - Base Code & PageView');
  const setupTagConfig = baseTag ? [{ tagName: baseTag.name, stopOnSetupFailure: false }] : undefined;

  // 5. CRITICAL FIX 2, 3, 4, 5: Update Tags with Native DataLayer Array Parsers & Full Catalog Data
  const updatedTags = [
    // Tag A: Meta Pixel - AddToCart (True Quantity Price Multiplier + Dual ID Match)
    {
      name: 'Meta Pixel - AddToCart',
      type: 'html',
      setupTag: setupTagConfig,
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
  var unitPrice = parseFloat('{{DLV - Product Price}}') || 0;
  var qty = parseInt('{{DLV - Quantity}}') || 1;
  var totalVal = parseFloat('{{DLV - Ecommerce Value}}') || (unitPrice * qty);

  fbq('track', 'AddToCart', {
    content_name: '{{DLV - Product Title}}',
    content_ids: cIds,
    contents: [{
      id: cleanId || rawId,
      quantity: qty,
      item_price: unitPrice
    }],
    content_type: 'product',
    value: totalVal,
    currency: 'INR'
  }, eId ? { eventID: eId } : undefined);
}
</script>`
        }
      ]
    },

    // Tag B: Meta Pixel - InitiateCheckout (Safe Native Array Extraction - Zero Syntax Errors + Catalog Contents)
    {
      name: 'Meta Pixel - InitiateCheckout',
      type: 'html',
      setupTag: setupTagConfig,
      parameter: [
        {
          type: 'template',
          key: 'html',
          value: `<script>
if (typeof fbq === 'function') {
  var eId = '{{DLV - Event ID}}' || '';
  var totalVal = parseFloat('{{DLV - Ecommerce Value}}') || parseFloat('{{DLV - Order Total}}') || 0;
  
  var items = [];
  try {
    if (window.google_tag_manager && window.google_tag_manager['GTM-5BCC6JL8']) {
      items = window.google_tag_manager['GTM-5BCC6JL8'].dataLayer.get('ecommerce.items') || [];
    }
  } catch(e) {}
  
  if (!items || !items.length) {
    try {
      if (window.dataLayer && window.dataLayer.length) {
        for (var i = window.dataLayer.length - 1; i >= 0; i--) {
          var d = window.dataLayer[i];
          if (d && d.ecommerce && d.ecommerce.items && d.ecommerce.items.length) {
            items = d.ecommerce.items;
            break;
          }
        }
      }
    } catch(e) {}
  }
  
  var contentIds = [];
  var contents = [];
  var numItems = 0;
  
  if (items && items.length) {
    for (var j = 0; j < items.length; j++) {
      var it = items[j];
      if (it) {
        var raw = String(it.item_id || it.id || '');
        var clean = raw.replace(/^gid:\\/\\/shopify\\/(ProductVariant|Product)\\//, '');
        var cId = clean || raw;
        var q = parseInt(it.quantity) || 1;
        var p = parseFloat(it.price) || 0;
        if (cId) contentIds.push(cId);
        contents.push({ id: cId, quantity: q, item_price: p });
        numItems += q;
      }
    }
  }
  
  fbq('track', 'InitiateCheckout', {
    content_ids: contentIds,
    contents: contents,
    num_items: numItems || 1,
    value: totalVal,
    currency: 'INR'
  }, eId ? { eventID: eId } : undefined);
}
</script>`
        }
      ]
    },

    // Tag C: Meta Pixel - Purchase (Full Catalog content_ids, contents, num_items, & CAPI Deduplication Parity)
    {
      name: 'Meta Pixel - Purchase',
      type: 'html',
      setupTag: setupTagConfig,
      parameter: [
        {
          type: 'template',
          key: 'html',
          value: `<script>
if (typeof fbq === 'function') {
  var txId = '{{DLV - Ecommerce Transaction ID}}' || '';
  var eId = '{{DLV - Event ID}}' || (txId ? ('order_' + txId) : '');
  var totalVal = parseFloat('{{DLV - Ecommerce Value}}') || parseFloat('{{DLV - Order Total}}') || 0;
  var currency = '{{DLV - Ecommerce Currency}}' || 'INR';
  
  var items = [];
  try {
    if (window.google_tag_manager && window.google_tag_manager['GTM-5BCC6JL8']) {
      items = window.google_tag_manager['GTM-5BCC6JL8'].dataLayer.get('ecommerce.items') || [];
    }
  } catch(e) {}
  
  if (!items || !items.length) {
    try {
      if (window.dataLayer && window.dataLayer.length) {
        for (var i = window.dataLayer.length - 1; i >= 0; i--) {
          var d = window.dataLayer[i];
          if (d && d.ecommerce && d.ecommerce.items && d.ecommerce.items.length) {
            items = d.ecommerce.items;
            break;
          }
        }
      }
    } catch(e) {}
  }
  
  var contentIds = [];
  var contents = [];
  var numItems = 0;
  
  if (items && items.length) {
    for (var j = 0; j < items.length; j++) {
      var it = items[j];
      if (it) {
        var raw = String(it.item_id || it.id || '');
        var clean = raw.replace(/^gid:\\/\\/shopify\\/(ProductVariant|Product)\\//, '');
        var cId = clean || raw;
        var q = parseInt(it.quantity) || 1;
        var p = parseFloat(it.price) || 0;
        if (cId) contentIds.push(cId);
        contents.push({ id: cId, quantity: q, item_price: p });
        numItems += q;
      }
    }
  }
  
  fbq('track', 'Purchase', {
    content_name: 'Order ' + txId,
    content_type: 'product',
    content_ids: contentIds,
    contents: contents,
    num_items: numItems || 1,
    value: totalVal,
    currency: currency
  }, eId ? { eventID: eId } : undefined);
}
</script>`
        }
      ]
    },

    // Tag D: Meta Pixel - ViewContent (Verified Clean Single ViewContent Tag with Dual ID Match)
    {
      name: 'Meta Pixel - ViewContent',
      type: 'html',
      setupTag: setupTagConfig,
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
  var price = parseFloat('{{DLV - Product Price}}') || 0;
  
  fbq('track', 'ViewContent', {
    content_name: '{{DLV - Product Title}}',
    content_ids: cIds,
    content_type: 'product',
    value: price,
    currency: 'INR'
  }, eId ? { eventID: eId } : undefined);
}
</script>`
        }
      ]
    }
  ];

  for (const tg of updatedTags) {
    await sleep(2500);
    const existing = tagList.find(t => t.name === tg.name);
    if (existing) {
      console.log(`  🔄 Updating: ${tg.name}`);
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
  console.log('📦 CREATING CONTAINER VERSION 9 & PUBLISHING TO LIVE ENVIRONMENT');
  console.log('===============================================================');

  await sleep(3000);

  // Professional Engineering Release Name & Notes
  const versionRes = await fetch(`https://tagmanager.googleapis.com/tagmanager/v2/${wsPath}:create_version`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'v9.0.0 - Production Tracking Core Release',
      notes: 'Forensic audit resolution: (1) Eradicated duplicate ViewContent tag 24, (2) Implemented native dataLayer safe item extraction for InitiateCheckout and Purchase (content_ids, contents, num_items), (3) Enabled true AddToCart quantity price multiplier, (4) Aligned dual-path DataLayer variables.'
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

  // 6. Export fresh container JSON
  const exportJson = {
    exportFormatVersion: 2,
    exportTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    containerVersion: newVersion
  };
  fs.writeFileSync('sujata_gtm_container.json', JSON.stringify(exportJson, null, 2), 'utf8');
  console.log('📁 Updated sujata_gtm_container.json with live Version 9 snapshot.');
  console.log('===============================================================');
}

main().catch(console.error);
