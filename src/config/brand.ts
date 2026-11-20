// src/config/brand.ts
// Central brand governance: Allows merchant to customize phone, WhatsApp, email, and announcement tickers via environment or shop settings.

export const BRAND_CONFIG = {
  brandName: "Sujata Nutrilive",
  legalName: "Sujata Nutrilive Agrotech",
  supportPhone: import.meta.env.PUBLIC_SUPPORT_PHONE || "+91 98347 83503",
  secondaryPhone: "+91 99700 02285",
  supportWhatsAppNumber: import.meta.env.PUBLIC_SUPPORT_WHATSAPP || "919834783503",
  supportEmail: import.meta.env.PUBLIC_SUPPORT_EMAIL || "support@sujatanutrilive.com",
  operatingHours: "10:00 AM - 7:00 PM IST (Mon-Sat)",
  fssaiNumber: "21526027000179",
  address: "Plot No 125, Sai Niwas, Dhandai Colony, Khutwad Nagar, Kamatwade, Nashik, Maharashtra 422008, India",
  googleMapsUrl: "https://share.google/R7aB2MCG9AN5l3RF1",
  // ✅ VERIFIED FACTS ONLY — single source of truth for every trust claim on the site.
  // Lab values below are exactly what Lilaba report LAL-NN-131125023 states. Do not add
  // claims here (heavy metals, phycocyanin, NABL, IS 7219) until a report proving them is on file.
  labReport: {
    lab: "Lilaba Analytical Laboratories LLP, Surat",
    number: "LAL-NN-131125023",
    batch: "SP/SS/Nov01/2025",
    issueDate: "17 Nov 2025",
    sample: "Spirulina Powder",
    pdfUrl: "/lilaba_lab_report_2025_2027.pdf",
    proteinPct: "62.39",
    ironMgPerKg: "290.89",
    calciumMgPerKg: "1407.91",
    moisturePct: "4.12",
    ashPct: "5.79",
  },
  // Verifiable trust figures ONLY. No star rating is claimed anywhere: the store has 1 published review
  // (Judge.me, 2026-11-20), so "4.9/5" and "1,100+ verified buyers" had no source. ordersLabel is backed by
  // the order database (1,396 orders recorded 2026-03-01 to 2026-11-20). Update both together.
  trust: {
    ordersLabel: "1,300+",
    ordersSince: "March 2026",
  },
  announcementTickers: [
    "🌿 100% Pure, Chemical-Free Hydro-Cultivated Spirulina",
    "🧪 Lab Tested: 62.39% Plant Protein",
    "💵 Free Cash on Delivery (COD) Pan-India",
    "⚡ Dispatches in 24 Hours"
  ],
  instagramUrl: import.meta.env.PUBLIC_INSTAGRAM_URL || "https://instagram.com/sujatanutrilive",
  siteUrl: import.meta.env.PUBLIC_SITE_URL || "https://www.sujatanutrilive.com"
};

export function getWhatsAppLink(customMessage?: string) {
  const num = BRAND_CONFIG.supportWhatsAppNumber.replace(/\D/g, '');
  const msg = customMessage ? `?text=${encodeURIComponent(customMessage)}` : '';
  return `https://wa.me/${num}${msg}`;
}
