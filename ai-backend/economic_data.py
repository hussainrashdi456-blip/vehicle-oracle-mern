"""Economic data PLACEHOLDER."""


def get_economic_data() -> dict:
    """TODO: Fetch live CPI, policy rate and PKR/USD from SBP EasyData API + PBS,
    cache the result, and fall back to the last known values on failure."""
    return {"cpi": 4.1, "policy_rate": 11.0, "forex": 281.5}


def run_pipeline() -> dict:
    """TODO: Implement the real ETL pipeline (SBP EasyData + PBS -> database)."""
    return {"status": "ok", "note": "placeholder pipeline"}
