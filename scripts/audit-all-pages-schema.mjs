// scripts/audit-all-pages-schema.mjs
// Comprehensive Forensic Audit of Schema & Indexing Compatibility across ALL 29 URLs
import fs from 'fs';
import crypto from 'crypto';

const BASE_URL = 'https://www.sujatanutrilive.com';

const products = [
  'sujata-spirulina-tablets',
  'sujata-spirulina-powder',
  'sujata-spirulina-capsules',
  'sujata-sea-buckthorn-capsules',
  'sujata-plant-based-vitamin-b12',
  'sujata-pure-himalayan-shilajit',
  'sujata-moringa-powder',
  'sujata-spirulina-facewash',
  'sujata-spirulina-facepack-powder',
  'sujata-spiruglow-bath-soap',
  'sujata-spirulina-korean-cream',
  'sujata-bridal-whitening-cream',
  'sujata-spirulina-coconut-hair-oil',
  'sujata-spirushine-shampoo-conditioner',
  'sujata-spirulina-sea-buckthorn-combo',
  'sujata-spirulina-sea-buckthorn-combo-pack'
];

const learnPages = [
  'best-spirulina-brand-in-india',
  'sea-buckthorn-in-hindi',
  'spirulina-in-marathi',
  'which-company-sea-buckthorn-is-best'
];

const generalPages = [
  '',
  'science',
  'contact',
  'track-order',
  'privacy-policy',
  'refund-policy',
  'shipping-policy',
  'terms-of-service',
  'quiz'
];

const allUrls = [
  ...products.map(h => ({ type: 'product', path: `/product/${h}` })),
  ...learnPages.map(h => ({ type: 'learn', path: `/learn/${h}` })),
  ...generalPages.map(h => ({ type: 'general', path: h ? `/${h}` : '/' }))
];

function validateEntity(entity, path, errors, warnings) {
  if (!entity || typeof entity !== 'object') return;

  const type = entity['@type'];
  const types = Array.isArray(type) ? type : [type];

  // Check 1: Review validation
  if (types.includes('Review')) {
    if (entity.itemReviewed) {
      errors.push(`[CRITICAL] Review has nested 'itemReviewed' field! Directional conflict error.`);
    }
    if (!entity.author || !entity.author.name) {
      errors.push(`Review missing author.name`);
    }
    if (!entity.reviewRating || !entity.reviewRating.ratingValue) {
      errors.push(`Review missing reviewRating.ratingValue`);
    }
  }

  // Check 2: Product validation
  if (types.includes('Product')) {
    if (!entity.name) errors.push(`Product missing name`);
    if (!entity.image) warnings.push(`Product missing image`);
    
    // Check offers
    if (!entity.offers && !entity.review && !entity.aggregateRating) {
      errors.push(`Product missing offers, review, or aggregateRating`);
    }

    if (entity.offers) {
      const offersList = entity.offers['@type'] === 'AggregateOffer' && Array.isArray(entity.offers.offers)
        ? entity.offers.offers
        : (Array.isArray(entity.offers) ? entity.offers : [entity.offers]);

      for (const off of offersList) {
        if (!off.price && !off.lowPrice) errors.push(`Offer missing price/lowPrice`);
        if (!off.priceCurrency) errors.push(`Offer missing priceCurrency`);
        if (!off.availability) errors.push(`Offer missing availability`);
      }
    }

    // Check nested reviews inside product
    if (entity.review) {
      const reviews = Array.isArray(entity.review) ? entity.review : [entity.review];
      for (const r of reviews) {
        if (r.itemReviewed) {
          errors.push(`[CRITICAL] Nested review inside Product contains itemReviewed! This creates phantom invalid products in GSC.`);
        }
      }
    }

    // Check aggregateRating
    if (entity.aggregateRating) {
      if (!entity.aggregateRating.ratingValue) errors.push(`aggregateRating missing ratingValue`);
      if (!entity.aggregateRating.reviewCount && !entity.aggregateRating.ratingCount) {
        errors.push(`aggregateRating missing reviewCount or ratingCount`);
      }
    }
  }

  // Check 3: Breadcrumb validation
  if (types.includes('BreadcrumbList')) {
    if (!Array.isArray(entity.itemListElement) || entity.itemListElement.length === 0) {
      errors.push(`BreadcrumbList has no itemListElement`);
    } else {
      entity.itemListElement.forEach((item, idx) => {
        if (item.position === undefined) errors.push(`Breadcrumb item #${idx} missing position`);
        if (!item.name) errors.push(`Breadcrumb item #${idx} missing name`);
        if (!item.item) warnings.push(`Breadcrumb item #${idx} missing item URL`);
      });
    }
  }

  // Check 4: VideoObject validation
  if (types.includes('VideoObject')) {
    if (!entity.name) errors.push(`VideoObject missing name`);
    if (!entity.description) errors.push(`VideoObject missing description`);
    if (!entity.thumbnailUrl) errors.push(`VideoObject missing thumbnailUrl`);
    if (!entity.uploadDate) errors.push(`VideoObject missing uploadDate`);
  }

  // Check 5: FAQPage validation
  if (types.includes('FAQPage')) {
    if (!Array.isArray(entity.mainEntity) || entity.mainEntity.length === 0) {
      errors.push(`FAQPage has no mainEntity questions`);
    } else {
      entity.mainEntity.forEach((q, idx) => {
        if (!q.name) errors.push(`FAQ item #${idx} missing question name`);
        if (!q.acceptedAnswer || !q.acceptedAnswer.text) {
          errors.push(`FAQ item #${idx} missing acceptedAnswer.text`);
        }
      });
    }
  }

  // Recursively validate child objects / arrays
  for (const key of Object.keys(entity)) {
    if (key === '@graph' && Array.isArray(entity['@graph'])) {
      entity['@graph'].forEach(sub => validateEntity(sub, path, errors, warnings));
    } else if (typeof entity[key] === 'object' && entity[key] !== null) {
      // Don't recurse if already validated
      if (key !== 'review' && key !== 'offers' && key !== 'aggregateRating') {
        validateEntity(entity[key], path, errors, warnings);
      }
    }
  }
}

async function runAudit() {
  console.log(`================================================================`);
  console.log(`🔍 SUJATA NUTRILIVE: 100% FORENSIC AUDIT OF ALL ${allUrls.length} PAGES`);
  console.log(`================================================================\n`);

  const results = [];

  for (let i = 0; i < allUrls.length; i++) {
    const item = allUrls[i];
    const fullUrl = `${BASE_URL}${item.path}`;
    const errors = [];
    const warnings = [];

    process.stdout.write(`[${i + 1}/${allUrls.length}] Auditing: ${item.path || '/'} ... `);

    try {
      const res = await fetch(fullUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' }
      });

      if (!res.ok) {
        errors.push(`HTTP ${res.status}: Failed to load`);
      }

      const html = await res.text();

      // Canonical check
      const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
      const canonical = canonicalMatch ? canonicalMatch[1] : null;
      if (!canonical) {
        errors.push(`Missing canonical tag`);
      }

      // Robots check
      const robotsMatch = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
      const robotsContent = robotsMatch ? robotsMatch[1] : '';
      if (robotsContent.includes('noindex')) {
        errors.push(`[FATAL] Page has 'noindex' in robots meta tag!`);
      }

      // Title check
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      if (!titleMatch || !titleMatch[1].trim()) {
        errors.push(`Missing title tag`);
      }

      // Extract all LD+JSON scripts
      const jsonLdRegex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
      let match;
      const parsedSchemas = [];

      while ((match = jsonLdRegex.exec(html)) !== null) {
        const rawContent = match[1].trim();
        try {
          const parsed = JSON.parse(rawContent);
          parsedSchemas.push(parsed);
        } catch (e) {
          errors.push(`JSON-LD Syntax Error: ${e.message}`);
        }
      }

      if (parsedSchemas.length === 0) {
        errors.push(`No JSON-LD schema found on page`);
      } else {
        // Validate each schema
        for (const schema of parsedSchemas) {
          validateEntity(schema, item.path, errors, warnings);
        }
      }

      const passed = errors.length === 0;
      if (passed) {
        console.log(`✅ PASS (${parsedSchemas.length} schema blocks, ${warnings.length} warnings)`);
      } else {
        console.log(`❌ FAIL (${errors.length} errors, ${warnings.length} warnings)`);
        errors.forEach(e => console.log(`   🚨 ERROR: ${e}`));
      }
      if (warnings.length > 0) {
        warnings.forEach(w => console.log(`   ⚠️  WARN: ${w}`));
      }

      results.push({
        path: item.path || '/',
        type: item.type,
        status: res.status,
        canonical,
        passed,
        errors,
        warnings,
        schemaCount: parsedSchemas.length
      });

    } catch (e) {
      console.log(`💥 EXCEPTION: ${e.message}`);
      results.push({
        path: item.path || '/',
        type: item.type,
        status: 0,
        passed: false,
        errors: [`Exception: ${e.message}`],
        warnings: []
      });
    }
  }

  console.log(`\n================================================================`);
  console.log(`📊 SUMMARY OF SCAN:`);
  console.log(`   Total URLs Tested: ${results.length}`);
  const passCount = results.filter(r => r.passed).length;
  const failCount = results.filter(r => !r.passed).length;
  console.log(`   Passed: ${passCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log(`================================================================\n`);

  fs.writeFileSync('scripts/audit_results.json', JSON.stringify(results, null, 2));
}

runAudit();
