import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel'; 
import sanity from '@sanity/astro';

export default defineConfig({
  site: 'https://skadas.com',
  output: 'server',
  adapter: vercel(), 
  
  integrations: [
    tailwind(),
    react(), 
    sanity({
      projectId: '85cm0clo', 
      dataset: 'production',
      useCdn: false,
      studioBasePath: '/admin', 
    }),
  ],
});