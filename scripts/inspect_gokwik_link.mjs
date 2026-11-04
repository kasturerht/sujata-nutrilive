// scripts/inspect_gokwik_link.mjs
const testUrl = "https://tvczdq-nu.myshopify.com?gkref=oICf237JYn5ZMP9yPUcMeiFpfFcr%2FecmaYcxJkX9fxQH6qAMCg8G2YtgtDilyjxZxbFGc6joRLeAca4LxomwSR7rKJyxXOhvulOjgjjSRHbCTNcxxNILhfB8vNLGIsz3ohopoGWVY2EVuZODGuPCGFPCBUQHY61x6QuEk%2F8%3D";

async function inspect() {
  console.log("Fetching GoKwik generated URL...");
  const res = await fetch(testUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    redirect: 'manual'
  });

  console.log("HTTP Status:", res.status);
  console.log("Headers:", Object.fromEntries(res.headers.entries()));

  if (res.status >= 300 && res.status < 400) {
    console.log("Redirect Location:", res.headers.get('location'));
  } else {
    const text = await res.text();
    console.log("Response text length:", text.length);
    console.log("Snippet (first 500 chars):", text.slice(0, 500));
    
    // Look for gokwik mentions or scripts
    const lines = text.split('\n');
    const gkLines = lines.filter(l => l.toLowerCase().includes('gokwik') || l.toLowerCase().includes('gkref') || l.toLowerCase().includes('kwik'));
    console.log("Lines matching gokwik/gkref:", gkLines.slice(0, 10));
  }
}

inspect();
