"""
train.py
--------
Kaam: clean_data.csv load -> encode -> train XGBoost -> evaluate -> save model.

Output: xgb_car_price_model.pkl, label_encoders.pkl, feature_columns.pkl
"""

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb

from .config import (
    CLEAN_DATA_PATH, MODEL_PATH, ENCODERS_PATH, FEATURES_PATH,
    OUTPUT_DIR, CATEGORICAL_FEATURES, NUMERIC_FEATURES,
    TARGET_COLUMN, ALL_FEATURES, TEST_SIZE, RANDOM_STATE, XGB_PARAMS,
)
from .utils import load_dataframe, save_model, ensure_dir


def encode_features(df: pd.DataFrame):
    """Categorical columns ko Label Encode karein. Encoders return karein."""
    X = df[ALL_FEATURES].copy()
    encoders = {}

    for col in CATEGORICAL_FEATURES:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col].astype(str))
        encoders[col] = le
        print(f"[ENCODE] {col}: {len(le.classes_)} unique values")

    return X, encoders


def evaluate(y_true, y_pred):
    """MAE, RMSE, R² calculate karein."""
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    print(f"\n[EVAL] MAE:  PKR {mae:,.0f}")
    print(f"[EVAL] RMSE: PKR {rmse:,.0f}")
    print(f"[EVAL] R²:   {r2:.4f}")
    return {"mae": mae, "rmse": rmse, "r2": r2}


def plot_feature_importance(model, feature_names):
    importance = pd.DataFrame({
        "Feature": feature_names,
        "Importance": model.feature_importances_,
    }).sort_values("Importance", ascending=False)

    fig, ax = plt.subplots(figsize=(10, 6))
    sns.barplot(data=importance, x="Importance", y="Feature", palette="viridis", ax=ax)
    ax.set_title("XGBoost Feature Importance")
    path = os.path.join(OUTPUT_DIR, "feature_importance.png")
    fig.savefig(path, bbox_inches="tight", dpi=120)
    plt.close(fig)
    print(f"[SAVED PLOT] {path}")
    print(importance)


def run_training():
    print("\n========== TRAINING START ==========")
    ensure_dir(OUTPUT_DIR)

    df = load_dataframe(CLEAN_DATA_PATH)

    # Encode
    X, encoders = encode_features(df)
    y = df[TARGET_COLUMN].copy()

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )
    print(f"[SPLIT] Train={len(X_train)} | Test={len(X_test)}")

    # Train
    model = xgb.XGBRegressor(**XGB_PARAMS)
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)
    print("[TRAIN] Model trained.")

    # Evaluate
    y_pred = model.predict(X_test)
    metrics = evaluate(y_test, y_pred)

    # Feature importance plot
    plot_feature_importance(model, list(X.columns))

    # Save artifacts
    save_model(model, MODEL_PATH)
    save_model(encoders, ENCODERS_PATH)
    save_model(list(X.columns), FEATURES_PATH)

    print("========== TRAINING DONE ==========\n")
    return metrics


if __name__ == "__main__":
    run_training()