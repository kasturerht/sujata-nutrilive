import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        let val = trimmed.substring(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[trimmed.substring(0, idx).trim()] = val;
      }
    }
  }
}
loadEnv();

const domain = process.env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

async function tagSoapNoCod() {
  // 1. Get soap product id
  const getQuery = `
    query {
      productByHandle(handle: "sujata-spiruglow-bath-soap") {
        id
        title
        tags
      }
    }
  `;

  const getRes = await fetch(`https://${domain}/admin/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify({ query: getQuery })
  });

  const getData = await getRes.json();
  const product = getData.data?.productByHandle;
  console.log("Current soap product:", product);

  if (!product) {
    console.error("Soap product not found!");
    return;
  }

  // 2. Add 'no-cod' to tags if not already present
  let tags = product.tags || [];
  if (!tags.includes('no-cod')) {
    tags.push('no-cod');
  }

  const updateMutation = `
    mutation productUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          title
          tags
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const updateRes = await fetch(`https://${domain}/admin/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify({
      query: updateMutation,
      variables: {
        input: {
          id: product.id,
          tags: tags
        }
      }
    })
  });

  const updateData = await updateRes.json();
  console.log("Updated product result:", JSON.stringify(updateData, null, 2));
}

tagSoapNoCod().catch(console.error);
