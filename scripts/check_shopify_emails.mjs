import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

async function checkShopifyEmails() {
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

  // 1. Get Shop Details
  const shopRes = await fetch(`https://${domain}/admin/api/2024-04/shop.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const shopData = await shopRes.json();
  console.log("=== SHOPIFY SHOP SETTINGS ===");
  console.log("Shop Name:", shopData.shop?.name);
  console.log("Shop Email:", shopData.shop?.email);
  console.log("Customer Email:", shopData.shop?.customer_email);

  // 2. Get Users / Staff
  const usersRes = await fetch(`https://${domain}/admin/api/2024-04/users.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  if (usersRes.ok) {
    const usersData = await usersRes.json();
    console.log("\n=== SHOPIFY USERS / STAFF ===");
    (usersData.users || []).forEach(u => {
      console.log(`- ${u.first_name} ${u.last_name}: ${u.email} (Account Owner: ${u.account_owner})`);
    });
  } else {
    console.log("Users endpoint response:", usersRes.status, await usersRes.text());
  }

  // 3. Check Order #1030
  const orderRes = await fetch(`https://${domain}/admin/api/2024-04/orders.json?name=1030&status=any`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const orderData = await orderRes.json();
  console.log("\n=== ORDER #1030 DETAILS ===");
  const order = orderData.orders?.[0];
  if (order) {
    console.log("Order Name:", order.name);
    console.log("Customer Email:", order.email);
    console.log("Contact Email:", order.contact_email);
    console.log("Payment Gateway Names:", order.payment_gateway_names);
    console.log("Source Name:", order.source_name);
    console.log("Tags:", order.tags);
    console.log("Note Attributes:", order.note_attributes);
  }
}

checkShopifyEmails();
