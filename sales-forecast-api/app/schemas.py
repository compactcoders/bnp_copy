from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class LoadDataRequest(BaseModel):
    path: str = Field(..., description="Path to CSV/XLS/XLSX file")

class TrainResponse(BaseModel):
    ok: bool
    models: Dict[str, float]  # model_name -> accuracy
    best_model: str
    best_accuracy: float
    worst_accuracy: float

class PredictRequest(BaseModel):
    records: List[Dict[str, Any]]

class PredictResponse(BaseModel):
    ok: bool
    predictions: List[Dict[str, Any]]

class TopChurnItem(BaseModel):
    customer_id: str | int | None
    probability: float
    segment: str

class TopChurnResponse(BaseModel):
    ok: bool
    items: List[TopChurnItem]

class SegmentsResponse(BaseModel):
    ok: bool
    by_segment: Dict[str, int]

class TrendsResponse(BaseModel):
    ok: bool
    periods: List[str]
    churn_rate: List[float]

class ForecastResponse(BaseModel):
    ok: bool
    frequency: str
    periods: List[str]
    forecast: List[float]

class TopProductsResponse(BaseModel):
    ok: bool
    items: List[Dict[str, Any]]
