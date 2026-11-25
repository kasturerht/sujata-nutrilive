// src/config/lab-reports.mjs — the only lab values pages may quote.
// Source: Lilaba Analytical Laboratories test report LAL-NN-131125023 (pages 4-5 of
// /NABL-Report-Sujata.pdf). Values below are copied from that report, nothing else. The manufacturer's
// own batch certificate (page 2: C-phycocyanin, SOD, heavy metals) is NOT a NABL lab report and is not
// listed here. Ingredients without a report (sea buckthorn, moringa, shilajit, B12) must not quote lab
// values: use LABEL_FACTS and live Shopify prices instead.

export const NABL_REPORTS = {
  'LAL-NN-131125023': {
    ingredient: 'spirulina',
    lab: 'Lilaba Analytical Laboratories LLP, Surat',
    accreditation: 'NABL certificate TC-7179 (as stated in the brand dossier)',
    sample: 'Spirulina powder, batch SP/SS/Nov01/2025 (mfg 11/2025, exp 10/2027)',
    issued: '2025-11-17',
    pdf: '/NABL-Report-Sujata.pdf',
    pages: '4-5',
    // per 100 g unless the unit says otherwise
    results: [
      { name: 'Protein', value: 62.39, unit: '%' },
      { name: 'Carbohydrate', value: 19.99, unit: '%' },
      { name: 'Fat', value: 7.71, unit: '%' },
      { name: 'Dietary fibre', value: 3.59, unit: '%' },
      { name: 'Sugar', value: 3.17, unit: '%' },
      { name: 'Moisture', value: 4.12, unit: '%' },
      { name: 'Ash', value: 5.79, unit: '%' },
      { name: 'Energy', value: 398.91, unit: 'kcal/100 g' },
      { name: 'Iron (as Fe)', value: 290.89, unit: 'mg/kg' },
      { name: 'Calcium (as Ca)', value: 1407.91, unit: 'mg/kg' },
      { name: 'Potassium (as K)', value: 13972.57, unit: 'mg/kg' },
      { name: 'Sodium (as Na)', value: 10924.51, unit: 'mg/kg' },
      { name: 'Vitamin A', value: 182.47, unit: 'µg/100 g' },
      { name: 'Vitamin C', value: 12.79, unit: 'mg/100 g' },
      { name: 'Vitamin E', value: 5.61, unit: 'mg/100 g' },
    ],
    belowQuantification: ['Vitamin D', 'Cholesterol', 'Trans fat', 'Added sugar', 'Sucrose'],
  },
};

export const ingredientsWithNablReport = () => new Set(Object.values(NABL_REPORTS).map((r) => r.ingredient));

export function reportFor(ingredient) {
  const entry = Object.entries(NABL_REPORTS).find(([, r]) => r.ingredient === ingredient);
  return entry ? { id: entry[0], ...entry[1] } : null;
}

// Label facts as published on the brand's own product listings (Shopify), 2026-11-25.
export const LABEL_FACTS = {
  'sujata-spirulina-tablets': { unit: 'tablet', perUnitMg: 500, ingredient: 'Spirulina powder', dose: '1 to 2 tablets twice a day with water', unitsPerDayMin: 2, unitsPerDayMax: 4 },
  'sujata-spirulina-capsules': { unit: 'capsule', perUnitMg: 500, ingredient: 'Spirulina powder in a vegetarian capsule', dose: '1 capsule twice a day after breakfast and lunch', unitsPerDayMin: 2, unitsPerDayMax: 2 },
  'sujata-sea-buckthorn-capsules': { unit: 'capsule', perUnitMg: 500, ingredient: 'Sea buckthorn (Hippophae rhamnoides) fruit and seed extract in a vegetarian capsule', dose: '1 capsule twice a day after meals', unitsPerDayMin: 2, unitsPerDayMax: 2 },
};
