// scripts/check-shopify-collection.mjs
const query = `{
  collection(handle: "frontpage") {
    id
    title
    products(first: 50) {
      edges {
        node {
          handle
          title
        }
      }
    }
  }
  products(first: 50) {
    edges {
      node {
        handle
        title
      }
    }
  }
}`;

async function run() {
  const r = await fetch('https://tvczdq-nu.myshopify.com/api/2024-01/graphql.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': '7e0a0176aede63ce4c6b199e18684018'
    },
    body: JSON.stringify({ query })
  });
  const data = await r.json();
  const frontpage = data.data?.collection?.products?.edges.map(e => e.node.handle) || [];
  const allProds = data.data?.products?.edges.map(e => e.node.handle) || [];
  console.log('Frontpage Collection Products Count:', frontpage.length);
  console.log('Frontpage Products:', frontpage);
  console.log('---');
  console.log('All Products Count:', allProds.length);
  console.log('All Products:', allProds);
}

run().catch(console.error);
