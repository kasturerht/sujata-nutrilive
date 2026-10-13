# 🏷️ Sujata Nutrilive — Google Tag Manager (GTM) Architecture & Audit Specification

> **Purpose:** This document provides a complete technical breakdown of the Google Tag Manager setup for `www.sujatanutrilive.com` (Container: `GTM-5BCC6JL8`). It allows any analytics engineer or AI to verify tag configurations, trigger firing logic, and dataLayer schemas without requiring Google Cloud or GTM API access.

---

## 1. Container Overview

| Property | Value |
| :--- | :--- |
| **GTM Container Public ID** | `GTM-5BCC6JL8` |
| **GTM Account ID** | `6381104411` |
| **GTM Container ID** | `266369056` |
| **Target Website** | `https://www.sujatanutrilive.com` |
| **Meta Pixel ID** | `1314112957191765` |
| **GA4 Measurement ID** | `G-5WZ8DNW2PD` |
| **Google Ads Conversion Linker** | Enabled (Tag ID: 23) |

---

## 2. Active Tags & Trigger Matrix

| Tag ID | Tag Name | Type | Firing Trigger | Output / Payload |
| :--- | :--- | :--- | :--- | :--- |
| **17** | `Meta Pixel - Base Code & PageView` | Custom HTML | All Pages (Pageview) | Initializes Meta Pixel `1314112957191765` and fires `fbq('track', 'PageView')`. |
| **15** | `Google Tag (GA4)` | Native `googtag` | All Pages (Pageview) | Sends page view and user session data to GA4 (`G-5WZ8DNW2PD`). |
| **23** | `Google Ads - Conversion Linker` | Native `gclidw` | All Pages (Pageview) | Captures GCLID / UTM parameters across domains for Google Ads attribution. |
| **24** | `Meta Pixel - ViewContent` | Custom HTML | Custom Event: `ViewContent` | Fires `fbq('track', 'ViewContent')` with `content_name`, `content_ids`, `content_type: 'product'`, `value`, `currency: 'INR'`. |
| **21** | `Meta Pixel - AddToCart` | Custom HTML | Custom Event: `AddToCart` | Fires `fbq('track', 'AddToCart')` with product details, value, and eventID for deduplication. |
| **6** | `Meta Pixel - InitiateCheckout` | Custom HTML | Custom Event: `InitiateCheckout` | Fires `fbq('track', 'InitiateCheckout')` when the user clicks 'Buy Now' or opens the checkout drawer with cart value. |
| **12** | `Meta Pixel - Contact (WhatsApp)` | Custom HTML | Custom Event: `Contact` | Fires `fbq('track', 'Contact')` when a customer taps the WhatsApp consultation/order button. |
| **9** | `Meta Pixel - Lead (Quiz Completed)` | Custom HTML | Custom Event: `CompleteRegistration` | Fires `fbq('track', 'Lead')` when a user completes the Ayurvedic routine quiz and enters contact details. |

---

## 3. DataLayer Schema & Custom Events

The website pushes events to `window.dataLayer` following this exact structure:

### A. Product Page View (`ViewContent`)
```javascript
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'ViewContent',
  event_id: 'vc_' + Date.now(),
  event_data: {
    id: 'gid://shopify/Product/10473731162244',
    title: 'Sujata Spirulina + Sea Buckthorn Healthy Life Combo Pack',
    price: 1100.0,
    currency: 'INR'
  }
});
```

### B. Add To Cart (`AddToCart`)
```javascript
window.dataLayer.push({
  event: 'AddToCart',
  event_id: 'atc_' + Date.now(),
  event_data: {
    id: 'gid://shopify/ProductVariant/52759081779332',
    title: 'Sujata Spirulina + Sea Buckthorn Healthy Life Combo Pack',
    price: 1100.0,
    quantity: 1,
    currency: 'INR'
  }
});
```

### C. Initiate Checkout (`InitiateCheckout`)
```javascript
window.dataLayer.push({
  event: 'InitiateCheckout',
  event_id: 'ic_' + Date.now(),
  event_data: {
    total: 1100.0,
    currency: 'INR',
    items_count: 1
  }
});
```

### D. WhatsApp Contact (`Contact`)
```javascript
window.dataLayer.push({
  event: 'Contact',
  event_data: {
    channel: 'whatsapp_concierge',
    source: 'pdp_quick_order'
  }
});
```

---

## 4. GTM User-Defined Variables

| Variable Name | Type | Resolves To / Key Path |
| :--- | :--- | :--- |
| `Const - Meta Pixel ID` | Constant String | `1314112957191765` |
| `Const - GA4 Measurement ID` | Constant String | `G-5WZ8DNW2PD` |
| `DLV - Event ID` | DataLayer Variable (v2) | `event_id` |
| `DLV - Product ID` | DataLayer Variable (v2) | `event_data.id` |
| `DLV - Product Title` | DataLayer Variable (v2) | `event_data.title` |
| `DLV - Product Price` | DataLayer Variable (v2) | `event_data.price` |
| `DLV - Order Total` | DataLayer Variable (v2) | `event_data.total` |
| `DLV - Contact Channel` | DataLayer Variable (v2) | `event_data.channel` |

---

## 5. Raw Export File

The complete, unabridged official GTM container export file is available at:
`sujata_gtm_container.json` (JSON schema format v2).
