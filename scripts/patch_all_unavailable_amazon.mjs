import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

async function getAmazonToken() {
  const res = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: env.AMAZON_REFRESH_TOKEN,
      client_id: env.AMAZON_LWA_CLIENT_ID,
      client_secret: env.AMAZON_LWA_CLIENT_SECRET
    })
  });
  const data = await res.json();
  return data.access_token;
}

const ITEMS_TO_FIX = [
  {
    sku: 'SJT-B12-CAP-90',
    productType: 'VITAMIN',
    price: 649,
    mrp: 899,
    minPrice: 550,
    maxPrice: 899
  },
  {
    sku: 'SJT-MOR-PWD-100G',
    productType: 'HERBAL_SUPPLEMENT',
    price: 249,
    mrp: 399,
    minPrice: 199,
    maxPrice: 399
  },
  {
    sku: 'SJT-COMBO-SP90-SB60',
    productType: 'HERBAL_SUPPLEMENT',
    price: 950,
    mrp: 1499,
    minPrice: 850,
    maxPrice: 1499
  },
  {
    sku: 'SJT-SP-SOAP-5PK',
    productType: 'SKIN_CLEANING_AGENT',
    price: 280,
    mrp: 350,
    minPrice: 250,
    maxPrice: 350
  },
  {
    sku: 'SJT-SP-SOAP-10PK',
    productType: 'SKIN_CLEANING_AGENT',
    price: 550,
    mrp: 700,
    minPrice: 450,
    maxPrice: 700
  },
  {
    sku: 'SJT-SP-SHP-100ML',
    productType: 'SHAMPOO',
    price: 250,
    mrp: 350,
    minPrice: 200,
    maxPrice: 350
  },
  {
    sku: 'SJT-SHIL-CAP-60',
    productType: 'HERBAL_SUPPLEMENT',
    price: 649,
    mrp: 999,
    minPrice: 550,
    maxPrice: 999
  }
];

async function patchAllItems() {
  const token = await getAmazonToken();
  const sellerId = env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
  const marketId = env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const endpoint = env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

  console.log("=== EXECUTING SP-API AUTOMATED REPAIR FOR ALL UNAVAILABLE PRODUCTS ===\n");

  const results = [];

  for (const item of ITEMS_TO_FIX) {
    const patchUrl = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(item.sku)}?marketplaceIds=${marketId}`;

    const body = {
      productType: item.productType,
      patches: [
        {
          op: "replace",
          path: "/attributes/fulfillment_availability",
          value: [
            {
              fulfillment_channel_code: "DEFAULT",
              quantity: 50
            }
          ]
        },
        {
          op: "replace",
          path: "/attributes/purchasable_offer",
          value: [
            {
              currency: "INR",
              audience: "ALL",
              our_price: [
                {
                  schedule: [
                    {
                      value_with_tax: item.price
                    }
                  ]
                }
              ],
              maximum_retail_price: [
                {
                  schedule: [
                    {
                      value_with_tax: item.mrp
                    }
                  ]
                }
              ],
              minimum_seller_allowed_price: [
                {
                  schedule: [
                    {
                      value_with_tax: item.minPrice
                    }
                  ]
                }
              ],
              maximum_seller_allowed_price: [
                {
                  schedule: [
                    {
                      value_with_tax: item.maxPrice
                    }
                  ]
                }
              ],
              marketplace_id: marketId
            }
          ]
        }
      ]
    };

    try {
      const res = await fetch(patchUrl, {
        method: 'PATCH',
        headers: {
          'x-amz-access-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const resData = await res.json();
      console.log(`[${res.status}] SKU: ${item.sku} -> Status: ${resData.status || 'ERROR'}, SubId: ${resData.submissionId || 'N/A'}`);
      if (resData.issues && resData.issues.length > 0) {
        console.log(`   Issues:`, JSON.stringify(resData.issues));
      }
      results.push({
        sku: item.sku,
        httpStatus: res.status,
        status: resData.status,
        submissionId: resData.submissionId,
        issues: resData.issues
      });
    } catch (e) {
      console.error(`Error on SKU ${item.sku}:`, e.message);
    }
  }

  fs.writeFileSync('reports/sp_api_repair_results.json', JSON.stringify(results, null, 2));
  console.log("\nRepair submissions completed. Results saved to reports/sp_api_repair_results.json");
}

patchAllItems();
