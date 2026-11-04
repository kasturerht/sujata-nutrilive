"""
=============================================================================
🌿 SUJATA NUTRILIVE — TIDB SERVERLESS CLOUD DATABASE MIGRATION ENGINE
=============================================================================
Author: Antigravity AI Engineering
Purpose: Initializes 'sujata_nutrilive' database schema on TiDB Cloud Serverless
         and migrates all 334 verified historical orders (Customers, Orders,
         Telecallers, Dispatch Batches).
=============================================================================
"""

import os
import sys
import json
import re
from datetime import datetime
import pymysql

sys.stdout.reconfigure(encoding='utf-8')

# TiDB Credentials
TIDB_HOST = 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com'
TIDB_PORT = 4000
TIDB_USER = '3FeKz4HehHXuLCf.root'
TIDB_PASSWORD = 'SujataNutriLive2026!Db'
DB_NAME = 'sujata_nutrilive'

MASTER_JSON = r'F:\RK\Sujata Nutrilive\Daily orders dispatch\database\master_orders_334.json'

def clean_phone(p):
    if not p:
        return None
    p_str = re.sub(r'[\s\-\(\)\+]', '', str(p).strip())
    if p_str.startswith('91') and len(p_str) == 12:
        p_str = p_str[2:]
    elif len(p_str) > 10:
        p_str = p_str[-10:]
    if len(p_str) == 10 and p_str.isdigit():
        return p_str
    return None

def parse_date(d_str):
    if not d_str:
        return None
    for fmt in ('%d/%m/%Y', '%d-%m-%Y', '%Y-%m-%d', '%d/%m/%y'):
        try:
            return datetime.strptime(d_str.strip(), fmt).date()
        except ValueError:
            pass
    return None

def main():
    print("=" * 75)
    print("🚀 INITIALIZING SUJATA NUTRILIVE ON TIDB SERVERLESS (v8.5.3)")
    print("=" * 75)

    # 1. Connect without DB to create database
    conn_init = pymysql.connect(
        host=TIDB_HOST,
        port=TIDB_PORT,
        user=TIDB_USER,
        password=TIDB_PASSWORD,
        ssl={'ssl': {}},
        autocommit=True
    )
    with conn_init.cursor() as cur:
        cur.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        print(f"✅ Database '{DB_NAME}' created/verified on TiDB Cloud!")
    conn_init.close()

    # 2. Connect to sujata_nutrilive DB
    conn = pymysql.connect(
        host=TIDB_HOST,
        port=TIDB_PORT,
        user=TIDB_USER,
        password=TIDB_PASSWORD,
        database=DB_NAME,
        ssl={'ssl': {}},
        autocommit=True
    )

    with conn.cursor() as cur:
        # Drop old tables if re-running
        print("📑 Creating Tables: telecallers, customers, orders, dispatch_batches...")
        cur.execute("SET FOREIGN_KEY_CHECKS = 0;")
        cur.execute("DROP TABLE IF EXISTS orders;")
        cur.execute("DROP TABLE IF EXISTS customers;")
        cur.execute("DROP TABLE IF EXISTS telecallers;")
        cur.execute("DROP TABLE IF EXISTS dispatch_batches;")
        cur.execute("SET FOREIGN_KEY_CHECKS = 1;")
        
        cur.execute("""
        CREATE TABLE IF NOT EXISTS telecallers (
            caller_id INT AUTO_INCREMENT PRIMARY KEY,
            caller_name VARCHAR(100) UNIQUE NOT NULL,
            phone VARCHAR(20) DEFAULT NULL,
            total_orders INT DEFAULT 0,
            total_revenue DECIMAL(12,2) DEFAULT 0.00,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS customers (
            phone VARCHAR(50) PRIMARY KEY,
            full_name VARCHAR(255) NOT NULL,
            default_address TEXT DEFAULT NULL,
            city VARCHAR(100) DEFAULT NULL,
            state VARCHAR(100) DEFAULT NULL,
            pincode VARCHAR(50) DEFAULT NULL,
            total_orders INT DEFAULT 1,
            total_revenue DECIMAL(12,2) DEFAULT 0.00,
            first_order_date DATE DEFAULT NULL,
            last_order_date DATE DEFAULT NULL,
            customer_segment VARCHAR(50) DEFAULT 'New',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            order_id INT PRIMARY KEY,
            order_date DATE NOT NULL,
            order_time VARCHAR(50) DEFAULT NULL,
            month VARCHAR(50) DEFAULT NULL,
            customer_phone VARCHAR(50) DEFAULT NULL,
            customer_name VARCHAR(255) NOT NULL,
            caller_name VARCHAR(100) NOT NULL,
            pincode VARCHAR(50) DEFAULT NULL,
            full_address TEXT DEFAULT NULL,
            products_ordered TEXT DEFAULT NULL,
            amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            payment_mode VARCHAR(50) DEFAULT 'COD',
            order_type VARCHAR(100) DEFAULT 'Direct Dispatch',
            dispatch_channel VARCHAR(50) DEFAULT 'India Post',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_cust_phone (customer_phone),
            INDEX idx_caller (caller_name),
            INDEX idx_order_date (order_date)
        );
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS dispatch_batches (
            batch_id INT AUTO_INCREMENT PRIMARY KEY,
            manifest_name VARCHAR(100) NOT NULL,
            dispatch_date DATE NOT NULL,
            order_count INT NOT NULL DEFAULT 0,
            total_cod_amount DECIMAL(12,2) DEFAULT 0.00,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        print("✅ All Relational Tables Created Successfully!")

        # 3. Read master_orders_334.json
        with open(MASTER_JSON, 'r', encoding='utf-8') as f:
            orders = json.load(f)

        print(f"📦 Loading {len(orders)} verified historical orders from JSON...")

        # Clear existing rows to prevent duplicates on rerun
        cur.execute("SET FOREIGN_KEY_CHECKS = 0;")
        cur.execute("TRUNCATE TABLE orders;")
        cur.execute("TRUNCATE TABLE customers;")
        cur.execute("TRUNCATE TABLE telecallers;")
        cur.execute("SET FOREIGN_KEY_CHECKS = 1;")

        # Ingest Telecallers
        caller_set = set(o.get('telecaller', 'Unknown').strip() for o in orders if o.get('telecaller'))
        for caller in caller_set:
            cur.execute("INSERT IGNORE INTO telecallers (caller_name) VALUES (%s);", (caller,))

        # Ingest Customers & Orders
        customer_agg = {}
        for o in orders:
            raw_phone = o.get('mobile_number')
            clean_p = clean_phone(raw_phone)
            cust_name = o.get('customer_name', 'Unknown').strip()
            o_date = parse_date(o.get('date'))
            amt = float(o.get('amount') or 0.0)

            # Assign a surrogate phone if N/A to keep customer record
            if not clean_p:
                clean_p = f"SURR_{o['sr_no']:04d}"

            if clean_p not in customer_agg:
                customer_agg[clean_p] = {
                    'name': cust_name,
                    'address': o.get('full_address', ''),
                    'pincode': str(o.get('pincode', ''))[:45],
                    'orders_count': 1,
                    'total_revenue': amt,
                    'first_date': o_date,
                    'last_date': o_date
                }
            else:
                customer_agg[clean_p]['orders_count'] += 1
                customer_agg[clean_p]['total_revenue'] += amt
                if o_date and (not customer_agg[clean_p]['last_date'] or o_date > customer_agg[clean_p]['last_date']):
                    customer_agg[clean_p]['last_date'] = o_date
                if o_date and (not customer_agg[clean_p]['first_date'] or o_date < customer_agg[clean_p]['first_date']):
                    customer_agg[clean_p]['first_date'] = o_date

        # Insert Customers
        for p, c in customer_agg.items():
            segment = 'New'
            if c['orders_count'] > 1:
                segment = 'Repeat'
            if c['total_revenue'] >= 5000:
                segment = 'VIP'

            cur.execute("""
            INSERT INTO customers 
            (phone, full_name, default_address, pincode, total_orders, total_revenue, first_order_date, last_order_date, customer_segment)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
            """, (
                p, c['name'], c['address'], c['pincode'], c['orders_count'], 
                c['total_revenue'], c['first_date'], c['last_date'], segment
            ))

        print(f"👥 Inserted {len(customer_agg)} Unique Customers into TiDB!")

        # Insert Orders
        for o in orders:
            raw_phone = o.get('mobile_number')
            clean_p = clean_phone(raw_phone)
            if not clean_p:
                clean_p = f"SURR_{o['sr_no']:04d}"

            o_date = parse_date(o.get('date'))
            amt = float(o.get('amount') or 0.0)
            caller = o.get('telecaller', 'Unknown').strip()
            mode = o.get('payment_mode', 'COD').strip()
            o_type = o.get('order_type', 'Direct Dispatch').strip()
            
            channel = 'India Post'
            if 'shadow' in str(o.get('full_address', '')).lower() or 'shadow' in str(o.get('products_ordered', '')).lower():
                channel = 'Shadowfax'
            elif 'office' in mode.lower() or 'walk' in o_type.lower():
                channel = 'Office'

            cur.execute("""
            INSERT INTO orders 
            (order_id, order_date, order_time, month, customer_phone, customer_name, caller_name, pincode, full_address, products_ordered, amount, payment_mode, order_type, dispatch_channel)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
            """, (
                o['sr_no'], o_date, o.get('time'), o.get('month'), clean_p,
                o.get('customer_name', 'Unknown'), caller, o.get('pincode'),
                o.get('full_address'), o.get('products_ordered'), amt,
                mode, o_type, channel
            ))

        print(f"🛒 Inserted {len(orders)} Orders into TiDB!")

        # Update Telecaller Totals
        cur.execute("""
        UPDATE telecallers t
        SET 
            total_orders = (SELECT COUNT(*) FROM orders WHERE caller_name = t.caller_name),
            total_revenue = (SELECT COALESCE(SUM(amount), 0) FROM orders WHERE caller_name = t.caller_name);
        """)
        print("📊 Telecaller Metrics Aggregated!")

        # Ingest Dispatch Batches (Oct, Nov 02, Nov 04)
        cur.execute("""
        INSERT INTO dispatch_batches (manifest_name, dispatch_date, order_count, total_cod_amount)
        VALUES 
            ('SUJATA_02_November_final.xlsx', '2026-11-02', 7, 3000.00),
            ('SUJATA_04_November_final.xlsx', '2026-11-04', 8, 12449.00);
        """)

    conn.close()
    print("=" * 75)
    print("🎉 TIDB SERVERLESS MIGRATION COMPLETED 100% SUCCESSFULLY!")
    print("=" * 75)

if __name__ == '__main__':
    main()
