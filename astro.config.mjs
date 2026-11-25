import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import viteComplianceGuard from './plugins/vite-compliance-guard.mjs';
import { alternatesFor } from './src/config/hreflang.mjs';

const siteUrl = process.env.PUBLIC_SITE_URL || 'https://www.sujatanutrilive.com';

// URLs that currently redirect, so they must stay out of the sitemap.
// Spirulina powder: unlisted, 301 to tablets (src/config/legacy-redirects.json).
const SITEMAP_EXCLUDE = new Set(['/product/sujata-spirulina-powder']);

export default defineConfig({
  site: siteUrl,
  trailingSlash: 'never',
  // 'server' mode: enables SSR for dynamic routes (e.g. /product/[handle])
  // while still allowing individual pages to opt-in to prerendering.
  output: 'server',
  adapter: vercel(),
  server: {
    port: 4321,
    host: true,
  },
  vite: {
    // Build-time regulatory guardrail. Fails `astro build` on any FSSAI / Maharashtra
    // FDA prohibited claim in src/pages, src/components, src/layouts or src/lib.
    plugins: [viteComplianceGuard()],
    server: {
      strictPort: true,
      watch: {
        ignored: ['**/node_modules/**', '**/.git/**', '**/.astro/**', '**/dist/**', '**/*.xlsx', '**/*.pdf'],
      },
    },
  },
  redirects: {
    '/sitemap.xml': '/sitemap-index.xml',
  },
  integrations: [
    tailwind(),
    react(),
    sitemap({
      filter: (page) => {
        if (page.includes('/api/') || page.includes('/thank-you')) return false;
        // Never list error pages or URLs that redirect (sitemaps must hold only 200, self-canonical URLs).
        if (/\/404\/?$/.test(page)) return false;
        if (SITEMAP_EXCLUDE.has(page.replace(siteUrl, '').replace(/\/$/, ''))) return false;
        // Strictly filter out any trailing slash URL except the root homepage
        if (page.endsWith('/') && page !== `${siteUrl}/`) return false;
        return true;
      },
      serialize: (item) => {
        if (item.url.endsWith('/') && item.url !== `${siteUrl}/`) return undefined;
        // No lastmod: stamping every URL with the build time told Google nothing changed-when.
        // Re-add per URL only from a real change date (Shopify updatedAt / content reviewedAt).
        delete item.lastmod;
        // hreflang alternates for /learn language clusters (same source as the <head> links).
        const alts = alternatesFor(new URL(item.url).pathname);
        if (alts.length) item.links = alts.map((a) => ({ lang: a.lang, url: new URL(a.path, siteUrl).toString() }));
        if (item.url.includes('/product/')) {
          item.priority = 0.9;
          item.changefreq = 'daily';
        } else if (item.url === `${siteUrl}/`) {
          item.priority = 1.0;
          item.changefreq = 'daily';
        } else {
          item.priority = 0.8;
          item.changefreq = 'weekly';
        }
        return item;
      },
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
        // 🚀 High-Volume Traffic & AI Overview Content Pillars
        `${siteUrl}/learn/best-spirulina-brand-in-india`,
        `${siteUrl}/learn/spirulina-in-marathi`,
        `${siteUrl}/learn/sea-buckthorn-in-hindi`,
        `${siteUrl}/learn/which-company-sea-buckthorn-is-best`,
        `${siteUrl}/learn/spirulina-tablets-vs-capsules-vs-powder`,
        `${siteUrl}/learn/spirulina-side-effects-in-marathi`,
        `${siteUrl}/learn/spirulina-price-in-india-buyers-guide`,
        `${siteUrl}/learn/sea-buckthorn-capsules-buyers-guide`,
        // 🎯 2026 Commercial-Intent Assets (Buyer-Decision Pages)
        `${siteUrl}/learn/best-spirulina-brands-india-2026-comparison`,
        `${siteUrl}/learn/pure-himalayan-sea-buckthorn-buying-guide`,
        `${siteUrl}/learn/how-to-choose-supplement-brand-india-2026`,
        // 🌟 All 16 Active Shopify Products for Google Shopping & GSC Indexing
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
