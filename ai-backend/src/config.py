"""
config.py
---------
Is file mein saare constants hain: paths, column names, outlier ranges.
Agar kal ko koi column name ya path badalna ho, sirf yahan badlein.
"""

import os

# ---------- PATHS ----------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
OUTPUT_DIR = os.path.join(BASE_DIR, "outputs")

RAW_DATA_PATH = os.path.join(DATA_DIR, "pakwheels_80000.csv")
CLEAN_DATA_PATH = os.path.join(OUTPUT_DIR, "clean_data.csv")

MODEL_PATH = os.path.join(OUTPUT_DIR, "xgb_car_price_model.pkl")
ENCODERS_PATH = os.path.join(OUTPUT_DIR, "label_encoders.pkl")
FEATURES_PATH = os.path.join(OUTPUT_DIR, "feature_columns.pkl")

# ---------- RAW COLUMN NAMES (dataset ke mutabiq) ----------
RAW_COLS = {
    "name": "nam",
    "price": "Price",
    "year": "Year",
    "mileage": "Millage",
    "fuel": "Fuel",
    "transmission": "Transmission",
    "province": "Province",
    "color": "Color",
    "assembly": "Assembly",
    "engine": "Engine Capacity",
    "body_type": "Body Type",
    "features": "Features",
    "owner": "Owner nam",
    "url": "url",
    "ad_ref": "Ad Reference",
}

# ---------- CLEANED COLUMN NAMES ----------
CLEAN_COLS = {
    "price": "Price_Cleaned",
    "mileage": "Mileage_Cleaned",
    "engine": "Engine_Cleaned",
    "brand": "Brand",
    "model": "Model",
    "feature_count": "Feature_Count",
    "car_age": "Car_Age",
}

# ---------- OUTLIER RANGES ----------
PRICE_MIN = 100_000
PRICE_MAX = 50_000_000
YEAR_MIN = 1990
YEAR_MAX = 2025
MILEAGE_MIN = 0
MILEAGE_MAX = 500_000
ENGINE_MIN = 600
ENGINE_MAX = 5000

# ---------- MODEL FEATURES ----------
CATEGORICAL_FEATURES = ["Brand", "Model", "Fuel", "Transmission", "Province", "Body Type"]
NUMERIC_FEATURES = ["Car_Age", "Mileage_Cleaned", "Engine_Cleaned", "Feature_Count"]
TARGET_COLUMN = "Price_Cleaned"
ALL_FEATURES = CATEGORICAL_FEATURES + NUMERIC_FEATURES

# ---------- TRAIN/TEST ----------
TEST_SIZE = 0.2
RANDOM_STATE = 42

# ---------- XGBOOST HYPERPARAMETERS ----------
XGB_PARAMS = {
    "n_estimators": 500,
    "learning_rate": 0.05,
    "max_depth": 6,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "objective": "reg:squarederror",
    "random_state": RANDOM_STATE,
    "n_jobs": -1,
}