import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

const siteUrl = process.env.PUBLIC_SITE_URL || 'https://sujatanutrilive.com';

export default defineConfig({
  site: siteUrl,
  // 'server' mode: enables SSR for dynamic routes (e.g. /product/[handle])
  // while still allowing individual pages to opt-in to prerendering.
  output: 'server',
  adapter: vercel(),
  integrations: [
    tailwind(),
    react(),
    sitemap({
      filter: (page) => !page.includes('/api/') && !page.includes('/thank-you'),
      customPages: [
        `${siteUrl}/`,
        `${siteUrl}/science`,
        `${siteUrl}/quiz`,
        `${siteUrl}/contact`,
        `${siteUrl}/track-order`,
        `${siteUrl}/refund-policy`,
        `${siteUrl}/privacy-policy`,
        `${siteUrl}/terms-of-service`,
        `${siteUrl}/shipping-policy`,
      ],
    }),
  ],
  image: {
    domains: ['cdn.shopify.com'],
  },
});