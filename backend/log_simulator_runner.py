import asyncio
from log_generator import generate_log_entry

clients = set()

async def log_simulation_loop():
    while True:
        alerts = generate_log_entry()

        if alerts:
            for ws in clients.copy():
                try:
                    await ws.send_json({
                        "type": "keyword_spike_alerts",
                        "alerts": alerts
                    })
                except:
                    clients.discard(ws)

        await asyncio.sleep(2)  
