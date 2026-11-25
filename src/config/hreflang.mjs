// src/config/hreflang.mjs — language clusters for /learn pages (owner-approved 2026-11-25).
// Each cluster lists the URL of the SAME topic in each language that exists. The 4 indexed vernacular
// pages stay at their URLs and join clusters here; native /hi/ and /mr/ pages replace an entry when they
// ship. Only list URLs that return 200. Used by StoreLayout (<link rel="alternate">) and the sitemap.

export const LOCALES = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' };

export const HREFLANG_CLUSTERS = [
  { id: 'spirulina', en: '/learn/spirulina', hi: '/learn/spirulina-in-hindi', mr: '/learn/spirulina-in-marathi' },
  { id: 'sea-buckthorn', en: '/learn/sea-buckthorn', hi: '/learn/sea-buckthorn-in-hindi' },
];

const norm = (p) => (p || '/').replace(/\/+$/, '') || '/';

/** Alternates for a path: [{ lang: 'en-IN', path }, ..., { lang: 'x-default', path }] or [] if not clustered. */
export function alternatesFor(pathname) {
  const p = norm(pathname);
  const cluster = HREFLANG_CLUSTERS.find((c) => Object.keys(LOCALES).some((l) => c[l] === p));
  if (!cluster) return [];
  const members = Object.keys(LOCALES).filter((l) => cluster[l]).map((l) => ({ lang: LOCALES[l], path: cluster[l] }));
  if (members.length < 2) return [];
  return [...members, { lang: 'x-default', path: cluster.en || members[0].path }];
}
