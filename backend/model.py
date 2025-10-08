import joblib
import pandas as pd
from pathlib import Path

MODEL_PATH = Path(__file__).parent / "models/suspicious_ip_model.pkl"  

def load_model():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}. Train and save your model first.")
    return joblib.load(MODEL_PATH)  

def preprocess_log_for_pipeline(log: dict) -> pd.DataFrame:
  
    return pd.DataFrame([{
        "Message": log.get("log_message", ""),
        "error_count_last_10min": float(log.get("error_count_last_10min", 0))
    }])

def is_suspicious(log: dict, model) -> bool:
    X = preprocess_log_for_pipeline(log)
    pred = model.predict(X)
    return bool(pred[0])
