// src/config/brand.ts
// Central brand governance: Allows merchant to customize phone, WhatsApp, email, and announcement tickers via environment or shop settings.

export const BRAND_CONFIG = {
  brandName: "Sujata Nutrilive",
  legalName: "Sujata Nutrilive Agrotech",
  supportPhone: import.meta.env.PUBLIC_SUPPORT_PHONE || "+91 98347 83503",
  secondaryPhone: "+91 99700 02285",
  supportWhatsAppNumber: import.meta.env.PUBLIC_SUPPORT_WHATSAPP || "919834783503",
  supportEmail: import.meta.env.PUBLIC_SUPPORT_EMAIL || "support@sujatanutrilive.com",
  operatingHours: "10:00 AM - 6:00 PM IST (Mon-Sat)",
  fssaiNumber: "11521999000284",
  address: "Plot No 125, Sai Niwas, Dhandai Colony, Khutwad Nagar, Kamatwade, Nashik, Maharashtra 422008, India",
  googleMapsUrl: "https://share.google/R7aB2MCG9AN5l3RF1",
  announcementTickers: [
    "🌿 100% Pure Cryo-Extracted Spirulina",
    "🧪 NABL Certified • 0.00% Heavy Metals",
    "💵 Free Cash on Delivery (COD) Pan-India",
    "⚡ Dispatches in 24 Hours"
  ],
  instagramUrl: import.meta.env.PUBLIC_INSTAGRAM_URL || "https://instagram.com/sujatanutrilive",
  siteUrl: import.meta.env.PUBLIC_SITE_URL || "https://sujatanutrilive.com"
};

export function getWhatsAppLink(customMessage?: string) {
  const num = BRAND_CONFIG.supportWhatsAppNumber.replace(/\D/g, '');
  const msg = customMessage ? `?text=${encodeURIComponent(customMessage)}` : '';
  return `https://wa.me/${num}${msg}`;
}
