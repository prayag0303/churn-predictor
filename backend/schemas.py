from typing import List, Literal
from pydantic import BaseModel, Field


class CustomerInput(BaseModel):
    tenure: int = Field(..., ge=0, le=72)
    MonthlyCharges: float
    TotalCharges: float
    gender: Literal["Male", "Female"]
    Partner: Literal["Yes", "No"]
    Dependents: Literal["Yes", "No"]
    PhoneService: Literal["Yes", "No"]
    MultipleLines: Literal["Yes", "No", "No phone service"]
    InternetService: Literal["DSL", "Fiber optic", "No"]
    OnlineSecurity: Literal["Yes", "No", "No internet service"]
    OnlineBackup: Literal["Yes", "No", "No internet service"]
    DeviceProtection: Literal["Yes", "No", "No internet service"]
    TechSupport: Literal["Yes", "No", "No internet service"]
    StreamingTV: Literal["Yes", "No", "No internet service"]
    StreamingMovies: Literal["Yes", "No", "No internet service"]
    Contract: Literal["Month-to-month", "One year", "Two year"]
    PaperlessBilling: Literal["Yes", "No"]
    PaymentMethod: Literal[
        "Electronic check",
        "Mailed check",
        "Bank transfer (automatic)",
        "Credit card (automatic)",
    ]


class ShapFeature(BaseModel):
    feature: str
    value: float
    direction: str


class PredictionResponse(BaseModel):
    churn_probability: float
    risk_tier: str
    top_shap_features: List[ShapFeature]
    retention_recommendation: str


class CustomerRecord(BaseModel):
    customer_id: str
    churn_probability: float
    risk_tier: str
    monthly_charges: float
    tenure: int
    contract: str
    top_shap_features: List[ShapFeature]


class CustomersResponse(BaseModel):
    customers: List[CustomerRecord]
    total_count: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    total_monthly_revenue_at_risk: float
    annual_revenue_at_risk: float
