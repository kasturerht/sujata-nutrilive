// scripts/update-shopify-hl-combo.mjs
// Aligns Shopify product "sujata-spirulina-sea-buckthorn-combo-pack" to pure Veg Capsules.

const domain = 'tvczdq-nu.myshopify.com';
const token = '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';

const mutation = `
  mutation productUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        title
        handle
        tags
        seo {
          title
          description
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const descriptionHtml = `<p><strong>100% Pure Spirulina Veg Capsules + Wild Himalayan Sea Buckthorn Veg Capsules Combo.</strong></p>
<p>Experience complete 360° cellular rejuvenation in easy-to-swallow vegetarian capsules. Powered by pure bio-protein, non-heme iron, rare Omega 7, 3, 6, 9 and 12x Vitamin C for sustained all-day energy, radiant skin glow, and robust immune defense — with zero bitter taste and zero binder chemicals.</p>
<h3>What’s in the Protocol (100% Vegetarian Capsules):</h3>
<ul>
<li><strong>1-Month Plan:</strong> 1x Spirulina Veg Capsules (60 Caps) + 1x Sea Buckthorn Capsules (60 Caps) — 120 Capsules Total</li>
<li><strong>2-Month Plan (Most Popular):</strong> 2x Spirulina Veg Capsules (120 Caps) + 2x Sea Buckthorn Capsules (120 Caps) — 240 Capsules Total (Save ₹300)</li>
<li><strong>3-Month Plan (Best Value):</strong> 3x Spirulina Veg Capsules (180 Caps) + 3x Sea Buckthorn Capsules (180 Caps) — 360 Capsules Total (Save ₹600)</li>
</ul>
<h3>Key Health Benefits:</h3>
<ul>
<li><strong>All-Day Clean Energy:</strong> 65% Bio-Protein &amp; Organic Iron without caffeine crashes.</li>
<li><strong>Skin Hydration &amp; Glow:</strong> Rare Omega-7 deeply nourishes skin cells and mucosal tissues.</li>
<li><strong>Immunity Fortress:</strong> High-potency natural Vitamin C &amp; Phycocyanin antioxidants.</li>
<li><strong>Pure Plant Capsules:</strong> 100% HPMC plant capsules, zero gelatin, gentle on digestion.</li>
</ul>`;

const tags = [
  'Energy',
  'Glass Skin',
  'Glowing Skin',
  'Herbal Skincare',
  'Immunity',
  'Sea Buckthorn',
  'Skin Glow',
  'Spirulina and Sea Buckthorn',
  'Spirulina Capsules',
  'Spirulina Veg Capsules',
  'Sea Buckthorn Capsules',
  'Healthy Life Combo',
  'Combo Pack',
  'Wedding Skincare'
];

async function updateShopifyProduct() {
  console.log('🔄 Updating Shopify Healthy Life Combo product...');

  const variables = {
    input: {
      id: "gid://shopify/Product/10473731162244",
      title: "Sujata Spirulina Veg Capsules + Sea Buckthorn Capsules Healthy Life Combo Pack",
      descriptionHtml: descriptionHtml,
      tags: tags,
      seo: {
        title: "Spirulina & Sea Buckthorn Veg Capsules Combo Pack | Sujata Nutrilive",
        description: "Complete 360° cellular wellness combo in 100% veg capsules: Pure Spirulina (62% protein) + Himalayan Sea Buckthorn (Omega-7). Clean energy, glowing skin, immunity."
      }
    }
  };

  const res = await fetch(`https://${domain}/admin/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify({ query: mutation, variables })
  });

  const data = await res.json();
  console.log('Shopify response:', JSON.stringify(data, null, 2));
}

updateShopifyProduct().catch(console.error);
