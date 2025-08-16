from collections import defaultdict, deque
from datetime import datetime, timedelta

SUSPICIOUS_KEYWORDS = [
    "failed login", "unauthorized", "invalid password"
]

log_tracker = defaultdict(lambda: defaultdict(deque))
TIME_WINDOW_SECONDS = 60
ALERT_THRESHOLD = 3

def process_log_entry(ip: str, message: str, timestamp: datetime):
    alerts = []
    msg = message.lower()

    for keyword in SUSPICIOUS_KEYWORDS:
        if keyword in msg:
            dq = log_tracker[ip][keyword]
            dq.append(timestamp)

            while dq and dq[0] < timestamp - timedelta(seconds=TIME_WINDOW_SECONDS):
                dq.popleft()

            if len(dq) >= ALERT_THRESHOLD:
                alerts.append({
                    "ip": ip,
                    "keyword": keyword,
                    "count": len(dq),
                    "timestamp": timestamp.isoformat()
                })

    return alerts
