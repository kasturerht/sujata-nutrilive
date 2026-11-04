// scripts/find-shopify-tablet-mentions.mjs
const domain = 'tvczdq-nu.myshopify.com';
const token = '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';

async function checkShopifyProduct() {
  const query = `
    query {
      product(id: "gid://shopify/Product/10473731162244") {
        id
        title
        handle
        descriptionHtml
        tags
        seo {
          title
          description
        }
        variants(first: 10) {
          edges {
            node {
              id
              title
              sku
            }
          }
        }
      }
    }
  `;
  const res = await fetch(`https://${domain}/admin/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  const prod = data.data.product;

  console.log('====================================================');
  console.log('🔍 SHOPIFY AUDIT: "sujata-spirulina-sea-buckthorn-combo-pack"');
  console.log('====================================================\n');
  console.log('Title:', prod.title);
  console.log('Tags:', prod.tags);
  console.log('SEO Title:', prod.seo?.title);
  console.log('SEO Desc:', prod.seo?.description);

  const fullText = JSON.stringify(prod);
  const regex = /tablet[s]?/gi;
  let match;
  let count = 0;
  while ((match = regex.exec(fullText)) !== null) {
    count++;
    console.log(`🔴 Found occurrence #${count}: "${match[0]}" at position ${match.index}`);
    console.log(`   Context: ...${fullText.substring(Math.max(0, match.index - 50), match.index + 50)}...`);
  }
  if (count === 0) {
    console.log('✅ No "tablet" found in Shopify product!');
  }
}

checkShopifyProduct();
