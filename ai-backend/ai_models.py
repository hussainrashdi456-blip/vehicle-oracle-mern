"""
ai_models.py
------------
AI models ka integration. XGBoost model load karta hai aur price predict karta hai.
YOLOv8 abhi placeholder hai (baad mein bharenge).
"""

import os
import joblib
import numpy as np
import pandas as pd

# ---------- PATHS ----------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "outputs")

MODEL_PATH = os.path.join(OUTPUT_DIR, "xgb_car_price_model.pkl")
ENCODERS_PATH = os.path.join(OUTPUT_DIR, "label_encoders.pkl")
FEATURES_PATH = os.path.join(OUTPUT_DIR, "feature_columns.pkl")


# ---------- MODEL LOADING (cached) ----------
_model = None
_encoders = None
_features = None


def _load_artifacts():
    """Model, encoders, aur features load karein (ek dafa)."""
    global _model, _encoders, _features

    if _model is None:
        if not os.path.exists(MODEL_PATH):
            return False
        _model = joblib.load(MODEL_PATH)
        _encoders = joblib.load(ENCODERS_PATH)
        _features = joblib.load(FEATURES_PATH)
    return True


def load_price_model():
    """Public function — model load karta hai."""
    if _load_artifacts():
        return _model
    return None


# ---------- PRICE PREDICTION ----------
def predict_price(car_details: dict, economic_data: dict = None) -> dict:
    """
    Car details se price predict karein.

    INPUT (car_details):
        - Brand: str (e.g., "Toyota")
        - Model: str (e.g., "Corolla GLi")
        - Year: int (e.g., 2015)
        - Mileage_Cleaned: float (e.g., 50000)
        - Engine_Cleaned: float (e.g., 1300)
        - Fuel: str (e.g., "Petrol")
        - Transmission: str (e.g., "Manual")
        - Province: str (e.g., "Punjab")
        - Body Type: str (e.g., "Sedan")
        - Feature_Count: int (e.g., 5)

    OUTPUT:
        {"price": float, "explanation": dict}
    """
    if not _load_artifacts():
        return {
            "price": 0.0,
            "explanation": {"note": "Model not trained yet. Run run_pipeline.py first."}
        }

    try:
        # Car age calculate karein
        current_year = 2025
        car_age = current_year - int(car_details.get("Year", current_year))

        # Input row banayein (same order jo feature_columns.pkl mein hai)
        row = {
            "Brand": car_details.get("Brand", "Unknown"),
            "Model": car_details.get("Model", "Unknown"),
            "Car_Age": car_age,
            "Mileage_Cleaned": float(car_details.get("Mileage_Cleaned", 0)),
            "Engine_Cleaned": float(car_details.get("Engine_Cleaned", 1000)),
            "Fuel": car_details.get("Fuel", "Petrol"),
            "Transmission": car_details.get("Transmission", "Manual"),
            "Province": car_details.get("Province", "Punjab"),
            "Body Type": car_details.get("Body Type", "Sedan"),
            "Feature_Count": int(car_details.get("Feature_Count", 0)),
        }

        # Categorical columns encode karein
        for col, encoder in _encoders.items():
            if col in row:
                val = str(row[col])
                # Agar value encoder mein maujood nahi, to default (0) use karein
                if val in encoder.classes_:
                    row[col] = encoder.transform([val])[0]
                else:
                    row[col] = 0

        # DataFrame banayein (feature order maintain karte hue)
        X = pd.DataFrame([row])[_features]

        # Predict karein
        price = float(_model.predict(X)[0])

        # Explainability — feature importance se
        importance = dict(zip(_features, _model.feature_importances_))
        top_features = sorted(importance.items(), key=lambda x: x[1], reverse=True)[:5]

        return {
            "price": price,
            "explanation": {
                "top_factors": [
                    {"feature": f, "importance": round(float(v), 3)}
                    for f, v in top_features
                ],
                "note": "Top features jo price ko sab se zyada affect karte hain"
            }
        }

    except Exception as e:
        return {
            "price": 0.0,
            "explanation": {"error": str(e)}
        }


# ---------- DAMAGE DETECTION (placeholder) ----------
def detect_damage(image) -> dict:
    """
    YOLOv8 damage detection — ABHI PLACEHOLDER HAI.
    Baad mein YOLOv8 model integrate karenge.
    """
    return {
        "damage_detected": False,
        "boxes": [],
        "severity": "none",
        "repair_cost": 0.0,
        "note": "YOLOv8 model not integrated yet"
    }