// scripts/check-combo-details.mjs
const token = '7e0a0176aede63ce4c6b199e18684018';
const domain = 'tvczdq-nu.myshopify.com';

const query = `
  query {
    combo1: product(handle: "sujata-spirulina-sea-buckthorn-combo") {
      id
      title
      handle
      description
      images(first: 5) {
        edges {
          node {
            url
            altText
          }
        }
      }
    }
    combo2: product(handle: "sujata-spirulina-sea-buckthorn-combo-pack") {
      id
      title
      handle
      description
      images(first: 5) {
        edges {
          node {
            url
            altText
          }
        }
      }
    }
  }
`;

async function run() {
  const res = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  console.log('Combo 1 (Daily Super Immunity Combo):');
  console.log('Title:', data.data?.combo1?.title);
  console.log('Images:', data.data?.combo1?.images?.edges?.map(e => e.node.url));
  console.log('\nCombo 2 (Healthy Life Combo Pack):');
  console.log('Title:', data.data?.combo2?.title);
  console.log('Description:', data.data?.combo2?.description);
  console.log('Images:', data.data?.combo2?.images?.edges?.map(e => e.node.url));
}

run();
