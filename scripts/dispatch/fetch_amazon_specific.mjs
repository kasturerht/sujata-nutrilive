import { getRecentOrders } from '../amazon-ops.mjs';
async function run() {
  const orders = await getRecentOrders(3);
  for (const o of orders) {
    if (['404-3199519-5071536', '404-7524790-2104302'].includes(o.AmazonOrderId)) {
      console.log(JSON.stringify(o, null, 2));
    }
  }
}
run();
