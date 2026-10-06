// src/pages/google-merchant-feed.xml.ts
// 🛒 GOOGLE MERCHANT CENTER DYNAMIC PRODUCT FEED (2026 HEADLESS SPEC)
// Serves live RSS 2.0 / Google Base XML directly to Google Shopping & Free Listings

import type { APIRoute } from 'astro';
import { BRAND_CONFIG } from '../config/brand';

export const prerender = false;

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cleanText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const GET: APIRoute = async () => {
  const siteUrl = BRAND_CONFIG.siteUrl || 'https://sujatanutrilive.com';
  const shopifyDomain = import.meta.env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
  const storefrontToken = import.meta.env.PUBLIC_SHOPIFY_STOREFRONT_TOKEN || '7e0a0176aede63ce4c6b199e18684018';

  const query = `
    query GoogleMerchantProducts {
      products(first: 50) {
        edges {
          node {
            id
            handle
            title
            description
            availableForSale
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            featuredImage {
              url
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  sku
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  let products: any[] = [];

  try {
    const res = await fetch(`https://${shopifyDomain}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontToken
      },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    products = data?.data?.products?.edges || [];
  } catch (err) {
    console.error('Failed to query Shopify for Google Merchant feed:', err);
  }

  // Construct Google Base XML (RSS 2.0)
  let itemsXml = '';

  for (const edge of products) {
    const p = edge.node;
    if (!p || !p.handle) continue;

    const variant = p.variants?.edges?.[0]?.node;
    const rawPrice = variant?.price?.amount || p.priceRange?.minVariantPrice?.amount || '649.00';
    const formattedPrice = `${parseFloat(rawPrice).toFixed(2)} INR`;
    const productUrl = `${siteUrl}/product/${p.handle}`;
    
    // High-resolution featured image fallback
    const rawImg = p.featuredImage?.url || `${siteUrl}/products/sujata-spirulina-powder-pouch.jpg`;
    const imageUrl = rawImg.startsWith('http') ? rawImg : `${siteUrl}${rawImg}`;
    
    const id = variant?.id?.replace('gid://shopify/ProductVariant/', '') || p.handle;
    const cleanDesc = cleanText(p.description) || `Buy authentic ${p.title} from Sujata Nutrilive. 100% natural, NABL laboratory tested with zero detectable heavy metals and fast express shipping.`;

    itemsXml += `
    <item>
      <g:id>${escapeXml(id)}</g:id>
      <g:title>${escapeXml(p.title)}</g:title>
      <g:description>${escapeXml(cleanDesc.slice(0, 500))}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${p.availableForSale ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${escapeXml(formattedPrice)}</g:price>
      <g:brand>Sujata Nutrilive</g:brand>
      <g:google_product_category>Health &amp; Beauty &gt; Health Care &gt; Fitness &amp; Nutrition &gt; Vitamins &amp; Supplements</g:google_product_category>
      <g:identifier_exists>${variant?.sku ? 'yes' : 'no'}</g:identifier_exists>
      ${variant?.sku ? `<g:mpn>${escapeXml(variant.sku)}</g:mpn>` : ''}
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Priority Express Courier</g:service>
        <g:price>0.00 INR</g:price>
      </g:shipping>
    </item>`;
  }

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Sujata Nutrilive Official Product Feed</title>
    <link>${siteUrl}</link>
    <description>Official Google Shopping product catalog for Sujata Nutrilive (Cold-Pressed Spirulina &amp; Cellular Nutrition).</description>
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(xmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=14400'
    }
  });
};
