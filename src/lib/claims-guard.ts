// src/lib/claims-guard.ts
// Render-time safety net for product copy that comes from Shopify (descriptions and custom.* metafields).
//
// FSSAI (Advertising & Claims) Regulations 2018 and the Nutraceutical Regulations 2022 allow nutrient-function
// claims ("iron contributes to normal haemoglobin formation") but not claims that a food supplement treats,
// cures, reverses or prevents a disease, causes weight loss, or works "N× better". CCPA guidelines add
// misleading-advertisement liability. Editors can still write anything in Shopify; this guard drops any
// SENTENCE carrying such a claim before it renders, so a bad metafield cannot reach the storefront.
// Fix the source text in Shopify too: the guard removes sentences, it does not rewrite them.

// Efficacy / disease claims: never acceptable in marketing copy.
const EFFICACY = new RegExp(
  [
    String.raw`\b(cures?|curing|treats?|treating|reverses?|reversing|eliminat\w*|heals?|healing)\b`,
    String.raw`\bmiracle\w*\b`,
    String.raw`\bclinically proven\b`,
    String.raw`\b\d+(?:\.\d+)?\s?[x×]\s+(?:more|superior|better|stronger|potent|faster)\b`,
    String.raw`\b(?:boost|elevat|rais|restor|increas)\w*\s+(?:\w+\s+){0,2}ha?emoglobin\b`,
    String.raw`\b(?:weight|fat)\s+loss\b|\bbelly fat\b|\bburns?\s+fat\b`,
    String.raw`\bwound\s+healing\b`
  ].join('|'),
  'i'
);

// Disease / condition names: acceptable in safety advice ("speak to your doctor if you have diabetes"),
// not in benefit copy. Used for ingredient, timeline, comparison and description text, not FAQs.
const CONDITION = /\b(diabet\w*|cancer\w*|tumou?r\w*|arthritis|joint pain|sciatica|tingling|myelin|cholesterol|hypertension|blood pressure|an(?:a)?emi\w*|ulcers?)\b/i;

// Cosmetic drug-type claims (Drugs & Cosmetics Act: a cosmetic may cleanse, moisturise or condition, not
// treat acne/dandruff, regrow hair or lighten skin). Matches the claim, not a bare ingredient mention.
const COSMETIC_CLAIM = new RegExp(
  [
    String.raw`\b(?:hair\s+(?:re)?growth|(?:new|baby)\s+hair|grows?\s+(?:new\s+)?hair|anti[-\s]?dandruff|anti[-\s]?acne|anti[-\s]?pimple)\b`,
    String.raw`\banti[-\s]?hair[-\s]?(?:fall|loss|thinning)\b|\bhair[-\s]?thinning\b|\bhair[-\s]?fall\s+reduction\b|\bhair[-\s]?fall\s*(?:&|and)\s*thinning\b|\b(?:hair[-\s]?fall|thinning)\s+control\b`,
    String.raw`\b(?:remov|eliminat|cur|fight|stop|reduc|prevent|control|sooth|calm|clear|kill|fad|lighten)\w*\s+(?:\w+[-\s]){0,3}(?:dandruff|acne|pimples?|breakouts?|backne|hair[-\s]?(?:fall|loss)|thinning|dark[-\s]?spots?|pigmentation|sun[-\s]?tan|tan\s+patches|blemish\w*|marks)\b`,
    String.raw`\bacne(?:[-\s]breakout)?\s+relief\b|\bwhiten\w*|\bskin[-\s]?lighten\w*|\bspot[-\s]?(?:correct\w*|fading)\b|\bspotless\b|\bfairness\b|\bmelanin\b`,
  ].join('|'),
  'i'
);

const splitSentences = (text: string): string[] => text.match(/[^.!?।]+[.!?।]*\s*/g) || [text];

/** Removes sentences with efficacy claims (and, unless `allowConditions`, disease-condition benefit claims). */
export function scrubClaims(text: unknown, opts: { allowConditions?: boolean } = {}): string {
  if (typeof text !== 'string' || !text) return '';
  return splitSentences(text)
    .filter((s) => !EFFICACY.test(s) && !COSMETIC_CLAIM.test(s) && (opts.allowConditions || !CONDITION.test(s)))
    .join('')
    .trim();
}

/** True when the text carries a claim the guard would remove. */
export function hasClaim(text: unknown, opts: { allowConditions?: boolean } = {}): boolean {
  if (typeof text !== 'string' || !text) return false;
  return EFFICACY.test(text) || COSMETIC_CLAIM.test(text) || (!opts.allowConditions && CONDITION.test(text));
}
