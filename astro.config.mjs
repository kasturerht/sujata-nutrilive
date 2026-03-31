import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
// vercel import काढून टाकला आहे

export default defineConfig({
  site: 'https://skadas.com',
  // output आणि adapter काढून टाकले आहेत, कारण आपल्याला साईट 'Static' ठेवायची आहे.
  
  integrations: [
    tailwind(),
    react()
  ],
});