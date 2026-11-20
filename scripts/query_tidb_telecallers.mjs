import { connect } from '@tidbcloud/serverless';
import dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'mysql://3FeKz4HehHXuLCf.root:SujataNutriLive2026!Db@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/sujata_nutrilive';
const conn = connect({ url: dbUrl });

async function checkCallerNames() {
  const callers = await conn.execute(`
    SELECT caller_name, COUNT(*) as orders_count, SUM(amount) as revenue
    FROM orders 
    WHERE order_date >= '2026-10-01'
    GROUP BY caller_name 
    ORDER BY orders_count DESC;
  `);
  console.table(callers);

  const total = await conn.execute(`
    SELECT COUNT(*) as total_orders, SUM(amount) as total_rev
    FROM orders 
    WHERE order_date >= '2026-10-01';
  `);
  console.log('Total since Oct 1:', total[0]);
}

checkCallerNames().catch(console.error);
