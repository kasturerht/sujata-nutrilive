import fs from 'fs';

async function testAllProductsSSR() {
  console.log("=== VERIFYING SILICON VALLEY REVIEW ISOLATION ACROSS ALL PRODUCTS ===");
  
  const products = [
    { handle: 'sujata-spirulina-tablets', id: '10465847246980', shouldHaveReviews: true },
    { handle: 'sujata-spirulina-powder', id: '10465847214212', shouldHaveReviews: false },
    { handle: 'sujata-spirulina-capsules', id: '10465847279748', shouldHaveReviews: false },
    { handle: 'sujata-sea-buckthorn-capsules', id: '10465847312516', shouldHaveReviews: false },
    { handle: 'sujata-plant-based-vitamin-b12', id: '10465847345284', shouldHaveReviews: false },
    { handle: 'sujata-pure-himalayan-shilajit', id: '10465847378052', shouldHaveReviews: false },
    { handle: 'sujata-moringa-powder', id: '10465847410820', shouldHaveReviews: false },
    { handle: 'sujata-spirulina-facewash', id: '10465847443588', shouldHaveReviews: false }
  ];

  const app = await import('../.vercel/output/_functions/entry.mjs');

  for (const p of products) {
    const req = new Request(`https://www.sujatanutrilive.com/product/${p.handle}`);
    const res = await app.default.fetch(req);
    const html = await res.text();
    
    console.log(`\nProduct: ${p.handle} (ID: ${p.id})`);
    console.log(`- Status: ${res.status}`);
    
    // Check data-id matches product
    const hasCorrectId = html.includes(`data-id="${p.id}"`);
    console.log(`- Review Widget correctly bound to Product ID ${p.id}: ${hasCorrectId}`);
    
    // Check review isolation: The tablets review should ONLY appear on tablets!
    const hasTabletsReview = html.includes('Best Odorless Pure Spirulina');
    if (p.shouldHaveReviews) {
      console.log(`- Expected Reviews: YES. Has Tablets Review: ${hasTabletsReview} [${hasTabletsReview ? 'PASS' : 'FAIL'}]`);
      console.log(`- Buy Box Badge: ${html.includes('1 review') ? '1 review (PASS)' : 'FAIL'}`);
    } else {
      console.log(`- Expected Reviews: NO (0 reviews). Has Tablets Review: ${hasTabletsReview} [${!hasTabletsReview ? 'PASS - ZERO LEAKAGE' : 'FAIL - LEAKED'}]`);
      console.log(`- Buy Box Badge: ${html.includes('Be the first to review') ? 'Be the first to review (PASS)' : 'FAIL'}`);
    }
  }
}

testAllProductsSSR().catch(console.error);
