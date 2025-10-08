import joblib
from pathlib import Path

MODEL_PATH = Path(__file__).parent / "models" / "supervised_tfidf_model_bundle.pkl"
model_bundle = joblib.load(MODEL_PATH)
model = model_bundle["model"]
vectorizer = model_bundle["vectorizer"]

def predict_log_vectorized(df):
    X_text = (
        df['Action'].astype(str) + " " +
        df['Protocol'].astype(str) + " " +
        df['Source_IP'].astype(str) + " " +
        df['Destination_IP'].astype(str) + " " +
        df['Source_Port'].astype(str) + " " +
        df['Destination_Port'].astype(str) + " " +
        df['Packet_Size'].astype(str)
    ).values.astype('U')

    X_vect = vectorizer.transform(X_text)
    predictions = model.predict(X_vect)
    return predictions
