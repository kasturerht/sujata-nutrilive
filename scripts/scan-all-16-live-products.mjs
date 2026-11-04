const products = [
  { handle: 'sujata-spirulina-tablets', id: '10465847246980', name: 'Spirulina Tablets' },
  { handle: 'sujata-spirulina-powder', id: '10465847214212', name: 'Spirulina Powder' },
  { handle: 'sujata-spirulina-capsules', id: '10465847279748', name: 'Spirulina Capsules' },
  { handle: 'sujata-sea-buckthorn-capsules', id: '10465847312516', name: 'Sea Buckthorn Capsules' },
  { handle: 'sujata-plant-based-vitamin-b12', id: '10465847345284', name: 'Plant-Based B12' },
  { handle: 'sujata-pure-himalayan-shilajit', id: '10465847378052', name: 'Himalayan Shilajit' },
  { handle: 'sujata-moringa-powder', id: '10465847410820', name: 'Moringa Powder' },
  { handle: 'sujata-spirulina-facewash', id: '10465847443588', name: 'Anti-Acne Face Wash' },
  { handle: 'sujata-spirulina-facepack-powder', id: '10465847476356', name: 'Face Pack Powder' },
  { handle: 'sujata-spiruglow-bath-soap', id: '10465847541892', name: 'SpiruGlow Bath Soap' },
  { handle: 'sujata-spirulina-korean-cream', id: '10465847574660', name: 'Korean Cream' },
  { handle: 'sujata-bridal-whitening-cream', id: '10465847607428', name: 'Bridal Whitening Cream' },
  { handle: 'sujata-spirulina-coconut-hair-oil', id: '10465847640196', name: 'Herbal Hair Oil' },
  { handle: 'sujata-spirushine-shampoo-conditioner', id: '10465847672964', name: '2-in-1 Shampoo' },
  { handle: 'sujata-spirulina-sea-buckthorn-combo', id: '10465847705732', name: 'Immunity Combo' },
  { handle: 'sujata-spirulina-sea-buckthorn-combo-pack', id: '10473731162244', name: 'Combo Pack' }
];

async function scanAll16() {
  console.log(`Starting forensic audit of ALL ${products.length} live product pages...\n`);
  
  let allPass = true;
  const results = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const url = `https://www.sujatanutrilive.com/product/${p.handle}?_audit=${Date.now()}`;
    
    try {
      let res, html, lastErr;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          res = await fetch(url, { headers: { 'Cache-Control': 'no-cache, no-store' } });
          if (res.ok) {
            html = await res.text();
            break;
          }
        } catch (err) {
          lastErr = err;
          await new Promise(r => setTimeout(r, 1000));
        }
      }
      if (!html) throw lastErr || new Error(`Failed with status ${res?.status}`);
      
      const isStatusOk = res.status === 200;
      const hasReviewsSection = html.includes('id="reviews-section"');
      const hasReviewWidget = html.includes('jdgm-review-widget');
      const hasPreviewBadge = html.includes('jdgm-preview-badge');
      const hasCorrectProductId = html.includes(`data-id="${p.id}"`);
      
      // Isolation Check
      const hasTabletsReview = html.includes('Best Odorless Pure Spirulina');
      const isolationOk = p.handle === 'sujata-spirulina-tablets' ? hasTabletsReview : !hasTabletsReview;
      
      // Badge Check
      const badgeText = html.includes('1 review') ? '1 review' : (html.includes('Be the first to review') ? 'Be the first to review' : 'unknown');
      const badgeOk = p.handle === 'sujata-spirulina-tablets' ? badgeText === '1 review' : badgeText === 'Be the first to review';
      
      const pass = isStatusOk && hasReviewsSection && hasReviewWidget && hasPreviewBadge && hasCorrectProductId && isolationOk && badgeOk;
      if (!pass) allPass = false;
      
      results.push({
        num: i + 1,
        name: p.name,
        handle: p.handle,
        status: res.status,
        hasWidget: hasReviewWidget,
        hasBadge: hasPreviewBadge,
        productIdBound: hasCorrectProductId,
        badgeText: badgeText,
        isolationOk: isolationOk,
        pass: pass
      });
      
      console.log(`[${i+1}/${products.length}] ${p.name}: Status ${res.status} | Product ID ${p.id} | Badge: "${badgeText}" | Isolation: ${isolationOk ? 'OK' : 'FAIL'} | OVERALL: ${pass ? 'PASS' : 'FAIL'}`);
    } catch (e) {
      allPass = false;
      console.log(`[${i+1}/${products.length}] ${p.name}: ERROR - ${e.message}`);
    }
  }

  console.log(`\n======================================================`);
  console.log(`FINAL RESULT: ${allPass ? '100% OF ALL 16 PRODUCTS ARE PASSING PERFECTLY!' : 'SOME PRODUCTS FAILED'}`);
  console.log(`======================================================`);
}

scanAll16().catch(console.error);
