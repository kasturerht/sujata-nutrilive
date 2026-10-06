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
  redirects: {
    '/sitemap.xml': '/sitemap-index.xml',
  },
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
        // 🌟 All 16 Active Shopify Products for Google Shopping & GSC Indexing
        `${siteUrl}/product/sujata-spirulina-powder`,
        `${siteUrl}/product/sujata-spirulina-tablets`,
        `${siteUrl}/product/sujata-spirulina-capsules`,
        `${siteUrl}/product/sujata-sea-buckthorn-capsules`,
        `${siteUrl}/product/sujata-plant-based-vitamin-b12`,
        `${siteUrl}/product/sujata-pure-himalayan-shilajit`,
        `${siteUrl}/product/sujata-moringa-powder`,
        `${siteUrl}/product/sujata-spirulina-facewash`,
        `${siteUrl}/product/sujata-spirulina-facepack-powder`,
        `${siteUrl}/product/sujata-spiruglow-bath-soap`,
        `${siteUrl}/product/sujata-spirulina-korean-cream`,
        `${siteUrl}/product/sujata-bridal-whitening-cream`,
        `${siteUrl}/product/sujata-spirulina-coconut-hair-oil`,
        `${siteUrl}/product/sujata-spirushine-shampoo-conditioner`,
        `${siteUrl}/product/sujata-spirulina-sea-buckthorn-combo`,
        `${siteUrl}/product/sujata-spirulina-sea-buckthorn-combo-pack`,
      ],
    }),
  ],
  image: {
    domains: ['cdn.shopify.com'],
  },
});