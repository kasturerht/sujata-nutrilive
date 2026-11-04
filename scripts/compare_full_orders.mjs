import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

async function compareFullOrders() {
  const domain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
  const oRes = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: env.SHOPIFY_CLIENT_ID,
      client_secret: env.SHOPIFY_CLIENT_SECRET,
      grant_type: 'client_credentials'
    })
  });
  const oData = await oRes.json();
  const token = oData.access_token;

  const o1029Res = await fetch(`https://${domain}/admin/api/2024-04/orders/18963570983044.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const o1029 = (await o1029Res.json()).order;

  const o1030Res = await fetch(`https://${domain}/admin/api/2024-04/orders/18964958904452.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const o1030 = (await o1030Res.json()).order;

  console.log("=== COMPARING ORDER 1029 vs 1030 ===");
  console.log("1029 source_name:", o1029.source_name);
  console.log("1030 source_name:", o1030.source_name);

  console.log("1029 location_id:", o1029.location_id);
  console.log("1030 location_id:", o1030.location_id);

  console.log("1029 source_identifier:", o1029.source_identifier);
  console.log("1030 source_identifier:", o1030.source_identifier);

  console.log("1029 app_id:", o1029.app_id);
  console.log("1030 app_id:", o1030.app_id);

  console.log("1029 tags:", o1029.tags);
  console.log("1030 tags:", o1030.tags);

  console.log("1029 user_id:", o1029.user_id);
  console.log("1030 user_id:", o1030.user_id);

  console.log("1029 fulfillment_status:", o1029.fulfillment_status);
  console.log("1030 fulfillment_status:", o1030.fulfillment_status);

  console.log("1029 line_items fulfillment_service:", o1029.line_items?.map(i => i.fulfillment_service));
  console.log("1030 line_items fulfillment_service:", o1030.line_items?.map(i => i.fulfillment_service));
}

compareFullOrders();
