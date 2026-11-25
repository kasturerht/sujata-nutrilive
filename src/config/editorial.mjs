// src/config/editorial.mjs — who stands behind /learn content.
// There is no external medical reviewer yet (owner decision 2026-11-25): content is credited to the
// in-house team, backed by the FSSAI registration. Never invent a named doctor, dietitian or pharmacist.
// When a qualified external reviewer joins, add them to EXTERNAL_REVIEWERS (all fields required) and
// reference their id from a page; the Article schema then gains `reviewedBy`.

export const SITE_URL = 'https://www.sujatanutrilive.com';

export const EDITORIAL_TEAM = {
  name: 'Sujata Nutrilive Quality & Editorial Team',
  description: 'In-house team responsible for product facts, lab-report data and compliance review of every guide.',
  fssaiRegistration: '11526999001381', // FSSAI Central License (valid to 21-11-2027)
  fssaiLabel: 'FSSAI Central License',
  url: `${SITE_URL}/science`,
};

/** @type {Record<string, { name: string; credential: string; registrationNumber: string; url?: string }>} */
export const EXTERNAL_REVIEWERS = {};

/** schema.org author/publisher block for guides. */
export function editorialAuthorSchema() {
  return {
    '@type': 'Organization',
    name: EDITORIAL_TEAM.name,
    description: EDITORIAL_TEAM.description,
    url: EDITORIAL_TEAM.url,
    parentOrganization: { '@id': `${SITE_URL}/#organization` },
  };
}

/** Returns reviewedBy schema only for a real, fully specified external reviewer; otherwise undefined. */
export function reviewerSchema(reviewerId) {
  const r = reviewerId ? EXTERNAL_REVIEWERS[reviewerId] : undefined;
  if (!r) return undefined;
  if (!r.name || !r.credential || !r.registrationNumber) throw new Error(`External reviewer ${reviewerId} is missing name, credential or registration number`);
  return { '@type': 'Person', name: r.name, hasCredential: { '@type': 'EducationalOccupationalCredential', name: r.credential, identifier: r.registrationNumber }, ...(r.url ? { url: r.url } : {}) };
}
