import joblib
import pandas as pd
from fastapi import FastAPI, UploadFile, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import asyncio
from datetime import datetime, timedelta, timezone
from collections import defaultdict, deque
import pytz
import re
from io import StringIO
import traceback
from pathlib import Path
import numpy as np
import os
from pydantic import BaseModel
from dotenv import load_dotenv
from backend.log_simulator_runner import log_simulation_loop, clients
from backend.predict_supervised import predict_log_vectorized
from backend.log_generator import generate_insights_log, generate_windows_style_logs
from backend.utils import logs_to_dataframe
from backend.database import (
    create_logs_table,
    insert_log,
    get_table_data,
    get_line_chart_data,
    insert_or_update_suspicious_ip,
    get_suspicious_ips,
    get_bar_chart_data,
    get_donut_chart_data,
    update_dashboard_metrics,
    get_latest_dashboard_metrics,
)
from backend.model import load_model, is_suspicious


load_dotenv()

MODEL_PATH = Path(__file__).parent / "models" / "supervised_tfidf_model_bundle.pkl"

model_bundle = joblib.load(MODEL_PATH)
model = model_bundle["model"]
vectorizer = model_bundle["vectorizer"]

app = FastAPI()

active_connections = set()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


model = None

@app.on_event("startup")
async def startup():
    asyncio.create_task(background_startup())

async def background_startup():
    global model
    await create_logs_table()          
    model = load_model()               
    asyncio.create_task(log_simulation_loop())  


@app.get("/")
async def root():
    return {"status": "Backend is running"}

@app.post("/upload/")
async def upload_logs(file: UploadFile):
    try:

        content = file.file.read().decode("utf-8")
        df_raw = pd.read_csv(StringIO(content))

        rename_map = {
            "Action": "Action",
            "Protocol": "Protocol",
            "Source": "Source_IP",
            "Destination": "Destination_IP",
            "Source Port": "Source_Port",
            "Destination Port": "Destination_Port",
            "Size": "Packet_Size",
            "Severity": "Severity"
        }
        df_encoded = df_raw.rename(columns=rename_map)

        df_encoded["IP_Address"] = df_encoded["Source_IP"]

        if "Date" in df_raw.columns and "Time" in df_raw.columns:
            df_encoded["Timestamp"] = df_raw.apply(
                lambda row: datetime.strptime(
                    f"{row['Date']} {row['Time']}", "%Y-%m-%d %H:%M:%S"
                ),
                axis=1
            )
        elif "Timestamp" in df_raw.columns:
            df_encoded["Timestamp"] = pd.to_datetime(df_raw["Timestamp"])
        else:
            df_encoded["Timestamp"] = pd.Timestamp.now()

        df_encoded["Log_Type"] = "Firewall"

        df_encoded["Severity"] = df_raw["Severity"].astype(str).str.strip()

        
        predictions = predict_log_vectorized(df_encoded)
        print("Model Predictions:", predictions)

        for i, row in df_encoded.iterrows():
            timestamp = row["Timestamp"]

            if isinstance(timestamp, pd.Timestamp):
                if timestamp.tzinfo is None:
                    timestamp = timestamp.tz_localize("UTC")
            elif isinstance(timestamp, str):
                try:
                    timestamp = datetime.fromisoformat(timestamp)
                except ValueError:
                    timestamp = datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S")
                    timestamp = timestamp.replace(tzinfo=pytz.UTC)

            # is_anomaly = predictions[i] == "anomaly"
            is_anomaly = bool(predictions[i] == 1)

            await insert_log(
                row["IP_Address"],
                timestamp,  
                f"{row['Log_Type']} - {row['Severity']}",
                is_anomaly,
            )

        active_users = df_encoded["IP_Address"].nunique()
        time_range_minutes = max((df_encoded["Timestamp"].max() - df_encoded["Timestamp"].min()).total_seconds() / 60, 1)
        events_per_minute = round(len(df_encoded) / time_range_minutes)
        # alerts = sum(1 for pred in predictions if pred == 1)
        alerts = sum(1 for pred in predictions if pred == 0)
        await update_dashboard_metrics(active_users, events_per_minute, alerts)

        print("Unique predictions from model:", set(predictions))

        return {
            "lineData": await get_line_chart_data(),
            "barData": await get_bar_chart_data(),
            "donutData": await get_donut_chart_data(),
            "logs": await get_table_data(),
        }

    except Exception as e:
        print(f"Upload error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Log upload failed.")

@app.get("/charts/line")
async def get_line_data():
    return await get_line_chart_data()

@app.get("/charts/bar")
async def get_bar_data():
    return await get_bar_chart_data()

@app.get("/charts/donut")
async def get_donut_data():
    return await get_donut_chart_data()

@app.websocket("/ws/dashboard")
async def dashboard_ws(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket connected")
    try:
        while True:
            metrics = await get_latest_dashboard_metrics()
            await websocket.send_json(metrics)
            await asyncio.sleep(10)
    except Exception as e:
        print("WebSocket closed:", e)

@app.get("/metrics/")
async def fetch_metrics():
    return await get_latest_dashboard_metrics()

# @app.websocket("/ws/activity")
# async def websocket_activity(websocket: WebSocket):
#     await websocket.accept()
#     clients.add(websocket)
#     try:
#         while True:
#             await websocket.receive_text()
#     except:
#         clients.discard(websocket)

@app.websocket("/ws/insights")
async def websocket_insights(websocket: WebSocket):
    await websocket.accept()
    try:
        async for log in generate_insights_log():
            await websocket.send_json({"type": "log", "log": log})
    except Exception as e:
        print("Insights WebSocket closed:", e)
        
        
blocked_ips = set()

@app.post("/block_ip/{ip}")
async def block_ip(ip: str):
    blocked_ips.add(ip)
    return {"message": f"IP {ip} blocked successfully."}


class LogRequest(BaseModel):
    log_message: str


# summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
# classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

 
@app.post("/explain")
async def explain_log(request: LogRequest):
    log = request.log_message

    detection = "Normal"
    severity = "Low"
    explanation = "No significant activity detected."

    if "failed login" in log.lower():
        detection = "Brute Force Attempt"
        severity = "High"
        explanation = "Multiple failed login attempts detected. Possible brute force attack."
    elif "unauthorized access" in log.lower():
        detection = "Unauthorized Access"
        severity = "High"
        explanation = "Attempt to access a restricted resource."
    elif "malware" in log.lower():
        detection = "Malware Detected"
        severity = "Critical"
        explanation = "Log indicates potential malware activity."
    elif "invalid password" in log.lower():
        detection = "Password Attack"
        severity = "Medium"
        explanation = "Invalid password attempt detected."
    else:
        match = re.search(r"(ALLOW|DENY) (\w+) ([\d.]+):(\d+) -> ([\d.]+):(\d+)", log)
        if match:
            action, protocol, src_ip, src_port, dst_ip, dst_port = match.groups()
            port_map = {
                "22": "SSH",
                "80": "HTTP",
                "443": "HTTPS",
                "8080": "HTTP-Alt",
                "21": "FTP",
                "23": "Telnet",
                "53": "DNS"
            }
            service = port_map.get(dst_port, "Unknown Service")
            detection = "Unauthorized Access" if action == "DENY" else "Normal"
            severity = "High" if action == "DENY" else "Low"
            explanation = f"{action} {protocol} connection from {src_ip}:{src_port} to {dst_ip}:{dst_port} ({service})"

    return {
        "detection": detection,
        "severity": severity,
        "explanation": explanation
    }
    
ERROR_WINDOW = timedelta(minutes=10)
error_events_per_ip: dict[str, deque] = defaultdict(deque)

def _update_error_window(ip: str, ts: datetime, is_error: bool) -> int:
    dq = error_events_per_ip[ip]
    cutoff = ts - ERROR_WINDOW
    while dq and dq[0] < cutoff:
        dq.popleft()
    if is_error:
        dq.append(ts)
    return len(dq)

@app.websocket("/ws/logs")
async def logs_websocket(websocket: WebSocket):
    await websocket.accept()
    print("Client connected to /ws/logs")
    try:
        async for log in generate_windows_style_logs():
           
            ts = datetime.fromisoformat(log["timestamp"])
            ip = log.get("source_ip", "0.0.0.0")
            msg = log.get("log_message", "") or ""

            event_id = log.get("event_id")
            is_error_event = (event_id == 4625)

            error_count_last_10min = _update_error_window(ip, ts, is_error_event)

            log["error_count_last_10min"] = error_count_last_10min
            log["log_message"] = msg  

            anomaly_flag = is_suspicious(log, model)

            await insert_log(
                ip_address=ip,
                timestamp=ts,
                log_message=msg,
                is_anomaly=anomaly_flag
            )

            if anomaly_flag:
                await insert_or_update_suspicious_ip(
                    ip_address=ip,
                    reason=f"Spike: {error_count_last_10min} errors in last 10 min"
                )

            await websocket.send_json({
                "timestamp": log["timestamp"],
                "ip_address": ip,
                "log_message": msg,
                "error_count_last_10min": error_count_last_10min,
                "is_error_event": is_error_event,
                "is_anomaly": anomaly_flag
            })

            await asyncio.sleep(0.05) 
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        print("Client disconnected from /ws/logs")