// scripts/update-cap180-stock.mjs
// Update 180 Capsules inventory to 200 units in Shopify Admin API

const domain = 'tvczdq-nu.myshopify.com';
const token = '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';

const mutation = `
  mutation inventorySetOnHandQuantities($input: InventorySetOnHandQuantitiesInput!) {
    inventorySetOnHandQuantities(input: $input) {
      userErrors {
        field
        message
      }
      inventoryAdjustmentGroup {
        createdAt
        reason
        changes {
          name
          delta
          quantityAfterChange
        }
      }
    }
  }
`;

async function updateInventory() {
  console.log('🔄 Setting inventory to 200 units for 180 Capsules in Shopify...');

  const variables = {
    input: {
      reason: "correction",
      setQuantities: [
        {
          inventoryItemId: "gid://shopify/InventoryItem/69588062371972",
          locationId: "gid://shopify/Location/119643373700",
          quantity: 200
        }
      ]
    }
  };

  const res = await fetch(`https://${domain}/admin/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify({ query: mutation, variables })
  });

  const data = await res.json();
  console.log('Result:', JSON.stringify(data, null, 2));

  if (data.data?.inventorySetOnHandQuantities?.userErrors?.length === 0) {
    console.log('🎉 SUCCESS: Inventory successfully updated to 200 units in Shopify!');
  } else {
    console.error('❌ Errors:', data.data?.inventorySetOnHandQuantities?.userErrors);
  }
}

updateInventory();
