import fs from 'fs';

const filePath = 'src/pages/product/[handle].astro';
let content = fs.readFileSync(filePath, 'utf8');

const target = `          renderProductPricing();
        });
      });

      // Payment Option Switcher Interactions`;

const replacement = `          renderProductPricing();
        });
      });

      // 🌟 Auto-select variant from URL query param (e.g. from Diwali banner cards: ?plan=2m or ?variant=...)
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const reqVarId = urlParams.get('variant');
        const reqPlan = urlParams.get('plan');
        if (reqVarId || reqPlan) {
          variantBtns.forEach(btn => {
            const vId = btn.getAttribute('data-variant-id') || '';
            const vTitle = (btn.getAttribute('data-title') || '').toLowerCase();
            const matchById = reqVarId && vId.includes(reqVarId);
            const matchByPlan = reqPlan && (
              (reqPlan === '1m' && (vTitle.includes('1-month') || vTitle.includes('1 month'))) ||
              (reqPlan === '2m' && (vTitle.includes('2-month') || vTitle.includes('2 month'))) ||
              (reqPlan === '3m' && (vTitle.includes('3-month') || vTitle.includes('3 month')))
            );
            if (matchById || matchByPlan) {
              btn.click();
            }
          });
        }
      } catch(e) {}

      // Payment Option Switcher Interactions`;

const normContent = content.replace(/\r\n/g, '\n');
const normTarget = target.replace(/\r\n/g, '\n');

if (normContent.includes(normTarget)) {
  const newContent = normContent.replace(normTarget, replacement);
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('✅ Successfully patched [handle].astro with URL variant auto-selection!');
} else {
  console.error('❌ Target string not found in [handle].astro');
}
