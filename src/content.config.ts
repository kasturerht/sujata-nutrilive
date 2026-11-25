import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { EDITORIAL_TEAM, EXTERNAL_REVIEWERS } from './config/editorial.mjs';
import { NABL_REPORTS } from './config/lab-reports.mjs';

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

// Native Hindi / Marathi guides, served at /{lang}/learn/{slug} by src/pages/[lang]/learn/[...slug].astro.
// The build fails unless a page: is written natively by a named writer in that language (no machine
// translation), carries >= 3 proprietary facts with a real source, and quotes lab values only for an
// ingredient that has a NABL report (src/config/lab-reports.mjs). Credit goes to the in-house editorial
// team; an external reviewer may be named only if registered in src/config/editorial.mjs.
const learnNative = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/learn-native' }),
  schema: z
    .object({
      lang: z.enum(['hi', 'mr']),
      ingredient: z.enum(['spirulina', 'sea-buckthorn', 'moringa', 'shilajit', 'vitamin-b12']),
      slug: z.string().regex(/^[a-z0-9]+(?:[-/][a-z0-9]+)*$/, 'lowercase latin slug, e.g. spirulina or spirulina/how-to-take'),
      title: z.string().min(10).max(60),
      description: z.string().min(50).max(155),
      writer: z.object({ name: z.string().min(2), nativeLanguage: z.enum(['hi', 'mr']) }),
      writtenNatively: z.literal(true, { errorMap: () => ({ message: 'Hindi/Marathi pages must be written natively, never machine-translated' }) }),
      editorialCredit: z.literal(EDITORIAL_TEAM.name).default(EDITORIAL_TEAM.name),
      externalReviewer: z.string().optional(),
      reviewedAt: z.coerce.date(),
      facts: z
        .array(
          z.object({
            text: z.string().min(5),
            source: z.enum(['nabl-report', 'product-label', 'shopify-live-price', 'fssai-certificate']),
            reference: z.string().min(2), // report id, product handle, or certificate number
          })
        )
        .min(3, 'each page needs at least 3 proprietary facts'),
    })
    .superRefine((d, ctx) => {
      if (d.writer.nativeLanguage !== d.lang) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['writer', 'nativeLanguage'], message: `writer must be a native ${d.lang} writer` });
      }
      if (d.externalReviewer && !(d.externalReviewer in EXTERNAL_REVIEWERS)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['externalReviewer'], message: 'reviewer is not registered in src/config/editorial.mjs' });
      }
      d.facts.forEach((f, i) => {
        if (f.source !== 'nabl-report') return;
        const report = (NABL_REPORTS as Record<string, { ingredient: string }>)[f.reference];
        if (!report || report.ingredient !== d.ingredient) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['facts', i, 'reference'], message: `no NABL report ${f.reference} for ${d.ingredient}: use product-label or shopify-live-price facts` });
        }
      });
    }),
});

export const collections = { blog, learnNative };
