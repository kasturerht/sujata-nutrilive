---
# Template for a native Hindi or Marathi guide. Copy to e.g. hi/spirulina.md (no leading "_").
# Served at /{lang}/learn/{slug}. Every field below is checked at build time (src/content.config.ts).
lang: hi                      # hi or mr
ingredient: spirulina         # spirulina | sea-buckthorn | moringa | shilajit | vitamin-b12
slug: spirulina               # URL part after /hi/learn/
title: "स्पिरुलिना: लैब रिपोर्ट, सेवन का तरीका और कीमत"   # max 60 characters, written by the native writer
description: "..."            # 50-155 characters
writer:
  name: "Writer's full name"
  nativeLanguage: hi          # must match lang
writtenNatively: true         # required: never machine-translated
reviewedAt: 2026-12-01
# externalReviewer: id-from-src/config/editorial.mjs   (only once a qualified reviewer is registered)
facts:                        # at least 3, each with a real source
  - text: "62.39% protein in NABL lab report LAL-NN-131125023"
    source: nabl-report       # allowed only for spirulina (the only NABL report so far)
    reference: LAL-NN-131125023
  - text: "500 mg per tablet; 1-2 tablets twice a day"
    source: product-label
    reference: sujata-spirulina-tablets
  - text: "120 tablets for ₹550"
    source: shopify-live-price
    reference: sujata-spirulina-tablets
---

Body in Hindi/Marathi, written natively. Standard spellings: स्पिरुलिना, सी बकथॉर्न.
After publishing, add the URL to the matching cluster in src/config/hreflang.mjs.
