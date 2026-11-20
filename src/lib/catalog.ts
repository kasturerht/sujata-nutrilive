// src/lib/catalog.ts
// Single source of truth for buy widgets outside the product template (learn articles, buyer guides).
// Live price / variant / stock from the Shopify Storefront API, cached in memory, with a static
// fallback (verified against Storefront on 2026-11-20) so a Shopify hiccup never breaks an article.

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
  'sujata-spirulina-capsules': {
    handle: 'sujata-spirulina-capsules', title: 'Sujata Premium Spirulina Capsules (500mg)', shortTitle: 'Spirulina Capsules',
    image: '/products/sujata-spirulina-capsules-bottle-transparent.png', url: '/product/sujata-spirulina-capsules',
    variants: [v('52738357985412', '60 Capsules', 499, 550), v('52777647407236', '120 Capsules', 799, 1100), v('67604020002948', '180 Capsules', 1099, 1650)]
  },
  'sujata-spirulina-tablets': {
    handle: 'sujata-spirulina-tablets', title: 'Sujata 100% Vegan Spirulina Tablets (500mg, No Binders)', shortTitle: 'Spirulina Tablets',
    image: '/products/sujata-spirulina-tablets-bottle.jpg', url: '/product/sujata-spirulina-tablets',
    variants: [v('52738357887108', '60 Tablets (500mg)', 350, 400), v('52738357952644', '120 Tablets (500mg)', 550, 699)]
  },
  'sujata-spirulina-powder': {
    handle: 'sujata-spirulina-powder', title: 'Sujata Pure Organic Spirulina Powder (100g)', shortTitle: 'Spirulina Powder',
    image: '/products/sujata-spirulina-powder-pouch.jpg', url: '/product/sujata-spirulina-powder',
    variants: [v('52738357854340', '100g Pouch', 350, 499)]
  },
  'sujata-sea-buckthorn-capsules': {
    handle: 'sujata-sea-buckthorn-capsules', title: 'Sujata Himalayan Sea Buckthorn Capsules (60 Veg Caps)', shortTitle: 'Sea Buckthorn Capsules',
    image: '/products/sujata-sea-buckthorn-capsules-bottle-transparent.png', url: '/product/sujata-sea-buckthorn-capsules',
    variants: [v('52738358018180', '60 Capsules', 649, 799)]
  },
  'sujata-spirulina-sea-buckthorn-combo-pack': {
    handle: 'sujata-spirulina-sea-buckthorn-combo-pack', title: 'Spirulina Capsules + Sea Buckthorn Capsules Combo', shortTitle: 'Spirulina + Sea Buckthorn Combo',
    image: '/products/sujata-combo-spirulina-sea-buckthorn.jpg', url: '/product/sujata-spirulina-sea-buckthorn-combo-pack',
    variants: [v('52759081779332', '1-Month Pack', 1050, 1598), v('52759081812100', '2-Month Pack (+ 2 Free Soaps)', 1700, 3196), v('52759081844868', '3-Month Mega Pack (+ Free Chikki)', 2400, 4794)]
  },
  'sujata-spirulina-sea-buckthorn-combo': {
    handle: 'sujata-spirulina-sea-buckthorn-combo', title: 'Daily Super Immunity Combo (Spirulina Tablets + Sea Buckthorn Capsules)', shortTitle: 'Spirulina Tablets + Sea Buckthorn Combo',
    image: '/products/sujata-combo-spirulina-sea-buckthorn.jpg', url: '/product/sujata-spirulina-sea-buckthorn-combo',
    variants: [v('52738358444164', '90 Tablets + 60 Sea Buckthorn Capsules', 950, 1250), v('52738358476932', '120 Tablets + 60 Sea Buckthorn Capsules', 1099, 1498)]
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

export const formatINR = (n: number) => '₹' + new Intl.NumberFormat('en-IN').format(Math.round(n));
