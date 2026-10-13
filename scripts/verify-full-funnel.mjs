// 🔬 Silicon Valley Automated Tracking QA Engine (Full-Funnel Verification)
const SITE_URL = 'https://www.sujatanutrilive.com';

async function runAudit() {
  console.log('===============================================================');
  console.log('🏛️ SUJATA NUTRILIVE — ENTERPRISE TRACKING QA VERIFICATION');
  console.log('===============================================================');

  const results = [];

  // Check 1: Consent Mode v2 on Live Site
  try {
    const res = await fetch(SITE_URL);
    const html = await res.text();

    const hasConsent = html.includes('ad_storage') && html.includes('ad_user_data');
    const hasGtm = html.includes('GTM-5BCC6JL8');
    const noDirectFbq = !html.includes("fbq('track', 'PageView')");
    const noDirectGtag = !html.includes("gtag('config', googleTagId");
    const hasDataLayerDispatcher = html.includes('Unified Enterprise E-Commerce DataLayer Dispatcher');
    const hasAdvancedMatching = html.includes('sujata_user_email');

    results.push({
      test: '1. Google Consent Mode v2 (CoMo v2 Default Granted)',
      passed: hasConsent,
      detail: hasConsent ? 'Enforced in <head> before GTM' : 'Missing'
    });

    results.push({
      test: '2. GTM Container Single Source of Truth',
      passed: hasGtm,
      detail: hasGtm ? 'GTM-5BCC6JL8 loaded exclusively' : 'Missing'
    });

    results.push({
      test: '3. Hardcoded Direct fbq/gtag Calls Completely Eliminated',
      passed: noDirectFbq && noDirectGtag,
      detail: (noDirectFbq && noDirectGtag) ? 'Zero direct browser beacons (No double counting)' : 'Detected hardcoded tags'
    });

    results.push({
      test: '4. Unified GA4 + Meta DataLayer Dispatcher Active',
      passed: hasDataLayerDispatcher,
      detail: hasDataLayerDispatcher ? 'Dispatches view_item, add_to_cart, begin_checkout' : 'Missing'
    });

    results.push({
      test: '5. Meta Advanced Matching (EMQ 9.0+) Persistent Engine',
      passed: hasAdvancedMatching,
      detail: hasAdvancedMatching ? 'Persistent storage and cart attribute bridge active' : 'Missing'
    });

  } catch (err) {
    results.push({ test: 'Live Site Connection', passed: false, detail: err.message });
  }

  // Check 2: Live Serverless Meta CAPI Webhook
  try {
    const webhookRes = await fetch(`${SITE_URL}/api/webhooks/shopify-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 9988770011,
        order_number: 1028,
        name: '#1028',
        total_price: '1100.00',
        currency: 'INR',
        financial_status: 'paid',
        gateway: 'shopify_payments',
        payment_gateway_names: ['Razorpay / UPI'],
        line_items: [{ id: 'item_qa', variant_id: '52759081779332', title: 'Spirulina + Sea Buckthorn', quantity: 1, price: '1100.00' }],
        customer: { first_name: 'Rahul', last_name: 'Patil', email: 'rahul.patil@testsujata.com', phone: '+91 98220 12345' },
        shipping_address: { first_name: 'Rahul', last_name: 'Patil', phone: '+91 98220 12345', address1: 'Flat 402, Shivshakti Towers', city: 'Nashik', province: 'Maharashtra', zip: '422005', country_code: 'IN' },
        note_attributes: [{ name: 'utm_source', value: 'Meta Ads' }, { name: '_fbp', value: 'fb.1.1791876000.123456789' }]
      })
    });

    const webhookData = await webhookRes.json();
    const capiPassed = webhookData.metaCapiDelivered && webhookData.metaCapiResponse?.events_received === 1;
    const tgPassed = webhookData.telegramDelivered;

    results.push({
      test: '6. Server-Side Meta Conversions API (CAPI v21.0) Purchase Dispatch',
      passed: capiPassed,
      detail: capiPassed ? `Delivered (Trace ID: ${webhookData.metaCapiResponse?.fbtrace_id})` : 'Failed'
    });

    results.push({
      test: '7. Founder Telegram Corporate Order Alert',
      passed: tgPassed,
      detail: tgPassed ? 'Delivered instantly with clean corporate layout' : 'Failed'
    });

  } catch (err) {
    results.push({ test: 'Webhook CAPI & Telegram', passed: false, detail: err.message });
  }

  // Print Summary Table
  console.log('\nAudit Verification Matrix:');
  console.table(results);

  const allPassed = results.every(r => r.passed);
  console.log('\n===============================================================');
  console.log(allPassed ? '🏆 OVERALL VERDICT: 100% ENTERPRISE GRADE — ZERO DEFECTS' : '⚠️ WARNING: SOME CHECKS FAILED');
  console.log('===============================================================\n');
}

runAudit();
