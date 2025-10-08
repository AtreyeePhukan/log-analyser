import joblib

bundle = joblib.load("models/supervised_tfidf_model_bundle.pkl")
model = bundle["model"]
vectorizer = bundle["vectorizer"]

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
