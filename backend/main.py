from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

import model as ml
from schemas import (
    CustomerInput,
    CustomerRecord,
    CustomersResponse,
    PredictionResponse,
    ShapFeature,
)

app = FastAPI(
    title="Churn Predictor API",
    version="1.0",
    description="Predicts customer churn probability using a trained XGBoost model.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Local dev
        "http://localhost:3000",  # Alternative local dev
        "https://churn-predictor-004t.onrender.com",  # Vercel deployments
        "https://churn-predictor-five.vercel.app",  # Custom domain (update with your domain)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/", tags=["Health"])
def root():
    return {"message": "Churn Predictor API is running", "version": "1.0"}


# ---------------------------------------------------------------------------
# Customer list
# ---------------------------------------------------------------------------

@app.get("/customers", response_model=CustomersResponse, tags=["Customers"])
def get_customers(
    risk_tier: Optional[str] = Query(
        None, description="Filter by risk tier: High | Medium | Low"
    ),
    contract: Optional[str] = Query(
        None, description="Filter by contract type: 'Month-to-month' | 'One year' | 'Two year'"
    ),
    min_charges: Optional[float] = Query(
        None, description="Minimum monthly charges (inclusive)"
    ),
    max_charges: Optional[float] = Query(
        None, description="Maximum monthly charges (inclusive)"
    ),
):
    """
    Return all pre-scored customers with optional filters.
    Summary stats (counts, revenue at risk) are computed on the filtered list.
    """
    customers = ml.get_all_customers()

    if risk_tier:
        customers = [c for c in customers if c["risk_tier"] == risk_tier]
    if contract:
        customers = [c for c in customers if c["contract"] == contract]
    if min_charges is not None:
        customers = [c for c in customers if c["monthly_charges"] >= min_charges]
    if max_charges is not None:
        customers = [c for c in customers if c["monthly_charges"] <= max_charges]

    high = [c for c in customers if c["risk_tier"] == "High"]
    medium = [c for c in customers if c["risk_tier"] == "Medium"]
    low = [c for c in customers if c["risk_tier"] == "Low"]
    monthly_at_risk = sum(c["monthly_charges"] for c in high)

    return CustomersResponse(
        customers=[CustomerRecord(**c) for c in customers],
        total_count=len(customers),
        high_risk_count=len(high),
        medium_risk_count=len(medium),
        low_risk_count=len(low),
        total_monthly_revenue_at_risk=round(monthly_at_risk, 2),
        annual_revenue_at_risk=round(monthly_at_risk * 12, 2),
    )


@app.get("/customers/{customer_id}", response_model=CustomerRecord, tags=["Customers"])
def get_customer(customer_id: str):
    """Return a single pre-scored customer by their ID (row index from training data)."""
    customer = ml.get_customer_by_id(customer_id)
    if customer is None:
        raise HTTPException(
            status_code=404, detail=f"Customer '{customer_id}' not found."
        )
    return CustomerRecord(**customer)


# ---------------------------------------------------------------------------
# Live prediction
# ---------------------------------------------------------------------------

@app.post("/predict", response_model=PredictionResponse, tags=["Predict"])
def predict(customer: CustomerInput):
    """
    Score a new customer in real time.
    Applies the same feature engineering as the training notebook,
    runs the XGBoost pipeline, computes SHAP values, and returns a
    risk tier plus a rule-based retention recommendation.
    """
    # Pydantic v2 uses model_dump(); v1 uses dict()
    try:
        input_data = customer.model_dump()
    except AttributeError:
        input_data = customer.dict()

    prob, tier, top_shap = ml.predict_single(input_data)
    recommendation = ml.get_retention_recommendation(top_shap)

    return PredictionResponse(
        churn_probability=round(prob, 4),
        risk_tier=tier,
        top_shap_features=[ShapFeature(**f) for f in top_shap],
        retention_recommendation=recommendation,
    )
