async function inspectLive() {
  const res = await fetch('https://tvczdq-nu.myshopify.com/products/sujata-spirulina-tablets');
  const html = await res.text();
  console.log('Status:', res.status, 'HTML length:', html.length);
  const scriptMatches = html.match(/<script[^>]*jdgm-script[^>]*>.*?<\/script>/gis) || [];
  console.log('\nScript tags with jdgm-script:', scriptMatches.length);
  scriptMatches.forEach((m, idx) => console.log(`Script #${idx}:\n`, m));

  const linkMatches = html.match(/<link[^>]*jdgm[^>]*>/gis) || [];
  console.log('\nLink tags with jdgm:', linkMatches.length);
  linkMatches.forEach((m, idx) => console.log(`Link #${idx}:\n`, m));

  const allJdgmClasses = html.match(/class=['"][^'"]*jdgm[^'"]*['"]/gi) || [];
  console.log('\nClass instances with jdgm:', allJdgmClasses.length);
  [...new Set(allJdgmClasses)].slice(0, 10).forEach(c => console.log(`- ${c}`));
}

inspectLive().catch(console.error);
