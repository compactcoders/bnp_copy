from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pathlib import Path
import io
import os
import pandas as pd
import joblib

# --- Import internal modules from your second app ---
from app.schemas import *
from app.config import settings
from app.services.common import STORE, smart_read
from app.services import churn as churn_svc
from app.services import sales as sales_svc

# --- Import modules from first app ---
from app.model import preprocess_data, feature_engineering, generate_forecast

# --- Initialize app ---
app = FastAPI(title="Combined Sales & CustomerMetrics API", version="1.0.0")

# --- Enable CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        settings.frontend_origin,
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Load default CSV at startup ---
try:
    default_df = pd.read_csv("your_products.csv")
except FileNotFoundError:
    default_df = pd.DataFrame()

# --- Load churn model if exists ---
try:
    churn_model = joblib.load(os.path.join(os.path.dirname(__file__), "churn_model.pkl"))
except:
    churn_model = None

# --- Helper function from first main.py ---
def process_customer_data(df: pd.DataFrame) -> list:
    processed_data = []
    for _, row in df.iterrows():
        customer = {
            "order_id": str(row.get("order_id", "")),
            "customer_id": str(row.get("customer_id", "")),
            "age": int(row.get("age", 0)),
            "gender": str(row.get("gender", "Other")),
            "product_id": str(row.get("product_id", "")),
            "country": str(row.get("country", "")),
            "signup_date": str(row.get("signup_date", "")),
            "last_purchase_date": str(row.get("last_purchase_date", "")),
            "cancellations_count": int(row.get("cancellations_count", 0)),
            "subscription_status": str(row.get("subscription_status", "Active")),
            "unit_price": float(row.get("unit_price", 0)),
            "quantity": int(row.get("quantity", 0)),
            "purchase_frequency": int(row.get("purchase_frequency", 0)),
            "product_name": str(row.get("product_name", "")),
            "category": str(row.get("category", "")),
            "ratings": float(row.get("ratings", 0)),
        }

        # Feature engineering
        customer["age_group"] = "Under 25" if customer["age"] < 25 else "25-34" if customer["age"] < 35 else "35-44" if customer["age"] < 45 else "45-59" if customer["age"] < 60 else "60+"
        customer["months_since_last_purchase"] = 0
        lifetime_value = customer["unit_price"] * customer["quantity"] * customer["purchase_frequency"]
        customer["lifetime_value"] = lifetime_value

        # Churn scoring
        churn_score = 0
        if customer["age"] < 25: churn_score += 0.1
        if customer["age"] > 60: churn_score += 0.2
        churn_score += customer["cancellations_count"] * 0.15
        churn_score += 0.2 if customer["purchase_frequency"] < 2 else 0
        churn_score += 0.25 if customer["subscription_status"] == "Inactive" else 0.5 if customer["subscription_status"] == "Cancelled" else 0
        churn_score += 0.2 if customer["ratings"] < 3 else 0.1 if customer["ratings"] < 4 else 0
        churn_score = min(max(churn_score, 0), 1)

        customer["churn_probability"] = churn_score
        customer["churn_risk"] = "High" if churn_score > 0.7 else "Medium" if churn_score > 0.4 else "Low"
        customer["promotion_eligible"] = lifetime_value > 1000 and customer["ratings"] >= 4 and customer["subscription_status"] == "Active"
        customer["retention_strategy"] = "Personalized retention offer"

        processed_data.append(customer)
    return processed_data

# ------------------- First App Routes -------------------

@app.get("/products")
def get_products():
    if default_df.empty:
        return []
    processed_df = preprocess_data(default_df)
    feature_df = feature_engineering(processed_df)
    forecast_df = generate_forecast(feature_df, forecast_days=30)
    return forecast_df.to_dict(orient="records")

@app.post("/forecast/")
async def forecast_sales(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        uploaded_df = pd.read_csv(io.StringIO(contents.decode("utf-8-sig")))
        processed_df = preprocess_data(uploaded_df)
        feature_df = feature_engineering(processed_df)
        forecast_df = generate_forecast(feature_df, forecast_days=30)
        return forecast_df.to_dict(orient="records")
    except Exception as e:
        print("Error in forecast_sales:", e)
        return {"error": str(e)}

@app.post("/upload-customers/")
async def upload_customers(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        uploaded_df = pd.read_csv(io.StringIO(contents.decode("utf-8-sig")))
        required_columns = [
            "order_id", "customer_id", "age", "gender", "product_id", "country",
            "signup_date", "last_purchase_date", "cancellations_count", "subscription_status",
            "unit_price", "quantity", "purchase_frequency", "product_name", "category", "Ratings",
            "is_churn", "churn_reason", "churn_risk_score"
        ]
        missing = [col for col in required_columns if col not in uploaded_df.columns]
        if missing:
            return {"error": f"Missing required columns: {', '.join(missing)}"}

        # Additional validation
        validation_errors = []
        # Check for empty critical fields
        critical_fields = ["customer_id", "order_id", "product_id", "signup_date", "last_purchase_date", "country"]
        for field in critical_fields:
            if field in uploaded_df.columns:
                empty_count = uploaded_df[field].isnull().sum()
                if empty_count > 0:
                    validation_errors.append(f"{field} has {empty_count} empty values")

        # Check numerical fields
        numerical_fields = ["age", "unit_price", "quantity", "purchase_frequency", "cancellations_count", "Ratings", "churn_risk_score"]
        for field in numerical_fields:
            if field in uploaded_df.columns:
                try:
                    pd.to_numeric(uploaded_df[field], errors='coerce')
                    nan_count = uploaded_df[field].isna().sum()
                    if nan_count > 0:
                        validation_errors.append(f"{field} has {nan_count} invalid numerical values")
                except:
                    validation_errors.append(f"{field} contains invalid data")

        # Check date fields
        date_fields = ["signup_date", "last_purchase_date"]
        for field in date_fields:
            if field in uploaded_df.columns:
                try:
                    pd.to_datetime(uploaded_df[field], errors='coerce')
                    invalid_count = uploaded_df[field].isna().sum()
                    if invalid_count > 0:
                        validation_errors.append(f"{field} has {invalid_count} invalid date values")
                except:
                    validation_errors.append(f"{field} contains invalid date formats")

        # Check categorical fields (case-insensitive)
        categorical_checks = {
            "gender": ["male", "female", "other"],
            "subscription_status": ["active", "inactive", "cancelled", "paused"],
            "is_churn": [0, 1, "0", "1"]
        }
        for field, expected in categorical_checks.items():
            if field in uploaded_df.columns:
                unique_vals = uploaded_df[field].dropna().unique()
                invalid = [v for v in unique_vals if str(v).lower() not in expected]
                if invalid:
                    validation_errors.append(f"{field} has unexpected values: {', '.join(map(str, invalid[:5]))}")  # Show first 5

        if validation_errors:
            return {"error": "Data validation failed: " + "; ".join(validation_errors)}

        processed_data = process_customer_data(uploaded_df)
        return {"data": processed_data}
    except Exception as e:
        print("Error in upload_customers:", e)
        return {"error": str(e)}

@app.get("/")
def root():
    return {"message": "Welcome to the Combined Sales & CustomerMetrics API."}

# ------------------- Second App Routes -------------------

@app.get("/api/health")
def health():
    return {"ok": True, "message": "up"}

@app.post("/api/data/load", response_model=dict)
def load_data(req: LoadDataRequest):
    df = smart_read(req.path)
    STORE.df_raw = df.copy()
    cust, sales = churn_svc.split_customer_sales(df)
    STORE.df_customers = cust if not cust.empty else None
    STORE.df_sales = sales if not sales.empty else None
    return {"ok": True, "rows": len(df), "columns": df.columns.tolist()}

@app.post("/api/data/upload", response_model=dict)
async def upload_data(file: UploadFile = File(...)):
    suffix = Path(file.filename).suffix.lower()
    if suffix not in {".csv",".xls",".xlsx"}:
        raise HTTPException(400, "Supported types: CSV, XLS, XLSX")
    target = Path("app/data") / file.filename
    content = await file.read()
    target.write_bytes(content)
    return {"ok": True, "saved_to": str(target)}

@app.post("/api/churn/train", response_model=TrainResponse)
def churn_train():
    if STORE.df_customers is None and STORE.df_raw is None:
        raise HTTPException(400, "No data loaded. POST /api/data/load first.")
    df = STORE.df_customers if STORE.df_customers is not None else STORE.df_raw
    scores = churn_svc.train_churn(df)
    best_model = max(scores, key=lambda k: scores[k])
    worst_model = min(scores, key=lambda k: scores[k])
    return TrainResponse(ok=True, models=scores, best_model=best_model, best_accuracy=scores[best_model], worst_accuracy=scores[worst_model])

@app.post("/api/churn/predict", response_model=PredictResponse)
def churn_predict(req: PredictRequest):
    df = pd.DataFrame(req.records)
    proba = churn_svc.churn_proba(df)
    segs = churn_svc.segments_from_proba(proba)
    out = [{"index": i, "churn_probability": float(p), "segment": s} for i, (p, s) in enumerate(zip(proba, segs))]
    return PredictResponse(ok=True, predictions=out)

@app.get("/api/churn/top", response_model=TopChurnResponse)
def churn_top(n: int = 10):
    if STORE.df_customers is None and STORE.df_raw is None:
        raise HTTPException(400, "No data loaded.")
    df = STORE.df_customers if STORE.df_customers is not None else STORE.df_raw
    top = churn_svc.build_top_churn(df, n=n)
    items = [TopChurnItem(customer_id=row["customer_id"], probability=float(row["probability"]), segment=row["segment"]) for _, row in top.iterrows()]
    return TopChurnResponse(ok=True, items=items)

@app.get("/api/churn/segments", response_model=SegmentsResponse)
def churn_segments():
    if STORE.df_customers is None and STORE.df_raw is None:
        raise HTTPException(400, "No data loaded.")
    df = STORE.df_customers if STORE.df_customers is not None else STORE.df_raw
    summary = churn_svc.churn_segments_summary(df)
    return SegmentsResponse(ok=True, by_segment=summary)

@app.get("/api/churn/trends", response_model=TrendsResponse)
def churn_trends():
    if STORE.df_customers is None and STORE.df_raw is None:
        raise HTTPException(400, "No data loaded.")
    df = STORE.df_customers if STORE.df_customers is not None else STORE.df_raw
    periods, rates = churn_svc.churn_rate_trend(df)
    return TrendsResponse(ok=True, periods=periods, churn_rate=rates)

@app.get("/api/sales/forecast", response_model=ForecastResponse)
def sales_forecast(horizon: int = 3):
    if STORE.df_sales is None and STORE.df_raw is None:
        raise HTTPException(400, "No data loaded.")
    df = STORE.df_sales if STORE.df_sales is not None else STORE.df_raw
    periods, forecast, freq = sales_svc.forecast_total(df, horizon=horizon)
    return ForecastResponse(ok=True, periods=periods, forecast=forecast, frequency=freq)

@app.get("/api/sales/top-products", response_model=TopProductsResponse)
def sales_top_products(n: int = 10):
    if STORE.df_sales is None and STORE.df_raw is None:
        raise HTTPException(400, "No data loaded.")
    df = STORE.df_sales if STORE.df_sales is not None else STORE.df_raw
    items = sales_svc.top_products(df, n=n)
    return TopProductsResponse(ok=True, items=items)

# --- Startup autoload ---
@app.on_event("startup")
def _autoload():
    # Auto-load default CSV from first app
    global default_df
    try:
        default_df = pd.read_csv("your_products.csv")
    except FileNotFoundError:
        default_df = pd.DataFrame()

    # Auto-load second app data
    if settings.default_data_path:
        p = Path(settings.default_data_path)
        if p.exists():
            try:
                df = smart_read(str(p))
                STORE.df_raw = df.copy()
                cust, sales = churn_svc.split_customer_sales(df)
                STORE.df_customers = cust if not cust.empty else None
                STORE.df_sales = sales if not sales.empty else None
                churn_svc.train_churn(STORE.df_customers if STORE.df_customers is not None else STORE.df_raw)
            except Exception as e:
                print(f"[startup] Skipped autoload: {e}")
