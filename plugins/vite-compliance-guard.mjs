// plugins/vite-compliance-guard.mjs
//
// Sujata Nutrilive — Build-time Compliance Guard (Vite plugin)
//
// Blocks `npm run build` the moment any scanned source file contains text
// that matches an FSSAI (Advertising & Claims Regs 2018 + Nutraceutical Regs
// 2022) or Maharashtra FDA (Nov-2026 Mundhe order) prohibited claim. It is a
// pre-emptive guardrail — it edits nothing.
//
// Scope: scans .astro / .ts / .tsx / .js / .jsx under src/pages, src/components,
// src/layouts and src/lib. Runs ONLY at `astro build`, never in dev. Fail-closed:
// zero violations = build proceeds, otherwise `throw` aborts the build.
//
// Design notes:
//  - Sentence-level allowlist for the FSSAI-mandated statutory disclaimer, so
//    the required "not intended to diagnose, treat, cure or prevent any
//    disease" line is explicitly exempt.
//  - Rules suffixed "-schema" check the raw file (JSON-LD lives in frontmatter);
//    all other rules check the visible text only, so author comments about
//    "removed foo" don't false-fire the guard.
//  - The plugin itself and src/lib/claims-guard.ts are skipped — they are the
//    rulebook, so their regex strings would otherwise flag themselves.

import fs from 'node:fs';
import path from 'node:path';

const RULES = [
  {
    id: 'disease-cure',
    pattern: /\b(cures?|curing|treats?|treating|reverses?|heals?)\s+(an(?:ae|e|a)mia|diabet\w*|pcos|nafld|hba1c|hypertension|arthritis|cancer\w*|ulcer\w*|thyroid|kidney|liver)\b/i,
    why: 'Claims to cure, treat or reverse a named disease (FSS 2018 Reg 4(5) + Nutra 2022).'
  },
  {
    id: 'miracle',
    pattern: /\bmiracle\w*\b/i,
    why: '"Miracle" implies drug-equivalent efficacy — banned by CCPA + FSSAI.'
  },
  {
    id: 'clinically-proven',
    pattern: /\bclinically[-\s]proven\b/i,
    why: '"Clinically proven" is a disallowed drug-equivalent claim for a food supplement.'
  },
  {
    id: 'clinically-validated',
    pattern: /\bclinically[-\s](validated|verified|certified)\b/i,
    why: 'Drug-equivalent clinical-validation framing.'
  },
  {
    id: 'burns-melts-fat',
    pattern: /\b(burns?|melts?|torch\w*)\s+fat\b/i,
    why: 'Anti-obesity drug-like efficacy claim.'
  },
  {
    id: 'belly-fat',
    pattern: /\bbelly\s+fat\b/i,
    why: 'Spot fat-reduction claim — drug-equivalent.'
  },
  {
    id: 'outcome-guarantee',
    pattern: /(?:100\s*%\s*(?:money[-\s]?back|refund)|money[-\s]?back\s+guarantee|१००\s*%\s*मनी[-\s]?ब(?:ै|ॅ)क|empty[-\s]?bottle\s+(?:vitality\s+)?guarantee)/i,
    why: 'Outcome-conditional refund language — regulator reads this as implicit efficacy promise.'
  },
  {
    id: 'fake-doctor-endorsement',
    pattern: /\b(Hepatologist|Nephrologist|Oncologist|Dermatologist|Gynaecologist|Gynecologist|Cardiologist|Nutritionist|Ophthalmologist)[-\s]+(Reviewed|Verified|Approved|Certified|Recommended|Endorsed)\b/i,
    why: 'Specialist-endorsement framing banned by Maharashtra FDA Nov-2026 order.'
  },
  {
    id: 'doctor-recommended',
    pattern: /\b(doctor|physician|gynaecologist|nutritionist)s?[-\s]+(recommended|approved|endorsed)\b/i,
    why: 'Doctor/nutritionist endorsement language (Maharashtra FDA Nov-2026).'
  },
  {
    id: 'disease-name-nafld',
    pattern: /\bNAFLD\b/,
    why: 'ICD-coded disease name in supplement copy.'
  },
  {
    id: 'biomarker-hba1c',
    pattern: /\bHbA1c\b/i,
    why: 'Medical biomarker — implies therapeutic monitoring of a diagnosed condition.'
  },
  {
    id: 'biomarker-alt-ast',
    pattern: /\b(ALT\/AST|ALT\s+and\s+AST|AST\s+and\s+ALT)\b/,
    why: 'Liver-enzyme biomarker — implies therapeutic monitoring.'
  },
  {
    id: 'disease-keratoconjunctivitis',
    pattern: /\bkeratoconjunctivitis\b/i,
    why: 'ICD-coded eye disease in supplement copy.'
  },
  {
    id: 'disease-sjogren',
    pattern: /\bsj[öo]gren\b/i,
    why: 'Named autoimmune disease in supplement copy.'
  },
  {
    id: 'disease-telogen-effluvium',
    pattern: /\btelogen\s+effluvium\b/i,
    why: 'ICD-coded hair-loss condition in supplement copy.'
  },
  {
    id: 'cure-anemia-hindi',
    pattern: /एनीमिया\s+(?:को|का|ठीक|दूर|से\s+मुक्ति)/,
    why: 'Hindi "cure/relieve anemia" framing.'
  },
  {
    id: 'cure-diabetes-marathi',
    pattern: /रक्तातील\s+साखर.*(?:स्थिर|नियंत्रित|कमी)/,
    why: 'Marathi "stabilises/controls blood sugar" framing.'
  },
  // ---- Hindi / Marathi (Devanagari) equivalents — high-precision phrasing only ----
  {
    id: 'cure-disease-hindi',
    pattern: /(?:रोग|बीमारी|मधुमेह|डायबिटीज|शुगर|कैंसर|थायराइड|बवासीर|गठिया)\s*(?:को\s+)?(?:जड़\s+से\s+(?:खत्म|मिटा)|(?:पूरी\s+तरह\s+)?ठीक\s+कर(?:ता|ती|ते|ेगा|ेगी))/,
    why: 'Hindi claim that a supplement cures or eliminates a disease (FSS 2018 Reg 4(5); DMR Act 1954).'
  },
  {
    id: 'cure-disease-marathi',
    pattern: /(?:रोग|आजार|मधुमेह|डायबिटीज|शुगर|कर्करोग|थायरॉईड|मूळव्याध|संधिवात)\s*(?:पूर्णपणे\s+|कायमचा\s+)?(?:बरा\s+(?:करतो|करते|होतो|होते)|मुळापासून\s+(?:नष्ट|बरा))/,
    why: 'Marathi claim that a supplement cures a disease (FSS 2018 Reg 4(5); DMR Act 1954).'
  },
  {
    id: 'miracle-devanagari',
    pattern: /चमत्कार|रामबाण/,
    why: '"Miracle / panacea" in Hindi or Marathi — drug-equivalent efficacy framing (CCPA + FSSAI).'
  },
  {
    id: 'weight-loss-devanagari',
    pattern: /वजन\s+(?:घटा(?:ए|ता|ती|ने)|कम\s+कर(?:ता|ती|ते|ने)|कमी\s+(?:करतो|करते|करण्यास|होते|होतो))/,
    why: 'Hindi/Marathi weight-loss claim — obesity is a DMR Act 1954 scheduled condition.'
  },
  {
    id: 'cosmetic-drug-claim',
    // Not when part of a URL handle or file name (e.g. /product/sujata-bridal-whitening-cream).
    pattern: /(?<![-\/\w])(?:hair[\s-]growth|anti[\s-]dandruff|anti[\s-]hair[\s-](?:thinning|fall|loss)|hair[\s-]thinning|anti[\s-]acne|whitening|dark[\s-]spot[\s-]correct\w*|spot[\s-]corrector|(?:reduc\w*|stops?|control\w*)\s+hair[\s-]fall|hair[\s-]fall\s*(?:&|and)\s*thinning|(?:hair[\s-]fall|thinning)\s+control)(?![-\w])/i,
    why: 'Cosmetic drug-type claim (acne, dandruff, hair growth/thinning, whitening): a cosmetic may cleanse, moisturise or condition only (Drugs & Cosmetics Act).'
  },
  {
    id: 'superseded-fssai-number',
    // Old registration replaced by FSSAI Central License 11526999001381 on 22-11-2026. Use BRAND_CONFIG.fssaiNumber.
    pattern: /21526027000179/,
    why: 'Superseded FSSAI registration number: use the Central License (BRAND_CONFIG.fssaiNumber).',
    scanRaw: true
  },
  // ---- Schema-field rules (run against raw file, not stripped text) --------
  {
    id: 'schema-medicalcondition',
    pattern: /"@type"\s*:\s*"MedicalCondition"/,
    why: 'MedicalCondition JSON-LD type — forbidden declarative schema in supplement marketing.',
    scanRaw: true
  },
  {
    id: 'schema-mechanismofaction',
    pattern: /"mechanismOfAction"\s*:/,
    why: 'mechanismOfAction schema field — drug-equivalent framing.',
    scanRaw: true
  },
  {
    id: 'schema-medicalwebpage-learn',
    pattern: /"@type"\s*:\s*(\[\s*"MedicalWebPage"|"MedicalWebPage"\s*(?:,|\]))/,
    why: 'MedicalWebPage dual-typing on a supplement learn page — declares the page as medical information to Google.',
    scanRaw: true,
    scopeGlob: /[\\/]src[\\/]pages[\\/]learn[\\/]/
  }
];

// Sentences that match this pattern are exempt — the FSSAI-mandated statutory
// disclaimer itself legitimately uses words like "treat", "cure", "diagnose".
const DISCLAIMER_WHITELIST = /(?:not\s+intended\s+to\s+diagnose|not\s+a\s+substitute\s+for|not\s+(?:meant|a\s+medicine)\s+to\s+(?:treat|cure)|is\s+not\s+a\s+cure\s+for|किसी.*रोग.*इलाज\s+नहीं|दवा\s+नहीं|किसी\s+रोग\s+का\s+(?:निदान|उपचार|इलाज)\s+नहीं|not\s+a\s+medicine|औषध\s+नाही|कोणत्याही\s+(?:आजाराचे|रोगाचे).*(?:निदान|उपचार).*नाही)/i;

function stripFrontmatter(src) {
  return src.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, '');
}

function extractVisibleText(source) {
  let s = stripFrontmatter(source);
  s = s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ');
  s = s.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ');
  s = s.replace(/<!--[\s\S]*?-->/g, ' ');
  s = s.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, ' ');
  return s;
}

function sentenceList(text) {
  return text.match(/[^.!?।\n]+[.!?।\n]/g) || [text];
}

const SKIP_FILE_RE = /(claims-guard\.ts|vite-compliance-guard\.mjs)$/;
const SCAN_FILE_RE = /\.(astro|ts|tsx|js|jsx|mjs|md|mdx|json)$/i;
const SCAN_DIRS = ['src/pages', 'src/components', 'src/layouts', 'src/lib', 'src/content', 'src/data', 'src/config'];

// A page whose URL names a disease or a weight-loss outcome is a claim by itself, whatever the copy says
// (DMR Act 1954 schedule: diabetes, obesity, cancer, arthritis ...). Checked on route file paths under src/pages.
const DISEASE_ROUTE_RE = /(diabet|obesity|weight-?loss|fat-?loss|fatty-?liver|cancer|arthritis|thyroid|dry-?eyes|an(?:a)?emia|pcos|hypertension|\bcures?\b)/i;

function walkCollect(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walkCollect(p, out);
    else if (SCAN_FILE_RE.test(entry.name) && !SKIP_FILE_RE.test(p)) out.push(p);
  }
}

export function scanRoute(file, root = process.cwd()) {
  const rel = path.relative(root, file).replace(/\\/g, '/');
  if (!rel.startsWith('src/pages/')) return [];
  const m = rel.match(DISEASE_ROUTE_RE);
  return m ? [{ rule: 'disease-route', why: 'Route names a disease or weight-loss outcome (DMR Act 1954 / FSSAI).', excerpt: rel }] : [];
}

export function scanOne(file) {
  return scanSource(file, fs.readFileSync(file, 'utf8'));
}

export function scanSource(file, raw) {
  const visible = extractVisibleText(raw);
  const violations = [];
  for (const rule of RULES) {
    if (rule.scopeGlob && !rule.scopeGlob.test(file)) continue;
    const target = rule.scanRaw ? raw : visible;
    const m = target.match(rule.pattern);
    if (!m) continue;
    const sentence = sentenceList(target).find((s) => rule.pattern.test(s));
    if (sentence && DISCLAIMER_WHITELIST.test(sentence)) continue;
    violations.push({
      rule: rule.id,
      why: rule.why,
      excerpt: (sentence || m[0]).replace(/\s+/g, ' ').trim().slice(0, 200)
    });
  }
  return violations;
}

function format(violationsByFile, root) {
  const total = Object.values(violationsByFile).reduce((n, v) => n + v.length, 0);
  const lines = [
    '',
    '🛑 Sujata Compliance Guard — BUILD BLOCKED',
    '',
    `   ${total} violation(s) in ${Object.keys(violationsByFile).length} file(s).`,
    '   Framework: FSSAI Advertising & Claims Regs 2018 + Nutraceutical Regs 2022',
    '              + Maharashtra FDA (Tukaram Mundhe) Nov-2026 enforcement order.',
    ''
  ];
  for (const [file, viols] of Object.entries(violationsByFile)) {
    lines.push(`  ✕ ${path.relative(root, file).replace(/\\/g, '/')}`);
    for (const v of viols) {
      lines.push(`      · [${v.rule}] ${v.why}`);
      lines.push(`        "${v.excerpt}"`);
    }
    lines.push('');
  }
  lines.push('Fix the flagged sentences and re-run `npm run build`.');
  lines.push('See /src/lib/claims-guard.ts for the approved language patterns.');
  lines.push('');
  return lines.join('\n');
}

export default function viteComplianceGuard() {
  return {
    name: 'sujata-compliance-guard',
    apply: 'build',
    enforce: 'pre',
    buildStart() {
      const root = process.cwd();
      const files = [];
      for (const d of SCAN_DIRS) walkCollect(path.join(root, d), files);

      const violationsByFile = {};
      for (const f of files) {
        const v = [...scanRoute(f, root), ...scanOne(f)];
        if (v.length) violationsByFile[f] = v;
      }

      if (Object.keys(violationsByFile).length > 0) {
        throw new Error(format(violationsByFile, root));
      }

      this.info?.(`✅ Sujata Compliance Guard — ${files.length} files scanned, zero violations.`);
      // Also log, since Vite info may be suppressed in some adapters.
      console.log(`\n✅ Sujata Compliance Guard — ${files.length} files scanned, zero FSSAI/FDA violations.\n`);
    }
  };
}
