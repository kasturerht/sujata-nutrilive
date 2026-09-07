// src/config/brand.ts
// Central brand governance: Allows merchant to customize phone, WhatsApp, email, and announcement tickers via environment or shop settings.

export const BRAND_CONFIG = {
  brandName: "Sujata Nutrilive",
  supportPhone: import.meta.env.PUBLIC_SUPPORT_PHONE || "+91 98765 43210",
  supportWhatsAppNumber: import.meta.env.PUBLIC_SUPPORT_WHATSAPP || "919876543210",
  supportEmail: import.meta.env.PUBLIC_SUPPORT_EMAIL || "support@sujatanutrilive.com",
  operatingHours: "10:00 AM - 6:00 PM IST (Mon-Sat)",
  fssaiNumber: "11521999000284",
  address: "42/B, Prabhat Road, Deccan Gymkhana, Pune, Maharashtra 411004, India",
  announcementTickers: [
    "🌿 100% Pure Cryo-Extracted Spirulina",
    "🧪 NABL Certified • 0.00% Heavy Metals",
    "💵 Free Cash on Delivery (COD) Pan-India",
    "⚡ Dispatches in 24 Hours"
  ]
};

export function getWhatsAppLink(customMessage?: string) {
  const num = BRAND_CONFIG.supportWhatsAppNumber.replace(/\D/g, '');
  const msg = customMessage ? `?text=${encodeURIComponent(customMessage)}` : '';
  return `https://wa.me/${num}${msg}`;
}
