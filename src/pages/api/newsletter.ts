import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const email = data.email?.trim();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid email address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const shopifyDomain = import.meta.env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || "tvczdq-nu.myshopify.com";
    const storefrontToken = import.meta.env.PUBLIC_SHOPIFY_STOREFRONT_TOKEN || "7e0a0176aede63ce4c6b199e18684018";

    // Attempt to register customer in Shopify with marketing consent
    if (shopifyDomain && storefrontToken) {
      const query = `
        mutation customerCreate($input: CustomerCreateInput!) {
          customerCreate(input: $input) {
            customer {
              id
              email
            }
            customerUserErrors {
              code
              field
              message
            }
          }
        }
      `;

      try {
        const response = await fetch(`https://${shopifyDomain}/api/2024-01/graphql.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': storefrontToken
          },
          body: JSON.stringify({
            query,
            variables: {
              input: {
                email,
                acceptsMarketing: true
              }
            }
          })
        });
        const resJson = await response.json();
        console.log("Shopify newsletter registration:", resJson.data?.customerCreate);
      } catch (shopErr) {
        console.warn("Shopify customer subscription log:", shopErr);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Welcome to the Sujata Inner Circle! Use coupon SUJATA10 at checkout for 10% off.' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
