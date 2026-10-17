// src/lib/product-entity-resolver.ts
// 🌟 Silicon Valley Dynamic Product Entity & Schema Resolver (October 2026 Enterprise Spec)
// Bridges Shopify Storefront API, Google Merchant Center, Schema.org & AI Grounding (Gemini / Perplexity)

import { BRAND_CONFIG } from '../config/brand';

/**
 * Validates a Global Trade Item Number (GTIN) using the GS1 Modulo-10 Checksum Algorithm.
 * Standard: GS1 General Specifications v24.0.
 */
export function isValidGS1GTIN(gtin: string | null | undefined): boolean {
  if (!gtin || typeof gtin !== 'string') return false;
  const clean = gtin.trim();
  if (!/^\d{8,14}$/.test(clean)) return false;

  const digits = clean.split('').map(Number);
  const checkDigit = digits.pop()!;
  const reversed = digits.reverse();

  let sum = 0;
  for (let i = 0; i < reversed.length; i++) {
    sum += reversed[i] * (i % 2 === 0 ? 3 : 1);
  }
  const calculatedCheck = (10 - (sum % 10)) % 10;
  return checkDigit === calculatedCheck;
}

/**
 * Official Amazon ASIN registry for verified marketplace listings.
 * Cross-references D2C entities with Amazon Brand Registry for Google Shopping Graph triangulation.
 */
const VERIFIED_AMAZON_ASINS: Record<string, string> = {
  'sujata-spirulina-tablets:60': 'B0GMQYS6M4',
  'sujata-spirulina-tablets:120': 'B0DNSXGGTN',
  'sujata-spirulina-tablets': 'B0GMQYS6M4',
  'sujata-spirulina-sea-buckthorn-combo': 'B0DP2FWN4J',
  'sujata-spirulina-sea-buckthorn-combo-pack': 'B0DP2FWN4J',
  'sujata-spirulina-capsules:60': 'B0GMQYS6M4'
};

export interface ResolvedProductEntity {
  brand: string;
  sku: string;
  mpn: string;
  gtin?: string;
  identifierExists: 'yes' | 'no';
  asin?: string;
  sameAs: string[];
  productType: string;
  customLabels: {
    label0: string; // Processing / Purity method
    label1: string; // Zero-Binder formulation
    label2: string; // Regulatory status
    label3: string; // Channel status
  };
  hasCredentials: Array<{
    '@type': string;
    name: string;
    credentialCategory: string;
    recognizedBy: {
      '@type': string;
      name: string;
      url: string;
    };
    identifier?: string;
  }>;
  aboutEntities: Array<{
    '@type': string;
    name: string;
    sameAs: string;
  }>;
}

/**
 * Dynamically resolves all enterprise entity anchors for any Shopify product & variant.
 * Future-proof: Automatically adapts to new products added to Shopify without code changes.
 */
export function resolveDynamicProductEntity(
  product: { handle?: string; title?: string; tags?: string[] },
  variant?: { id?: string; title?: string; sku?: string; barcode?: string }
): ResolvedProductEntity {
  const handle = (product?.handle || '').toLowerCase();
  const productTitle = (product?.title || '').toLowerCase();
  const vTitle = (variant?.title || '').toLowerCase();
  const siteUrl = BRAND_CONFIG.siteUrl || 'https://www.sujatanutrilive.com';

  // 1. Dynamic SKU & MPN Resolution
  const rawSku = variant?.sku?.trim();
  const derivedMpn = rawSku && rawSku.length > 2 
    ? rawSku 
    : `SJT-${handle.replace(/^sujata-/, '').toUpperCase() || 'PRODUCT'}`;
  const finalSku = rawSku || derivedMpn;

  // 2. Safe Mathematical GS1 Barcode Resolution
  const rawBarcode = variant?.barcode?.trim();
  const hasValidBarcode = isValidGS1GTIN(rawBarcode);
  const identifierExists = hasValidBarcode ? 'yes' : 'no';
  const gtin = hasValidBarcode ? rawBarcode : undefined;

  // 3. Amazon ASIN Cross-Entity Triangulation
  let asin: string | undefined = undefined;
  const sameAs: string[] = [];

  // Match variant-specific or product-level ASIN
  for (const [key, val] of Object.entries(VERIFIED_AMAZON_ASINS)) {
    const [hKey, vKey] = key.split(':');
    if (handle.includes(hKey)) {
      if (!vKey || vTitle.includes(vKey)) {
        asin = val;
        break;
      }
    }
  }

  if (asin) {
    sameAs.push(`https://www.amazon.in/dp/${asin}`);
  }
  sameAs.push(`${siteUrl}/product/${product?.handle || handle}`);

  // 4. Dynamic Wikidata Knowledge Graph Mapping (AI Grounding for Gemini, Perplexity, Claude)
  const aboutEntities: Array<{ '@type': string; name: string; sameAs: string }> = [];

  if (handle.includes('spirulina') || productTitle.includes('spirulina')) {
    aboutEntities.push(
      { '@type': 'Thing', name: 'Spirulina (Dietary Supplement)', sameAs: 'https://www.wikidata.org/wiki/Q483259' },
      { '@type': 'Thing', name: 'Phycocyanin', sameAs: 'https://www.wikidata.org/wiki/Q418486' },
      { '@type': 'Thing', name: 'Chlorophyll', sameAs: 'https://www.wikidata.org/wiki/Q43110' }
    );
  }

  if (handle.includes('buckthorn') || productTitle.includes('buckthorn')) {
    aboutEntities.push(
      { '@type': 'Thing', name: 'Hippophae (Sea Buckthorn)', sameAs: 'https://www.wikidata.org/wiki/Q161678' },
      { '@type': 'Thing', name: 'Palmitoleic Acid (Omega-7)', sameAs: 'https://www.wikidata.org/wiki/Q418486' }
    );
  }

  if (handle.includes('moringa') || productTitle.includes('moringa')) {
    aboutEntities.push(
      { '@type': 'Thing', name: 'Moringa oleifera', sameAs: 'https://www.wikidata.org/wiki/Q234127' }
    );
  }

  if (handle.includes('shilajit') || productTitle.includes('shilajit')) {
    aboutEntities.push(
      { '@type': 'Thing', name: 'Shilajit (Mumijo)', sameAs: 'https://www.wikidata.org/wiki/Q21029107' },
      { '@type': 'Thing', name: 'Fulvic Acid', sameAs: 'https://www.wikidata.org/wiki/Q907604' }
    );
  }

  if (handle.includes('b12') || productTitle.includes('vitamin-b12') || productTitle.includes('b12')) {
    aboutEntities.push(
      { '@type': 'Thing', name: 'Vitamin B12', sameAs: 'https://www.wikidata.org/wiki/Q387242' },
      { '@type': 'Thing', name: 'Cobalamin', sameAs: 'https://www.wikidata.org/wiki/Q407635' }
    );
  }

  if (
    handle.includes('cream') || handle.includes('facewash') || handle.includes('facepack') || 
    handle.includes('soap') || handle.includes('oil') || handle.includes('shampoo')
  ) {
    aboutEntities.push(
      { '@type': 'Thing', name: 'Natural Cosmetics', sameAs: 'https://www.wikidata.org/wiki/Q330284' }
    );
  }

  // Fallback entity if none matched
  if (aboutEntities.length === 0) {
    aboutEntities.push(
      { '@type': 'Thing', name: 'Dietary Supplement', sameAs: 'https://www.wikidata.org/wiki/Q273822' }
    );
  }

  // 5. Dynamic Government & Laboratory Regulatory Credentials (YMYL High-Trust)
  const hasCredentials = [
    {
      '@type': 'EducationalOccupationalCredential',
      name: 'FSSAI Statutory Food Safety & Dietary Supplement Registration (Category 13)',
      credentialCategory: 'Government Regulatory Registration',
      recognizedBy: {
        '@type': 'GovernmentOrganization',
        name: 'Food Safety and Standards Authority of India (FSSAI)',
        url: 'https://www.fssai.gov.in'
      },
      identifier: BRAND_CONFIG.fssaiNumber || '21526027000179'
    },
    {
      '@type': 'EducationalOccupationalCredential',
      name: 'Independent Laboratory Nutritional & Purity Assay (IS 7219 Standard)',
      credentialCategory: 'Laboratory Analytical Certification',
      recognizedBy: {
        '@type': 'Organization',
        name: 'National Accreditation Board for Testing and Calibration Laboratories (NABL)',
        url: 'https://nabl-india.org'
      },
      identifier: 'Report #LAL-NN-121023002'
    }
  ];

  // 6. Dynamic Google Merchant Center Categorization & Custom Labels
  let productType = 'Health & Wellness > Vitamins & Supplements > Cellular Superfoods';
  let label0 = 'Cold-Pressed Sub-40C';

  if (handle.includes('soap') || handle.includes('facewash') || handle.includes('facepack') || handle.includes('cream')) {
    productType = 'Beauty & Personal Care > Skin Care > Superfood Facial Care';
    label0 = 'Organic Superfood Skincare';
  } else if (handle.includes('oil') || handle.includes('shampoo')) {
    productType = 'Beauty & Personal Care > Hair Care > Herbal Hair Wellness';
    label0 = 'Herbal Phycocyanin Hair Care';
  } else if (handle.includes('shilajit')) {
    productType = 'Health & Wellness > Ayurvedic & Herbal Supplements > Himalayan Shilajit';
    label0 = 'Purified Himalayan Gold Grade';
  } else if (handle.includes('b12')) {
    productType = 'Health & Wellness > Vitamins & Minerals > Plant-Based Vitamin B12';
    label0 = 'Fermented Plant-Origin B12';
  }

  return {
    brand: BRAND_CONFIG.brandName || 'Sujata Nutrilive',
    sku: finalSku,
    mpn: derivedMpn,
    gtin,
    identifierExists,
    asin,
    sameAs,
    productType,
    customLabels: {
      label0,
      label1: 'Zero Synthetic Binders',
      label2: 'FSSAI Statutory Certified',
      label3: 'Direct D2C Manufacturer'
    },
    hasCredentials,
    aboutEntities
  };
}
