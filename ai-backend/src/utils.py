"""
utils.py
--------
Chhote helper functions: folders banana, CSV/Model save-load karna.
"""

import os
import joblib
import pandas as pd


def ensure_dir(path: str):
    """Folder na ho to bana dein."""
    os.makedirs(path, exist_ok=True)


def save_dataframe(df: pd.DataFrame, path: str):
    """DataFrame ko CSV mein save karein."""
    ensure_dir(os.path.dirname(path))
    df.to_csv(path, index=False)
    print(f"[SAVED] DataFrame -> {path}  (rows={len(df)})")


def load_dataframe(path: str) -> pd.DataFrame:
    """CSV se DataFrame load karein."""
    df = pd.read_csv(path)
    print(f"[LOADED] {path}  (rows={len(df)}, cols={len(df.columns)})")
    return df


def save_model(obj, path: str):
    """Joblib se koi bhi object save karein (model, encoders, list)."""
    ensure_dir(os.path.dirname(path))
    joblib.dump(obj, path)
    print(f"[SAVED] Object -> {path}")


def load_model(path: str):
    """Joblib se object load karein."""
    obj = joblib.load(path)
    print(f"[LOADED] Object <- {path}")
    return obj