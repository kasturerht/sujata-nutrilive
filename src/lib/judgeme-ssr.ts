// src/lib/judgeme-ssr.ts
// 🌟 Silicon Valley High-Performance Judge.me SSR Pre-fetch Engine with SWR & Timeout Guard

interface JudgeMeSsrData {
  badgeHtml: string;
  widgetHtml: string;
  hasVerifiedReviews: boolean;
  fetchedAt: number;
}

const SSR_CACHE = new Map<string, JudgeMeSsrData>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes in-memory TTL
const FETCH_TIMEOUT_MS = 1200; // Strict 1.2s circuit-breaker timeout to protect SSR TTFB

export async function getJudgeMeSsrData(
  handle: string | undefined | null,
  shopifyDomain: string | undefined | null,
  publicToken: string | undefined | null
): Promise<{ badgeHtml: string; widgetHtml: string; hasVerifiedReviews: boolean }> {
  if (!handle || !shopifyDomain || !publicToken) {
    return { badgeHtml: '', widgetHtml: '', hasVerifiedReviews: false };
  }

  const cacheKey = `${shopifyDomain}:${handle}`;
  const cached = SSR_CACHE.get(cacheKey);
  const now = Date.now();

  // 1. Fresh Cache Hit -> 0ms instant response without outbound network delay
  if (cached && (now - cached.fetchedAt < CACHE_TTL_MS)) {
    return {
      badgeHtml: cached.badgeHtml,
      widgetHtml: cached.widgetHtml,
      hasVerifiedReviews: cached.hasVerifiedReviews
    };
  }

  // 2. Outbound fetch with strict AbortSignal circuit-breaker
  try {
    const badgeUrl = `https://judge.me/api/v1/widgets/preview_badge?api_token=${encodeURIComponent(publicToken)}&shop_domain=${encodeURIComponent(shopifyDomain)}&handle=${encodeURIComponent(handle)}`;
    const widgetUrl = `https://judge.me/api/v1/widgets/product_review?api_token=${encodeURIComponent(publicToken)}&shop_domain=${encodeURIComponent(shopifyDomain)}&handle=${encodeURIComponent(handle)}`;

    const [bRes, wRes] = await Promise.all([
      fetch(badgeUrl, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: { 'Accept': 'application/json' }
      }),
      fetch(widgetUrl, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: { 'Accept': 'application/json' }
      })
    ]);

    let badgeHtml = '';
    let widgetHtml = '';
    let hasVerifiedReviews = false;

    if (bRes.ok) {
      const bData = await bRes.json();
      badgeHtml = bData.badge || '';
      hasVerifiedReviews = Boolean(badgeHtml && !badgeHtml.includes("data-number-of-reviews='0'"));
    }

    if (wRes.ok) {
      const wData = await wRes.json();
      widgetHtml = wData.widget || '';
    }

    const freshData: JudgeMeSsrData = {
      badgeHtml,
      widgetHtml,
      hasVerifiedReviews,
      fetchedAt: now
    };
    SSR_CACHE.set(cacheKey, freshData);

    return { badgeHtml, widgetHtml, hasVerifiedReviews };
  } catch (err: any) {
    // SWR fallback: If network times out but we have a stale entry, serve it immediately
    if (cached) {
      console.warn(`⚡ [Judge.me SSR SWR] Serving stale cache for ${handle} due to fetch error: ${err?.message || err}`);
      return {
        badgeHtml: cached.badgeHtml,
        widgetHtml: cached.widgetHtml,
        hasVerifiedReviews: cached.hasVerifiedReviews
      };
    }

    console.warn(`⚡ [Judge.me SSR Guard] Timeout/network bypass for ${handle} (${err?.name || err?.message}). Rendering fallback badge.`);
    return { badgeHtml: '', widgetHtml: '', hasVerifiedReviews: false };
  }
}
