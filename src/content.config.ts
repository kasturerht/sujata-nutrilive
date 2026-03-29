import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  // Astro 6 साठी योग्य लोडर
  loader: glob({ pattern: '**/[^_]*.{md,mdoc}', base: "./src/content/blog" }),
  
  // 👇 बदल इथे आहे: आपण { image } हा हेल्पर फंक्शनमधून आत घेत आहोत
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.string(),
    readTime: z.number(),
    featured: z.boolean().default(false),
    // आता Astro ला समजेल की ही एक 'Asset Image' आहे
    thumbnail: image().optional(),
  }),
});

export const collections = { blog };