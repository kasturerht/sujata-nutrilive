# 🏷️ Sujata Nutrilive — Google Tag Manager (GTM) Architecture & Audit Specification
> **Enterprise Edition (v2.0 — Post-Audit Clean Architecture)**  
> **Container Public ID:** `GTM-5BCC6JL8` | **Status:** ✅ Validated Single Source of Truth  
> **Target Website:** `https://www.sujatanutrilive.com`

---

## 1. Container Overview

| Property | Value |
| :--- | :--- |
| **GTM Container Public ID** | `GTM-5BCC6JL8` |
| **GTM Account ID** | `6381104411` |
| **GTM Container ID** | `266369056` |
| **Meta Pixel ID** | `1314112957191765` |
| **GA4 Measurement ID** | `G-5WZ8DNW2PD` |
| **Google Ads Conversion Linker** | Enabled (Tag ID: 1) |
| **Google Consent Mode v2** | Enforced in `<head>` before container load |

---

## 2. Complete Enterprise Tag Matrix (13 Tags)

| Tag ID | Tag Name | Type | Firing Trigger | Output / Payload |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `Google Ads - Conversion Linker` | Native `gclidw` | All Pages | Captures GCLID / UTMs for Google Ads attribution. |
| **2** | `Meta Pixel - Base Code & PageView` | Custom HTML | All Pages | Initializes Meta Pixel `1314112957191765` and fires `fbq('track', 'PageView')`. |
| **3** | `Meta Pixel - ViewContent` | Custom HTML | Event - ViewContent | Fires `fbq('track', 'ViewContent')` with `content_name`, `content_ids`, `value`, `currency`, `eventID`. |
| **4** | `Meta Pixel - AddToCart` | Custom HTML | Event - AddToCart | Fires `fbq('track', 'AddToCart')` with product details, value, currency, `eventID`. |
| **5** | `Meta Pixel - InitiateCheckout` | Custom HTML | Event - InitiateCheckout | Fires `fbq('track', 'InitiateCheckout')` with cart total, currency, `eventID`. |
| **6** | `Meta Pixel - Purchase` | Custom HTML | Event - Purchase | **Enterprise Core:** Fires `fbq('track', 'Purchase')` with order total, currency, and `eventID` matching server CAPI. |
| **7** | `Meta Pixel - Lead` | Custom HTML | Event - Lead (Quiz) | Fires `fbq('track', 'Lead')` with routine quiz details. |
| **8** | `Meta Pixel - Contact` | Custom HTML | Event - Contact | Fires `fbq('track', 'Contact')` on WhatsApp concierge click. |
| **9** | `Google Tag (GA4 Base)` | Native `googtag` | All Pages | Sends base config & pageviews to `G-5WZ8DNW2PD`. |
| **10** | `GA4 - view_item` | Native `gaawe` | GA4 Event - view_item | Passes `ecommerce` object automatically (`sendEcommerceData = true`). |
| **11** | `GA4 - add_to_cart` | Native `gaawe` | GA4 Event - add_to_cart | Passes `ecommerce` object automatically (`sendEcommerceData = true`). |
| **12** | `GA4 - begin_checkout` | Native `gaawe` | GA4 Event - begin_checkout | Passes `ecommerce` object automatically (`sendEcommerceData = true`). |
| **13** | `GA4 - purchase` | Native `gaawe` | GA4 Event - purchase | Passes `ecommerce` purchase object automatically (`sendEcommerceData = true`). |

---

## 3. Trigger Matrix (11 Triggers)

| Trigger ID | Trigger Name | Filter Condition | Purpose |
| :--- | :--- | :--- | :--- |
| **2147479553** | `All Pages` | Pageview | Base initialization |
| **101** | `Custom Event - ViewContent` | `_event` regex `^(ViewContent\|view_item)$` | Meta ViewContent |
| **102** | `Custom Event - AddToCart` | `_event` regex `^(AddToCart\|add_to_cart)$` | Meta AddToCart |
| **103** | `Custom Event - InitiateCheckout` | `_event` regex `^(InitiateCheckout\|begin_checkout)$` | Meta InitiateCheckout |
| **104** | `Custom Event - CompleteRegistration (Quiz)` | `_event` regex `^(CompleteRegistration\|generate_lead\|sign_up)$` | Meta Lead |
| **105** | `Custom Event - Contact` | `_event` regex `^(Contact\|contact)$` | Meta WhatsApp Contact |
| **106** | `Custom Event - Purchase` | `_event` regex `^(Purchase\|purchase)$` | **Meta Purchase Conversion** |
| **107** | `GA4 Event - view_item` | `_event` equals `view_item` | GA4 Native E-commerce |
| **108** | `GA4 Event - add_to_cart` | `_event` equals `add_to_cart` | GA4 Native E-commerce |
| **109** | `GA4 Event - begin_checkout` | `_event` equals `begin_checkout` | GA4 Native E-commerce |
| **110** | `GA4 Event - purchase` | `_event` equals `purchase` | GA4 Native E-commerce |

---

## 4. User-Defined Variables (13 Variables)

| Variable Name | Type | Key Path |
| :--- | :--- | :--- |
| `Const - Meta Pixel ID` | Constant | `1314112957191765` |
| `Const - GA4 Measurement ID` | Constant | `G-5WZ8DNW2PD` |
| `DLV - Event ID` | DataLayer v2 | `event_id` |
| `DLV - Product ID` | DataLayer v2 | `event_data.id` |
| `DLV - Product Title` | DataLayer v2 | `event_data.title` |
| `DLV - Product Price` | DataLayer v2 | `event_data.price` |
| `DLV - Order Total` | DataLayer v2 | `event_data.total` |
| `DLV - Contact Channel` | DataLayer v2 | `event_data.channel` |
| `DLV - Ecommerce Value` | DataLayer v2 | `ecommerce.value` |
| `DLV - Currency` | DataLayer v2 | `ecommerce.currency` |
| `DLV - Transaction ID` | DataLayer v2 | `ecommerce.transaction_id` |
| `DLV - User FBP` | DataLayer v2 | `user_data.fbp` |
| `DLV - User FBC` | DataLayer v2 | `user_data.fbc` |

---

## 5. How to Import into Google Tag Manager (1-Click)

1. Open **[tagmanager.google.com](https://tagmanager.google.com)**.
2. Select Account **Sujata Nutrilive** (`6381104411`) ➡️ Container **`GTM-5BCC6JL8`**.
3. Go to **Admin (प्रशासक)** ➡️ **Import Container (कंटेनर आयात करा)**.
4. Choose file: [`sujata_gtm_container.json`](file:///f:/RK/Sujata%20Nutrilive/sujata-nutrilive/sujata_gtm_container.json).
5. Choose workspace: **Default** or **Existing Workspace**.
6. Select **Overwrite** or **Merge** (Overwrite ensures old amateur tags are completely replaced with zero leftovers).
7. Click **Confirm** and **Publish (सबमिट करा)**.
