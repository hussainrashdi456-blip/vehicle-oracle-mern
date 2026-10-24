"""
preprocessing.py
----------------
Kaam: Raw CSV load karna -> clean karna -> features banana -> clean CSV save karna.

Output: outputs/clean_data.csv
"""

import numpy as np
import pandas as pd

from .config import (
    RAW_DATA_PATH, CLEAN_DATA_PATH, RAW_COLS, CLEAN_COLS,
    PRICE_MIN, PRICE_MAX, YEAR_MIN, YEAR_MAX,
    MILEAGE_MIN, MILEAGE_MAX, ENGINE_MIN, ENGINE_MAX,
)
from .utils import save_dataframe


# --------------------------------------------------
# STEP 1: Column-wise cleaning functions
# --------------------------------------------------

def clean_price(value):
    """'PKR 25 lacs' -> 2500000"""
    if pd.isna(value):
        return np.nan
    s = str(value).lower().replace("pkr", "").replace(",", "").strip()
    try:
        if "crore" in s:
            return float(s.replace("crores", "").replace("crore", "").strip()) * 10_000_000
        if "lac" in s:
            return float(s.replace("lacs", "").replace("lac", "").strip()) * 100_000
        return float(s)
    except ValueError:
        return np.nan


def clean_mileage(value):
    """'100,000 km' -> 100000"""
    if pd.isna(value):
        return np.nan
    s = str(value).lower().replace("km", "").replace(",", "").strip()
    try:
        return float(s)
    except ValueError:
        return np.nan


def clean_engine(value):
    """'1300 cc' -> 1300"""
    if pd.isna(value):
        return np.nan
    s = str(value).lower().replace("cc", "").replace(",", "").strip()
    try:
        return float(s)
    except ValueError:
        return np.nan


def extract_brand(name):
    """'Toyota Corolla GLi' -> 'Toyota'"""
    if pd.isna(name):
        return np.nan
    return str(name).split()[0].strip()


def extract_model(name):
    """'Toyota Corolla GLi 1.3' -> 'Corolla GLi'"""
    if pd.isna(name):
        return np.nan
    parts = str(name).split()
    if len(parts) >= 3:
        return " ".join(parts[1:3])
    if len(parts) == 2:
        return parts[1]
    return np.nan


def count_features(value):
    """'ABS, Air Bags, Power Windows' -> 3"""
    if pd.isna(value):
        return 0
    return len(str(value).split(","))


# --------------------------------------------------
# STEP 2: Main cleaning pipeline
# --------------------------------------------------

def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Raw DataFrame -> cleaned DataFrame."""
    df = df.copy()

    # Text -> numeric
    df[CLEAN_COLS["price"]] = df[RAW_COLS["price"]].apply(clean_price)
    df[CLEAN_COLS["mileage"]] = df[RAW_COLS["mileage"]].apply(clean_mileage)
    df[CLEAN_COLS["engine"]] = df[RAW_COLS["engine"]].apply(clean_engine)

    # Name -> Brand + Model
    df[CLEAN_COLS["brand"]] = df[RAW_COLS["name"]].apply(extract_brand)
    df[CLEAN_COLS["model"]] = df[RAW_COLS["name"]].apply(extract_model)

    # Features -> count
    df[CLEAN_COLS["feature_count"]] = df[RAW_COLS["features"]].apply(count_features)

    return df


def drop_missing(df: pd.DataFrame) -> pd.DataFrame:
    """Zaroori columns mein missing rows drop karein."""
    required = [
        CLEAN_COLS["price"], CLEAN_COLS["mileage"], CLEAN_COLS["engine"],
        CLEAN_COLS["brand"], CLEAN_COLS["model"],
        RAW_COLS["year"], RAW_COLS["fuel"], RAW_COLS["transmission"],
        RAW_COLS["province"], RAW_COLS["body_type"],
    ]
    before = len(df)
    df = df.dropna(subset=required).copy()
    print(f"[DROP MISSING] {before - len(df)} rows removed -> {len(df)} left")
    return df


def remove_outliers(df: pd.DataFrame) -> pd.DataFrame:
    """Price/Year/Mileage/Engine ki ranges ke bahar wali rows hataayein."""
    before = len(df)

    df = df[(df[CLEAN_COLS["price"]] >= PRICE_MIN) & (df[CLEAN_COLS["price"]] <= PRICE_MAX)]
    df = df[(df[RAW_COLS["year"]] >= YEAR_MIN) & (df[RAW_COLS["year"]] <= YEAR_MAX)]
    df = df[(df[CLEAN_COLS["mileage"]] >= MILEAGE_MIN) & (df[CLEAN_COLS["mileage"]] <= MILEAGE_MAX)]
    df = df[(df[CLEAN_COLS["engine"]] >= ENGINE_MIN) & (df[CLEAN_COLS["engine"]] <= ENGINE_MAX)]

    print(f"[OUTLIERS] {before - len(df)} rows removed -> {len(df)} left")
    return df


def remove_duplicates(df: pd.DataFrame) -> pd.DataFrame:
    """Same car (brand+model+year+mileage+price+province) duplicate hataayein."""
    before = len(df)
    subset = [
        CLEAN_COLS["brand"], CLEAN_COLS["model"], RAW_COLS["year"],
        CLEAN_COLS["mileage"], CLEAN_COLS["price"], RAW_COLS["province"],
    ]
    df = df.drop_duplicates(subset=subset).copy()
    print(f"[DUPLICATES] {before - len(df)} rows removed -> {len(df)} left")
    return df


def add_features(df: pd.DataFrame) -> pd.DataFrame:
    """Car_Age jaise derived features add karein."""
    df = df.copy()
    df[CLEAN_COLS["car_age"]] = YEAR_MAX - df[RAW_COLS["year"]]
    return df


def select_final_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Sirf woh columns rakhein jo model ke liye chahiye."""
    keep = [
        CLEAN_COLS["brand"], CLEAN_COLS["model"], RAW_COLS["year"],
        CLEAN_COLS["car_age"], CLEAN_COLS["mileage"], CLEAN_COLS["engine"],
        RAW_COLS["fuel"], RAW_COLS["transmission"], RAW_COLS["province"],
        RAW_COLS["body_type"], CLEAN_COLS["feature_count"], CLEAN_COLS["price"],
    ]
    return df[keep].copy()


# --------------------------------------------------
# STEP 3: Public entry point
# --------------------------------------------------

def run_preprocessing():
    """Poora pipeline: load -> clean -> save."""
    print("\n========== PREPROCESSING START ==========")
    df_raw = pd.read_csv(RAW_DATA_PATH)
    print(f"[LOADED] raw rows={len(df_raw)}, cols={len(df_raw.columns)}")

    df = clean_dataframe(df_raw)
    df = drop_missing(df)
    df = remove_outliers(df)
    df = remove_duplicates(df)
    df = add_features(df)
    df = select_final_columns(df)

    save_dataframe(df, CLEAN_DATA_PATH)
    print("========== PREPROCESSING DONE ==========\n")
    return df


if __name__ == "__main__":
    run_preprocessing()