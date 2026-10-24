"""
eda.py
------
Kaam: clean_data.csv load karke plots aur summary stats banana.
Plots outputs/eda/ folder mein save hote hain.
"""

import os
import matplotlib.pyplot as plt
import seaborn as sns

from .config import CLEAN_DATA_PATH, OUTPUT_DIR, CLEAN_COLS, RAW_COLS
from .utils import load_dataframe, ensure_dir

sns.set_style("whitegrid")
EDA_DIR = os.path.join(OUTPUT_DIR, "eda")


def _save_plot(fig, name):
    path = os.path.join(EDA_DIR, name)
    fig.savefig(path, bbox_inches="tight", dpi=120)
    plt.close(fig)
    print(f"[SAVED PLOT] {path}")


def plot_price_distribution(df):
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    sns.histplot(df[CLEAN_COLS["price"]], bins=50, kde=True, ax=axes[0], color="steelblue")
    axes[0].set_title("Price Distribution (PKR)")
    sns.boxplot(x=df[CLEAN_COLS["price"]], ax=axes[1], color="salmon")
    axes[1].set_title("Price Boxplot")
    _save_plot(fig, "01_price_distribution.png")


def plot_top_brands(df):
    top = df[CLEAN_COLS["brand"]].value_counts().head(15)
    fig, ax = plt.subplots(figsize=(10, 6))
    sns.barplot(x=top.values, y=top.index, palette="viridis", ax=ax)
    ax.set_title("Top 15 Brands by Listings")
    _save_plot(fig, "02_top_brands.png")


def plot_price_vs_year(df):
    fig, ax = plt.subplots(figsize=(12, 5))
    sns.scatterplot(data=df, x=RAW_COLS["year"], y=CLEAN_COLS["price"], alpha=0.3, ax=ax, color="teal")
    ax.set_title("Price vs Year")
    _save_plot(fig, "03_price_vs_year.png")


def plot_price_vs_mileage(df):
    fig, ax = plt.subplots(figsize=(12, 5))
    sns.scatterplot(data=df, x=CLEAN_COLS["mileage"], y=CLEAN_COLS["price"], alpha=0.3, ax=ax, color="purple")
    ax.set_title("Price vs Mileage")
    _save_plot(fig, "04_price_vs_mileage.png")


def plot_categorical_boxplots(df):
    fig, axes = plt.subplots(1, 3, figsize=(18, 5))
    sns.boxplot(data=df, x=RAW_COLS["transmission"], y=CLEAN_COLS["price"], ax=axes[0], palette="Set2")
    axes[0].set_title("Price by Transmission")
    sns.boxplot(data=df, x=RAW_COLS["fuel"], y=CLEAN_COLS["price"], ax=axes[1], palette="Set3")
    axes[1].set_title("Price by Fuel")
    sns.boxplot(data=df, x=RAW_COLS["body_type"], y=CLEAN_COLS["price"], ax=axes[2], palette="Pastel1")
    axes[2].set_title("Price by Body Type")
    for ax in axes:
        ax.tick_params(axis="x", rotation=45)
    _save_plot(fig, "05_categorical_boxplots.png")


def plot_province_counts(df):
    counts = df[RAW_COLS["province"]].value_counts()
    fig, ax = plt.subplots(figsize=(10, 5))
    sns.barplot(x=counts.values, y=counts.index, palette="coolwarm", ax=ax)
    ax.set_title("Listings by Province")
    _save_plot(fig, "06_province_counts.png")


def plot_correlation_heatmap(df):
    cols = [
        CLEAN_COLS["price"], RAW_COLS["year"], CLEAN_COLS["mileage"],
        CLEAN_COLS["engine"], CLEAN_COLS["feature_count"],
    ]
    corr = df[cols].corr()
    fig, ax = plt.subplots(figsize=(8, 6))
    sns.heatmap(corr, annot=True, cmap="coolwarm", fmt=".2f", linewidths=0.5, ax=ax)
    ax.set_title("Correlation Heatmap")
    _save_plot(fig, "07_correlation_heatmap.png")


def print_summary(df):
    print("\n========== EDA SUMMARY ==========")
    print(f"Rows: {len(df)}")
    print(f"\nPrice stats:\n{df[CLEAN_COLS['price']].describe()}")
    print(f"\nYear range: {df[RAW_COLS['year']].min()} - {df[RAW_COLS['year']].max()}")
    print(f"\nTop 5 brands:\n{df[CLEAN_COLS['brand']].value_counts().head()}")
    print("=================================\n")


def run_eda():
    print("\n========== EDA START ==========")
    ensure_dir(EDA_DIR)

    df = load_dataframe(CLEAN_DATA_PATH)
    print_summary(df)

    plot_price_distribution(df)
    plot_top_brands(df)
    plot_price_vs_year(df)
    plot_price_vs_mileage(df)
    plot_categorical_boxplots(df)
    plot_province_counts(df)
    plot_correlation_heatmap(df)

    print("========== EDA DONE ==========\n")


if __name__ == "__main__":
    run_eda()