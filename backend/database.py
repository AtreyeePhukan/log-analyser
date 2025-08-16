import asyncpg
import os
from dotenv import load_dotenv
import datetime

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

conn = None  

async def get_db():
    global conn
    if conn is None:
        conn = await asyncpg.connect(DATABASE_URL)
    return conn

async def create_logs_table():
    db = await get_db()
    await db.execute("""
        CREATE TABLE IF NOT EXISTS logs_processed (
            id SERIAL PRIMARY KEY,
            ip_address TEXT,
            timestamp TIMESTAMPTZ,
            log_message TEXT,
            is_anomaly BOOLEAN
        )
    """)
    await db.execute("""
        CREATE TABLE IF NOT EXISTS dashboard_metrics (
            id SERIAL PRIMARY KEY,
            active_users INTEGER,
            events_per_minute INTEGER,
            alerts INTEGER,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)
    
    await db.execute("""
        CREATE TABLE IF NOT EXISTS suspicious_ips (
            ip_address TEXT PRIMARY KEY,
            fail_count INTEGER DEFAULT 0,
            last_seen TIMESTAMPTZ,
            reason TEXT
        )
    """)

async def insert_log(ip_address, timestamp, log_message, is_anomaly):
    db = await get_db()
    await db.execute(
        "INSERT INTO logs_processed (ip_address, timestamp, log_message, is_anomaly) VALUES ($1, $2, $3, $4)",
        ip_address, timestamp, log_message, is_anomaly
    )

async def get_chart_data():
    db = await get_db()
    result = await db.fetch("""
        SELECT date_trunc('minute', timestamp) as time, COUNT(*) as count
        FROM logs_processed
        WHERE is_anomaly = TRUE
        GROUP BY time
        ORDER BY time
        LIMIT 50
    """)
    return [{"time": str(r["time"]), "count": r["count"]} for r in result]

async def get_all_logs():
    db = await get_db()
    result = await db.fetch("""
        SELECT ip_address, timestamp, log_message, is_anomaly
        FROM logs_processed
        ORDER BY timestamp DESC
        LIMIT 100
    """)
    return [dict(row) for row in result]

async def get_line_chart_data():
    db = await get_db()
    result = await db.fetch("""
        SELECT date_trunc('minute', timestamp) as time, COUNT(*) as count
        FROM logs_processed
        GROUP BY time
        ORDER BY time
        LIMIT 50
    """)
    return [{"time": str(r["time"]), "count": r["count"]} for r in result]

async def get_bar_chart_data():
    db = await get_db()
    result = await db.fetch("""
        SELECT 
            ip_address,
            SUM(CASE WHEN is_anomaly = FALSE THEN 1 ELSE 0 END) AS success,
            SUM(CASE WHEN is_anomaly = TRUE THEN 1 ELSE 0 END) AS anomaly
        FROM logs_processed
        GROUP BY ip_address
        ORDER BY anomaly DESC
        LIMIT 10
    """)
    return [
        {
            "ip": r["ip_address"],
            "success": r["success"],
            "anomaly": r["anomaly"]
        }
        for r in result
    ]


async def get_donut_chart_data():
    db = await get_db()
    result = await db.fetch("""
        SELECT 
            CASE
                WHEN log_message ILIKE '%High%' THEN 'High'
                WHEN log_message ILIKE '%Mid%' OR log_message ILIKE '%Medium%' THEN 'Mid'
                WHEN log_message ILIKE '%Low%' THEN 'Low'
                ELSE 'Low'
            END AS severity,
            COUNT(*) AS count
        FROM logs_processed
        GROUP BY severity
    """)
    return [
        {"label": r["severity"], "count": r["count"]}
        for r in result
    ]


async def get_table_data():
    db = await get_db()
    result = await db.fetch("""
        SELECT id, ip_address, is_anomaly
        FROM logs_processed
        ORDER BY timestamp DESC
        LIMIT 100
    """)
    return [
        {
            "id": r["id"],
            "ip_address": r["ip_address"],
            "is_anomaly": r["is_anomaly"]
        }
        for r in result
    ]

async def update_dashboard_metrics(active_users, events_per_minute, alerts):
    db = await get_db()
    print("Saving dashboard metrics:", active_users, events_per_minute, alerts)
    await db.execute("""
        INSERT INTO dashboard_metrics (active_users, events_per_minute, alerts)
        VALUES ($1, $2, $3)
    """, active_users, events_per_minute, alerts)

async def get_latest_dashboard_metrics():
    db = await get_db()
    row = await db.fetchrow("""
        SELECT active_users, events_per_minute, alerts
        FROM dashboard_metrics
        ORDER BY created_at DESC
        LIMIT 1
    """)
    
    if row:
        return {
            "active_users": row["active_users"],
            "events_per_minute": row["events_per_minute"],
            "alerts": row["alerts"]
        }
    return {
        "active_users": 0,
        "events_per_minute": 0,
        "alerts": 0
    }

async def insert_or_update_suspicious_ip(ip_address: str, reason: str):
    db = await get_db()
    now = datetime.utcnow()
    result = await db.execute("""
        UPDATE suspicious_ips
        SET fail_count = fail_count + 1,
            last_seen = $2,
            reason = $3
        WHERE ip_address = $1
    """, ip_address, now, reason)

    if result == 'UPDATE 0':
        await db.execute("""
            INSERT INTO suspicious_ips (ip_address, fail_count, last_seen, reason)
            VALUES ($1, 1, $2, $3)
        """, ip_address, now, reason)

async def get_suspicious_ips(limit=100):
    db = await get_db()
    rows = await db.fetch("""
        SELECT ip_address, fail_count, last_seen, reason
        FROM suspicious_ips
        ORDER BY last_seen DESC
        LIMIT $1
    """, limit)
    return [dict(row) for row in rows]
