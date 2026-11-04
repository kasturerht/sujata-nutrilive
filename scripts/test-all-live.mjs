async function testAll() {
  const handles = [
    'sujata-spirulina-capsules',
    'sujata-spirulina-powder',
    'sujata-spirulina-tablets',
    'sujata-sea-buckthorn-capsules'
  ];
  for (const h of handles) {
    const res = await fetch(`https://www.sujatanutrilive.com/product/${h}?v=${Date.now()}`);
    console.log(`${h}: Status ${res.status}`);
  }
}
testAll();
