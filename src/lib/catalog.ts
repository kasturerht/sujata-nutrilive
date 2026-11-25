// src/lib/catalog.ts
// Single source of truth for buy widgets outside the product template (learn articles, buyer guides).
// Live price / variant / stock from the Shopify Storefront API, cached in memory, with a static
// fallback (all 16 products, verified against Storefront on 2026-11-20) so a Shopify hiccup never breaks an article.

export interface CatalogVariant {
  id: string; // gid://shopify/ProductVariant/...
  title: string;
  price: number;
  compareAt: number | null;
  available: boolean;
}

export interface CatalogProduct {
  handle: string;
  title: string;
  shortTitle: string;
  image: string;
  url: string;
  variants: CatalogVariant[];
}

const v = (id: string, title: string, price: number, compareAt: number | null): CatalogVariant => ({
  id: `gid://shopify/ProductVariant/${id}`, title, price, compareAt, available: true
});

const FALLBACK: Record<string, CatalogProduct> = {
  'sujata-spirulina-powder': {
    handle: 'sujata-spirulina-powder', title: 'Sujata Pure Organic Spirulina Powder (100g)', shortTitle: 'Spirulina Powder',
    image: '/products/sujata-spirulina-powder-pouch.jpg', url: '/product/sujata-spirulina-powder',
    variants: [v('52738357854340', '100g Pouch', 350, 499)]
  },
  'sujata-spirulina-tablets': {
    handle: 'sujata-spirulina-tablets', title: 'Sujata 100% Vegan Spirulina Tablets (500mg, No Binders)', shortTitle: 'Spirulina Tablets',
    image: '/products/sujata-spirulina-tablets-bottle.jpg', url: '/product/sujata-spirulina-tablets',
    variants: [v('52738357952644', '120 Tablets (500mg)', 550, 699)]
  },
  'sujata-spirulina-capsules': {
    handle: 'sujata-spirulina-capsules', title: 'Sujata Premium Spirulina Capsules (500mg)', shortTitle: 'Spirulina Capsules',
    image: '/products/sujata-spirulina-capsules-bottle-transparent.png', url: '/product/sujata-spirulina-capsules',
    variants: [v('52738357985412', '60 Capsules', 499, 550), v('52777647407236', '120 Capsules', 799, 1100), v('67604020002948', '180 Capsules', 1099, 1650)]
  },
  'sujata-sea-buckthorn-capsules': {
    handle: 'sujata-sea-buckthorn-capsules', title: 'Sujata Himalayan Sea Buckthorn Capsules (60 Veg Caps)', shortTitle: 'Sea Buckthorn Capsules',
    image: '/products/sujata-sea-buckthorn-capsules-bottle-transparent.png', url: '/product/sujata-sea-buckthorn-capsules',
    variants: [v('52738358018180', '60 Capsules', 649, 799)]
  },
  'sujata-plant-based-vitamin-b12': {
    handle: 'sujata-plant-based-vitamin-b12', title: 'Sujata Plant-Based Vitamin B12 Capsules (90 Vegan Capsules)', shortTitle: 'Plant-Based Vitamin B12',
    image: 'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/Gemini_Generated_Image_ak4xf2ak4xf2ak4x.png', url: '/product/sujata-plant-based-vitamin-b12',
    variants: [v('52738358050948', '90 Capsules', 649, 699)]
  },
  'sujata-pure-himalayan-shilajit': {
    handle: 'sujata-pure-himalayan-shilajit', title: 'Sujata Pure Himalayan Shilajit Capsules (60 Veg Capsules)', shortTitle: 'Himalayan Shilajit Capsules',
    image: 'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/Gemini_Generated_Image_mo34cpmo34cpmo34.png', url: '/product/sujata-pure-himalayan-shilajit',
    variants: [v('52738358083716', '60 Capsules (30 Days)', 649, 699)]
  },
  'sujata-moringa-powder': {
    handle: 'sujata-moringa-powder', title: 'Sujata Natural Moringa Leaf Powder (100g Pouch - Detox & Cleanse)', shortTitle: 'Moringa Leaf Powder',
    image: 'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/Gemini_Generated_Image_u22nm9u22nm9u22n.png', url: '/product/sujata-moringa-powder',
    variants: [v('52738358116484', '100g Pouch', 249, 299)]
  },
  'sujata-spirulina-facewash': {
    handle: 'sujata-spirulina-facewash', title: 'Sujata Spirulina Face Wash (100ml Pump Bottle)', shortTitle: 'Spirulina Face Wash',
    image: 'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-facewash-bottle.jpg', url: '/product/sujata-spirulina-facewash',
    variants: [v('52738358149252', '100ml', 199, 249)]
  },
  'sujata-spirulina-facepack-powder': {
    handle: 'sujata-spirulina-facepack-powder', title: 'Sujata Organic Spirulina Face Pack Powder (50g Pouch - Detox & Glow)', shortTitle: 'Spirulina Face Pack',
    image: 'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-facepack-pouch.jpg', url: '/product/sujata-spirulina-facepack-powder',
    variants: [v('52738358182020', '50g Pouch', 199, 249)]
  },
  'sujata-spiruglow-bath-soap': {
    handle: 'sujata-spiruglow-bath-soap', title: 'Sujata SpiruGlow Handmade Organic Bath Soap (100g Bar)', shortTitle: 'SpiruGlow Bath Soap',
    image: 'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spiruglow-bath-soap-box.jpg', url: '/product/sujata-spiruglow-bath-soap',
    variants: [v('52738358247556', '100g Bar', 60, 60)]
  },
  'sujata-spirulina-korean-cream': {
    handle: 'sujata-spirulina-korean-cream', title: 'Sujata Spirulina Korean Cream (Glass Skin Moisturiser - 25g)', shortTitle: 'Spirulina Korean Cream',
    image: 'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-korean-cream-jar.jpg', url: '/product/sujata-spirulina-korean-cream',
    variants: [v('52738358313092', '25g Luxury Jar', 999, 1200)]
  },
  'sujata-bridal-whitening-cream': {
    handle: 'sujata-bridal-whitening-cream', title: 'Sujata Bridal Radiance Luxury Cream (50g)', shortTitle: 'Bridal Radiance Cream',
    image: 'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-bridal-whitening-cream-jar.jpg', url: '/product/sujata-bridal-whitening-cream',
    variants: [v('52738358345860', '50g Luxury Jar', 1199, 1499)]
  },
  'sujata-spirulina-coconut-hair-oil': {
    handle: 'sujata-spirulina-coconut-hair-oil', title: 'Sujata Spirulina & Coconut Herbal Hair Oil (50ml - Hair Fall & Scalp Care)', shortTitle: 'Spirulina Coconut Hair Oil',
    image: 'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-hair-oil-bottle.png', url: '/product/sujata-spirulina-coconut-hair-oil',
    variants: [v('52738358378628', '50ml Bottle', 249, 350)]
  },
  'sujata-spirushine-shampoo-conditioner': {
    handle: 'sujata-spirushine-shampoo-conditioner', title: 'Sujata SpiruShine Spirulina Shampoo with Conditioner (100ml - 2-in-1)', shortTitle: 'SpiruShine 2-in-1 Shampoo',
    image: 'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirushine-shampoo-bottle.jpg', url: '/product/sujata-spirushine-shampoo-conditioner',
    variants: [v('52738358411396', '100ml Bottle', 250, 399)]
  },
  'sujata-spirulina-sea-buckthorn-combo': {
    handle: 'sujata-spirulina-sea-buckthorn-combo', title: 'Daily Super Immunity Combo (Spirulina Tablets + Sea Buckthorn Capsules)', shortTitle: 'Spirulina Tablets + Sea Buckthorn Combo',
    image: '/products/sujata-combo-spirulina-sea-buckthorn.jpg', url: '/product/sujata-spirulina-sea-buckthorn-combo',
    variants: [v('52738358444164', '90 Spirulina Tablets + 60 Sea Buckthorn Capsules', 950, 1250), v('52738358476932', '120 Spirulina Tablets + 60 Sea Buckthorn Capsules', 1099, 1498)]
  },
  'sujata-spirulina-sea-buckthorn-combo-pack': {
    handle: 'sujata-spirulina-sea-buckthorn-combo-pack', title: 'Spirulina Capsules + Sea Buckthorn Capsules Combo', shortTitle: 'Spirulina + Sea Buckthorn Combo',
    image: '/products/sujata-combo-spirulina-sea-buckthorn.jpg', url: '/product/sujata-spirulina-sea-buckthorn-combo-pack',
    variants: [v('52759081779332', '1-Month Pack', 1050, 1598), v('52759081812100', '2-Month Pack (+ 2 Free Soaps)', 1700, 3196), v('52759081844868', '3-Month Mega Pack (+ Free Chikki)', 2400, 4794)]
  }
};

export type CatalogHandle = keyof typeof FALLBACK;

const CACHE_TTL_MS = 10 * 60 * 1000;
const FETCH_TIMEOUT_MS = 1500;
let cache: { at: number; data: Record<string, CatalogProduct> } | null = null;

async function fetchLive(handles: string[]): Promise<Record<string, CatalogProduct>> {
  const domain = import.meta.env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
  const token = import.meta.env.PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
  if (!token) return {};
  const fields = handles.map((h, i) => `p${i}: product(handle: ${JSON.stringify(h)}) { handle title featuredImage { url } variants(first: 6) { nodes { id title availableForSale price { amount } compareAtPrice { amount } } } }`).join('\n');
  const res = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
    body: JSON.stringify({ query: `query @inContext(country: IN) { ${fields} }` }),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
  });
  if (!res.ok) return {};
  const json = await res.json();
  const out: Record<string, CatalogProduct> = {};
  for (const node of Object.values<any>(json?.data || {})) {
    if (!node?.handle || !FALLBACK[node.handle]) continue;
    const base = FALLBACK[node.handle];
    const variants: CatalogVariant[] = (node.variants?.nodes || []).map((n: any) => ({
      id: n.id,
      title: n.title,
      price: Math.round(parseFloat(n.price?.amount || '0')),
      compareAt: n.compareAtPrice?.amount ? Math.round(parseFloat(n.compareAtPrice.amount)) : null,
      available: n.availableForSale !== false
    })).filter((x: CatalogVariant) => x.price > 0);
    if (variants.length) out[node.handle] = { ...base, image: node.featuredImage?.url || base.image, variants };
  }
  return out;
}

/** Returns live catalog data for the given handles (falls back per product to verified static data). */
export async function getCatalogProducts(handles: CatalogHandle[]): Promise<Record<string, CatalogProduct>> {
  const now = Date.now();
  if (!cache || now - cache.at > CACHE_TTL_MS) {
    try {
      const live = await fetchLive(Object.keys(FALLBACK));
      if (Object.keys(live).length) cache = { at: now, data: live };
    } catch {
      // keep stale cache / fallback
    }
  }
  const result: Record<string, CatalogProduct> = {};
  for (const h of handles) result[h] = cache?.data[h] || FALLBACK[h];
  return result;
}

// Products hidden from the storefront (out of stock, return date unknown). Their URLs 301 to a live
// product, so every card, buy box and link that names them is skipped. Relist = remove from this set
// AND delete the matching redirect in src/config/legacy-redirects.json + src/pages/product/[handle].astro.
export const UNLISTED_HANDLES = new Set<string>(['sujata-spirulina-powder']);
export const isListed = (handle: string): boolean => !UNLISTED_HANDLES.has(handle);

export const formatINR = (n: number) => '₹' + new Intl.NumberFormat('en-IN').format(Math.round(n));
