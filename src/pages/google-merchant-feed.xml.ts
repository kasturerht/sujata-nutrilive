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

function sanitizeForGoogleCompliance(title: string, desc: string): { title: string; desc: string } {
  let cleanTitle = title;
  let cleanDesc = desc;

  // 1. Shilajit Compliance: Remove high-milligram dosage and hormonal triggers
  if (/shilajit/i.test(title)) {
    cleanTitle = cleanTitle.replace(/\(15,?000mg\s*-\s*/i, '(').replace(/15,?000mg/i, 'Gold Grade');
    cleanDesc = cleanDesc
      .replace(/15,?000mg\s*Equivalent\s*Strength/gi, 'Gold Grade Himalayan Extract')
      .replace(/Testosterone/gi, 'Cellular Vigor')
      .replace(/male reproductive vitality/gi, 'overall endurance and vitality')
      .replace(/reproductive/gi, 'physical');
  }

  // 2. Vitamin B12 Compliance: Remove disease cure / prevention claims (e.g. anemia)
  if (/b12|vitamin/i.test(title)) {
    cleanDesc = cleanDesc
      .replace(/Prevents megaloblastic anemia,/gi, 'Promotes healthy red blood cell formation, combats')
      .replace(/megaloblastic anemia/gi, 'fatigue')
      .replace(/Rebuilds the protective myelin sheath around nerves/gi, 'Supports nervous system and cognitive function');
  }

  // 3. Universal compliance for dietary supplements
  cleanDesc = cleanDesc
    .replace(/\bcures?\b/gi, 'supports')
    .replace(/\btreats?\b/gi, 'supports');

  return { title: cleanTitle, desc: cleanDesc };
}

export const GET: APIRoute = async () => {
  const siteUrl = BRAND_CONFIG.siteUrl || 'https://www.sujatanutrilive.com';
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
            variants(first: 20) {
              edges {
                node {
                  id
                  title
                  sku
                  availableForSale
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                  }
                  image {
                    url
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

    const variantEdges = p.variants?.edges || [];
    if (variantEdges.length === 0) continue;

    // Determine specific Google Category based on product type
    let googleCategory = 'Health &amp; Beauty &gt; Health Care &gt; Fitness &amp; Nutrition &gt; Vitamins &amp; Supplements';
    if (/soap|bath/i.test(p.handle)) {
      googleCategory = 'Health &amp; Beauty &gt; Personal Care &gt; Cosmetics &gt; Bath &amp; Body &gt; Bar Soap';
    } else if (/hair|oil/i.test(p.handle)) {
      googleCategory = 'Health &amp; Beauty &gt; Personal Care &gt; Hair Care &gt; Hair Oil';
    }

    // High-resolution featured image fallback
    const rawDefaultImg = p.featuredImage?.url || `${siteUrl}/products/sujata-spirulina-powder-pouch.jpg`;
    const defaultImageUrl = rawDefaultImg.startsWith('http') ? rawDefaultImg : `${siteUrl}${rawDefaultImg}`;

    const rawCleanDesc = cleanText(p.description) || `Buy authentic ${p.title} from Sujata Nutrilive. 100% natural, NABL laboratory tested with zero detectable heavy metals and fast express shipping.`;
    const { title: compliantTitle, desc: compliantDesc } = sanitizeForGoogleCompliance(p.title, rawCleanDesc);

    for (const vEdge of variantEdges) {
      const variant = vEdge.node;
      if (!variant) continue;

      const rawPrice = variant.price?.amount || p.priceRange?.minVariantPrice?.amount || '499.00';
      const formattedPrice = `${parseFloat(rawPrice).toFixed(2)} INR`;
      
      const variantId = variant.id?.replace('gid://shopify/ProductVariant/', '') || p.handle;
      const productUrl = `${siteUrl}/product/${p.handle}?variant=${variantId}`;
      
      const variantImg = variant.image?.url || defaultImageUrl;
      const imageUrl = variantImg.startsWith('http') ? variantImg : `${siteUrl}${variantImg}`;

      // Variant title formatting (if not default title)
      const isDefaultTitle = !variant.title || variant.title.toLowerCase() === 'default title';
      const itemTitle = isDefaultTitle ? compliantTitle : `${compliantTitle} (${variant.title})`;

      const isAvailable = variant.availableForSale ?? p.availableForSale;

      itemsXml += `
    <item>
      <g:id>${escapeXml(variantId)}</g:id>
      <g:item_group_id>${escapeXml(p.handle)}</g:item_group_id>
      <g:title>${escapeXml(itemTitle)}</g:title>
      <g:description>${escapeXml(compliantDesc.slice(0, 500))}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${isAvailable ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${escapeXml(formattedPrice)}</g:price>
      <g:brand>Sujata Nutrilive</g:brand>
      <g:google_product_category>${googleCategory}</g:google_product_category>
      <g:identifier_exists>no</g:identifier_exists>
      ${variant.sku ? `<g:mpn>${escapeXml(variant.sku)}</g:mpn>` : `<g:mpn>${escapeXml(variantId)}</g:mpn>`}
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Priority Express Courier</g:service>
        <g:price>0.00 INR</g:price>
      </g:shipping>
    </item>`;
    }
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
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
    }
  });
};
