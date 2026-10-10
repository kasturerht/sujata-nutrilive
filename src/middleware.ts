import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();

  // Cache static and marketing/product pages on Vercel Edge CDN
  if (context.request.method === 'GET' && response.status === 200) {
    const pathname = context.url.pathname;

    // Do NOT cache API routes, checkout, or cart
    if (!pathname.startsWith('/api/') && !pathname.startsWith('/cart') && !pathname.startsWith('/checkout')) {
      response.headers.set('Cache-Control', 'public, max-age=120, s-maxage=86400, stale-while-revalidate=604800');
    }
  }

  return response;
});
