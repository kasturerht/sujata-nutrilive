import fs from 'fs';

const filePath = 'src/components/CartDrawer.astro';
let content = fs.readFileSync(filePath, 'utf8');

const target = `            clearTimeout(recoveryTimer);\r\n            window.location.href = checkoutUrl;`;

const replacement = `            // 🚀 1-Click Razorpay Magic Checkout (Kapiva-style Instant Mobile OTP & Auto-Address)
            try {
              if (typeof window.Razorpay === 'function') {
                const discountCodeToSend = (selectedMode === 'upi' ? (savedDiscount || 'UPI10') : savedDiscount) || undefined;
                const magicPayload = {
                  items: items,
                  coupon_code: discountCodeToSend
                };

                const magicRes = await fetch('/api/magic-checkout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(magicPayload)
                });

                if (magicRes.ok) {
                  const magicData = await magicRes.json();
                  if (magicData.success && magicData.order_id) {
                    clearTimeout(recoveryTimer);
                    const rzp = new window.Razorpay({
                      key: magicData.key_id || "rzp_live_TV8wwiNECUNJs0",
                      order_id: magicData.order_id,
                      one_click_checkout: true,
                      name: "Sujata Nutrilive",
                      description: "Pure Health & Wellness",
                      prefill: {
                        contact: localStorage.getItem('sujata_user_phone') || undefined,
                        coupon_code: discountCodeToSend
                      },
                      handler: function(response) {
                        try { localStorage.removeItem('sujata_cart'); } catch(e) {}
                        window.location.href = '/thank-you?order_id=' + (response.razorpay_order_id || '') + '&payment_id=' + (response.razorpay_payment_id || '');
                      },
                      modal: {
                        ondismiss: function() {
                          resetCheckoutBtn();
                        }
                      }
                    });
                    rzp.open();
                    return;
                  }
                }
              }
            } catch(magicErr) {
              console.warn("⚠️ Razorpay Magic Checkout inline open fallback triggered:", magicErr);
            }

            clearTimeout(recoveryTimer);
            window.location.href = checkoutUrl;`;

if (!content.includes(target)) {
  console.error("Target not found!");
  process.exit(1);
}

content = content.replace(target, replacement);
fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully patched CartDrawer.astro!");