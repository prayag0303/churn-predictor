"""
ML model loading and inference.

All expensive objects (_pipeline, _explainer, _feature_names) are initialised
once at import time so every request reuses the same in-memory state.
"""
from pathlib import Path
from typing import Optional
import json

import numpy as np
import pandas as pd
import joblib
import shap

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
_BASE = Path(__file__).parent
_MODEL_PATH = _BASE / "model" / "churn_model.pkl"
_SCORES_PATH = _BASE / "model" / "customers_scored.json"

if not _MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Model not found at {_MODEL_PATH}. "
        "Run backend/notebooks/01_train_model.ipynb first."
    )
if not _SCORES_PATH.exists():
    raise FileNotFoundError(
        f"Scored data not found at {_SCORES_PATH}. "
        "Run backend/notebooks/01_train_model.ipynb first."
    )

# ---------------------------------------------------------------------------
# Load artifacts (once at startup)
# ---------------------------------------------------------------------------
_pipeline = joblib.load(_MODEL_PATH)

with open(_SCORES_PATH) as f:
    _scored_data = json.load(f)

_customers: list = _scored_data["customers"]
_customers_by_id: dict = {c["customer_id"]: c for c in _customers}

# Extract fitted components from the pipeline for inference and SHAP
_xgb_model = _pipeline.named_steps["model"]
_preprocessor = _pipeline.named_steps["preprocessor"]
_explainer = shap.TreeExplainer(_xgb_model)

# Reconstruct the full feature name list the preprocessor produces
_numerical_features = [
    "tenure", "MonthlyCharges", "TotalCharges",
    "charges_per_month_ratio", "service_count", "tenure_bucket", "contract_risk",
]
_categorical_features = [
    "gender", "Partner", "Dependents", "PhoneService", "MultipleLines",
    "InternetService", "OnlineSecurity", "OnlineBackup", "DeviceProtection",
    "TechSupport", "StreamingTV", "StreamingMovies", "Contract",
    "PaperlessBilling", "PaymentMethod",
]
_cat_names = (
    _preprocessor.named_transformers_["cat"]
    .get_feature_names_out(_categorical_features)
    .tolist()
)
_feature_names: list = _numerical_features + _cat_names

# ---------------------------------------------------------------------------
# Feature engineering (mirrors the notebook exactly)
# ---------------------------------------------------------------------------
_SERVICE_COLS = [
    "PhoneService", "MultipleLines", "OnlineSecurity", "OnlineBackup",
    "DeviceProtection", "TechSupport", "StreamingTV", "StreamingMovies",
]
_CONTRACT_RISK = {"Month-to-month": 2, "One year": 1, "Two year": 0}


def _engineer(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["tenure_bucket"] = pd.cut(
        df["tenure"],
        bins=[-1, 12, 24, 48, float("inf")],
        labels=[0, 1, 2, 3],
    ).astype(int)
    df["charges_per_month_ratio"] = df["TotalCharges"] / (df["tenure"] + 1)
    df["service_count"] = (
        df[_SERVICE_COLS].apply(lambda col: (col == "Yes").astype(int)).sum(axis=1)
    )
    df["contract_risk"] = df["Contract"].map(_CONTRACT_RISK)
    return df


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_all_customers() -> list:
    return _customers


def get_customer_by_id(customer_id: str) -> Optional[dict]:
    return _customers_by_id.get(customer_id)


def predict_single(input_dict: dict) -> tuple:
    """
    Returns (churn_probability: float, risk_tier: str, top_shap: list[dict]).
    input_dict must contain all CustomerInput fields (feature engineering applied here).
    """
    df = _engineer(pd.DataFrame([input_dict]))

    prob = float(_pipeline.predict_proba(df)[0][1])

    X = _preprocessor.transform(df)
    if hasattr(X, "toarray"):
        X = X.toarray()

    shap_row = _explainer.shap_values(X)[0]
    top5 = np.argsort(np.abs(shap_row))[::-1][:5]
    top_shap = [
        {
            "feature": _feature_names[i],
            "value": round(float(shap_row[i]), 2),
            "direction": "increases_risk" if shap_row[i] > 0 else "reduces_risk",
        }
        for i in top5
    ]

    tier = "High" if prob > 0.65 else "Medium" if prob >= 0.35 else "Low"
    return prob, tier, top_shap


def get_retention_recommendation(top_shap_features: list) -> str:
    if not top_shap_features:
        return "Reach out personally with a customised retention offer."
    top = top_shap_features[0]["feature"]
    if "Contract" in top:
        return "Offer a 12-month contract with a 15% discount."
    if "tenure" in top:
        return "This is a new customer. Assign a dedicated onboarding rep."
    if "TechSupport" in top:
        return "Offer 3 months of free TechSupport."
    if "OnlineSecurity" in top:
        return "Offer a free OnlineSecurity add-on for 6 months."
    if "MonthlyCharges" in top:
        return "Offer a loyalty discount of 10% on current plan."
    return "Reach out personally with a customised retention offer."
