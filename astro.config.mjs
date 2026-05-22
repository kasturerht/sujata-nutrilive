import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://skadas.com',
  // 'server' mode: enables SSR for dynamic routes (e.g. /product/[handle])
  // while still allowing individual pages to opt-in to prerendering.
  output: 'server',
  adapter: vercel(),
  integrations: [
    tailwind(),
    react(),
  ],
  image: {
    domains: ['cdn.shopify.com'],
  },
});