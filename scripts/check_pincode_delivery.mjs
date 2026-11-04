import fs from 'fs';

async function checkPincode() {
  // Let's test with a Nashik/Mumbai pincode cookie (csm-hit, session-id, etc.) or check how Amazon renders it
  const asin = 'B0HMJDWMSB'; // Vitamin B12
  const res = await fetch(`https://www.amazon.in/gp/product/ajax/?asin=${asin}&m=&qid=&smid=&sourcecustomerorglistid=&sourcecustomerorglistitemid=&sr=&pc=dp&experienceId=`, {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'text/html,*/*'
    }
  });
  console.log('Ajax response status:', res.status);
  
  // Let's check the all-offers display endpoint:
  const oRes = await fetch(`https://www.amazon.in/gp/product/ajax/ref=dp_aod_unknown_mbc?asin=${asin}&m=&qid=&smid=&sourcecustomerorglistid=&sourcecustomerorglistitemid=&sr=&pc=dp&experienceId=aodAjaxMain`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
  });
  console.log('AOD response status:', oRes.status);
  const oHtml = await oRes.text();
  console.log('AOD HTML snippet:', oHtml.slice(0, 500));
}

checkPincode();
