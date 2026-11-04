async function testRender() {
  try {
    const app = await import('../.vercel/output/_functions/entry.mjs');
    console.log("App exports:", Object.keys(app));
    console.log("App default type:", typeof app.default);
    console.log("App default keys:", Object.keys(app.default));
    const request = new Request('https://www.sujatanutrilive.com/product/sujata-spirulina-tablets');
    const response = await app.default.fetch(request);
    console.log("Response status:", response.status);
    if (response.status !== 200) {
      console.log("Response text:", await response.text());
    } else {
      console.log("Success! Rendered length:", (await response.text()).length);
    }
  } catch (e) {
    console.error("Render crashed with error:", e);
  }
}

testRender();
