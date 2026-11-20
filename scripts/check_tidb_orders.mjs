import { connect } from '@tidbcloud/serverless';
import dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'mysql://3FeKz4HehHXuLCf.root:SujataNutriLive2026!Db@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/sujata_nutrilive';
const conn = connect({ url: dbUrl });

async function checkTiDB() {
  try {
    const tables = await conn.execute('SHOW TABLES;');
    console.log('TiDB Tables:', tables);

    const totalOrders = await conn.execute('SELECT COUNT(*) as cnt, MIN(order_date) as min_date, MAX(order_date) as max_date FROM orders;');
    console.log('Orders table stats:', totalOrders[0]);

    const recentDays = await conn.execute('SELECT order_date, COUNT(*) as cnt, SUM(amount) as revenue FROM orders GROUP BY order_date ORDER BY order_date DESC LIMIT 15;');
    console.log('\nRecent Days in TiDB:');
    console.table(recentDays);

    const novTotal = await conn.execute('SELECT COUNT(*) as cnt, SUM(amount) as revenue FROM orders WHERE order_date >= "2026-11-01";');
    console.log('\nNovember 2026 in TiDB:', novTotal[0]);
  } catch (err) {
    console.error('Error querying TiDB:', err);
  }
}

checkTiDB();
