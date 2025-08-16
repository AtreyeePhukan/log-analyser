import random
from datetime import datetime, timezone
from log_nlp import process_log_entry
import asyncio

sample_ips = ["10.0.0.1", "10.0.0.2", "192.168.1.3", "172.16.0.5"]
messages = [
    "Failed login attempt for admin",
    "Unauthorized access detected",
    "Invalid password entered by user",
    "Successful login for user root",
    "Connection established to database"
]

def generate_log_entry():
    ip = random.choice(sample_ips)
    message = random.choice(messages)
    timestamp = datetime.utcnow()
    alerts = process_log_entry(ip, message, timestamp)
    return alerts

def detect_security_event(log_message):
    if "Failed login" in log_message:
        return "Brute Force Attempt"
    elif "Unauthorized access" in log_message:
        return "Unauthorized Access"
    elif "Invalid password" in log_message:
        return "Password Attack"
    elif "malware" in log_message.lower():
        return "Malware Detected"
    else:
        return "Normal"


actions = ["ALLOW", "DENY"]
protocols = ["TCP", "UDP", "ICMP"]
ports = [22, 80, 443, 8080, 21, 23, 53]
ips = ["192.168.1.5", "192.168.1.10", "10.0.0.1", "172.16.0.2", "8.8.8.8"]

attack_keywords = [
    "failed login attempt",          
    "unauthorized access to admin",  
    "malware signature detected",    
    "invalid password attempt"       
]


async def generate_insights_log():
    while True:
        timestamp = datetime.now().strftime("%b %d %H:%M:%S")
        action = random.choice(actions)
        protocol = random.choice(protocols)
        src_ip = random.choice(ips)
        dst_ip = random.choice([ip for ip in ips if ip != src_ip])
        src_port = random.randint(1024, 65535)
        dst_port = random.choice(ports)

        base_log = f"{timestamp} {action} {protocol} {src_ip}:{src_port} -> {dst_ip}:{dst_port}"

        if random.random() < 0.25:
            keyword = random.choice(attack_keywords)
            raw_log = f"{timestamp} {keyword} from {src_ip}:{src_port} -> {dst_ip}:{dst_port}"
        else:
            raw_log = f"{timestamp} {action} {protocol} {src_ip}:{src_port} -> {dst_ip}:{dst_port}"

        yield {
            "timestamp": datetime.utcnow().isoformat(),
            "ip_address": src_ip,
            "log_message": raw_log
        }

        await asyncio.sleep(4)


EVENT_IDS = [4624, 4625]  # 4624=success, 4625=fail
ACCOUNTS = ['Alice', 'Bob', 'Charlie', 'David']
IPS = ["192.168.1.5", "192.168.1.10", "10.0.0.1", "172.16.0.2", "8.8.8.8"]
FAILURE_REASONS = [
    "Unknown user name or bad password",
    "Account locked out",
    "Logon hours restriction",
    "Account disabled"
]
LOGON_TYPES = [2, 3, 4, 7]

async def generate_windows_style_logs():
    while True:
        # timestamp = datetime.now(timezone.utc).isoformat()
        timestamp = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
        event_id = random.choices(EVENT_IDS, weights=[70, 30])[0]
        src_ip = random.choice(IPS)
        account = random.choice(ACCOUNTS)
        logon_type = random.choice(LOGON_TYPES)
        failure_reason = random.choice(FAILURE_REASONS) if event_id == 4625 else ""

        if event_id == 4625:
            log_message = f"Failed login for account {account} from {src_ip}, reason: {failure_reason}"
        else:
            log_message = f"Successful login for account {account} from {src_ip}"

        yield {
            "timestamp": timestamp,
            "event_id": event_id,
            "source_ip": src_ip,
            "account_name": account,
            "logon_type": logon_type,
            "failure_reason": failure_reason,
            "log_message": log_message
        }

        await asyncio.sleep(4)