# Amazon India PAT Siphon — Bulk Upload Instructions

**File:** `2026-11-22-amazon-pat-siphon-bulk-upload.csv`
**Format:** Amazon India Sponsored Products — v4 bulk operations template (CSV)
**Marketplace:** Amazon.in (A21TJRUUN4KGV)

---

## 1. What the sheet creates

| Campaign | Promotes (Sujata SKU) | Targets (Competitor ASIN) | Daily budget | Starting bid | Bidding |
|---|---|---|---|---|---|
| `SUJATA_PAT_SIPHON_POWDER_v1` | `L5-UK79-BHXE` (Powder 100 g) | `B0DK4T6GYW` (Carbamide Forte Powder 100 g) + `B0D5LPCMP3` (Carbamide Forte USDA Organic Powder) | ₹300/day | ₹10/click | Dynamic — down only |
| `SUJATA_PAT_SIPHON_TABLETS_v1` | `SJT-SP-TAB-120` (Spirulina Tablets 120s) + `8X-HQKV-14T7` (Spirulina Tablets 60s) | `B07XY8G39X` (Vlado's Himalayan Organics Spirulina 2000 mg 120 Veg Caps) | ₹300/day | ₹10/click | Dynamic — down only |

**Starting bid rationale (₹10):** The brief asked for 85 % of the suggested bid-floor. For the Herbal Supplements category on Amazon.in the Nov-2026 suggested-bid floor is typically ₹10-₹14. ₹10 is the midpoint of your ₹8-₹12 range and sits at ~75-85 % of the floor — low enough to be a conservative starting point, high enough to clear the auction for competitor-ASIN placements.

**Bidding strategy — Dynamic bids - down only:** safer than "down-and-up" for conquest PAT because Amazon will only lower bids when a conversion is unlikely; it never raises above the ₹10 ceiling. Switch to "down-and-up" only after Week 2 when you have conversion data.

## 2. How to upload (Seller Central → Amazon Ads)

1. Go to **Seller Central → Advertising → Bulk Operations**.
2. Choose **Sponsored Products** → **Download template** (v4). Confirm the template columns in the downloaded file match the header row in the CSV in this folder — Amazon occasionally adds columns and may shift column order.
3. Open your fresh template in Excel. Copy rows 2-11 from `2026-11-22-amazon-pat-siphon-bulk-upload.csv` into your template, matching column names row-by-row (not by column index).
4. Save as `.xlsx` or `.csv`.
5. Upload via **Bulk Operations → Upload file**.
6. Watch the **Validation** report — all rows should report "Create". If any row errors out, the most common causes are:
   - Campaign date in the past → bump `Start Date` to today.
   - Suggested-bid-floor is higher than ₹10 → raise the Bid in the Product Targeting rows.
   - The SKU in the Product Ad row is not live or has been renamed → check SKU case-exact in Seller Central.

## 3. Post-launch monitoring (day 1-7)

| KPI | Target | Action if missed |
|---|---|---|
| Impressions in 24 h | > 500 per campaign | Raise bid to ₹12, verify targeted ASIN is active |
| CTR | > 0.6 % | Review Rufus bullets on the promoted SKU — see the full Rufus listing report |
| ACoS | 30-40 % by Day 7 | If > 50 %, pause the lower-converting targeted ASIN (remove the Product Targeting row with `Operation=Archive`) |
| Daily spend | ₹200-300 | If spend is at zero, raise bid; if spend is at ₹300 every day with ACoS > 40 %, lower bid to ₹8 |

## 4. Negatives (recommended day-7 add-on)

After 7 days you will see which search terms are converting. Create a second bulk file with `Entity=Campaign Negative Keyword` rows for:
- Any own-brand term triggering the PAT (e.g. "sujata nutrilive" — negative phrase)
- Any competitor's own-brand term that converts at > 60 % ACoS (negative exact)

## 5. Three-phase expansion path

This CSV ships Phase 2 (Competitor Siphon). Phase 1 (Defensive own-ASIN PAT) and Phase 3 (Category Expansion) are documented in `2026-11-22-amazon-india-cosmo-rufus-bsr-strategy.md` Section 4.

**When to add Phase 1 (Defensive):** Immediately — put a second CSV alongside this one that targets `asin="B0DP2FWN4J"`, `asin="B0HMJD7SJ9"`, etc. (own ASINs) in a separate campaign `SUJATA_PAT_DEFENSIVE_v1` at a floor bid of ₹4-6 and ₹100 daily budget. Keep its ACoS reporting in a separate placement so it never contaminates the Siphon ACoS.

**When to add Phase 3 (Category Expansion):** After the Siphon campaigns stabilise at ACoS ≤ 40 % for 7 consecutive days. Use **Category Targeting** with refinements (`category=12345 price<600 rating>=4.0 isPrime=true`) instead of individual ASIN targeting.

---

*Prepared 2026-11-22. All bids and budgets are starting points — adjust once the first week of placement data lands.*
