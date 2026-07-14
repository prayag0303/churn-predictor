# Customer Churn Prediction

A full-stack churn prediction application built in three phases. The ML pipeline (Phase 1) trains an XGBoost classifier on IBM Telco Customer Churn data, evaluates it against a Logistic Regression baseline using ROC-AUC and recall-focused metrics, explains predictions with SHAP, and exports a serialized model and a pre-scored customer dataset that the REST API (Phase 2) and React dashboard (Phase 3) consume.

---

## Phase 1 — ML Pipeline

### Dataset

Download the IBM Telco Customer Churn dataset from Kaggle:
https://www.kaggle.com/datasets/blastchar/telco-customer-churn

Place the CSV at `backend/data/telco_churn.csv` (the directory is intentionally empty in this repo).

### Run

```bash
pip install -r backend/requirements.txt
jupyter notebook backend/notebooks/01_train_model.ipynb
```

Run all cells top to bottom. When complete, two files appear in `backend/model/`:
- `churn_model.pkl` — full scikit-learn pipeline (preprocessor + XGBoost)
- `customers_scored.json` — every customer pre-scored with probability, risk tier, and top SHAP features

---

## Phase 2 — REST API

### Run

```bash
cd backend
uvicorn main:app --reload
```

Swagger UI: **http://localhost:8000/docs**

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Health check |
| `GET` | `/customers` | All pre-scored customers with summary stats. Optional filters: `risk_tier`, `contract`, `min_charges`, `max_charges` |
| `GET` | `/customers/{id}` | Single customer by ID |
| `POST` | `/predict` | Score a new customer in real time |

---

## Phase 3 — Frontend Dashboard

### Run

```bash
cd frontend
npm run dev
```

App available at: **http://localhost:5173**

> Both backend (port 8000) and frontend (port 5173) must be running simultaneously.

### Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard — impact banner, filters, paginated customer table |
| `/customers/:id` | Customer detail — risk gauge, SHAP chart, retention recommendation |
| `/predict` | Live prediction form with real-time SHAP explanation |

### Features
- Dark sidebar navigation (colllapses to top nav on mobile)
- Impact banner: customers at risk, monthly/annual revenue at risk (live-updating with filters)
- Customer table with risk-tier badges, churn probability progress bars, pagination (50/page)
- Filter panel: risk tier, contract type, monthly charge range
- SVG semicircle gauge animated on mount
- SHAP horizontal bar chart (red = increases risk, green = reduces risk)
- Retention recommendation card (shown for High/Medium risk only)
- Live prediction: fill the form, get probability + SHAP + recommendation instantly
