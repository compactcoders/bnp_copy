from __future__ import annotations
import pandas as pd
import numpy as np
from typing import Optional, Tuple, List
import re
from dataclasses import dataclass, field
from joblib import dump, load
from pathlib import Path

def smart_read(path: str) -> pd.DataFrame:
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"Data file not found: {p}")
    if p.suffix.lower() in {".xlsx", ".xls"}:
        return pd.read_excel(p)
    elif p.suffix.lower() in {".csv"}:
        return pd.read_csv(p)
    else:
        raise ValueError("Supported file types: .csv, .xls, .xlsx")

def find_col(df: pd.DataFrame, candidates: List[str]) -> Optional[str]:
    cols = {c.lower(): c for c in df.columns}
    for name in candidates:
        if name.lower() in cols:
            return cols[name.lower()]
    # fuzzy
    for c in df.columns:
        cl = c.lower()
        for name in candidates:
            if name.lower() in cl:
                return c
    return None

def find_date_col(df: pd.DataFrame) -> Optional[str]:
    return find_col(df, ["date","order_date","purchase_date","invoice_date","timestamp","datetime","order_dt","day"])

def find_amount_col(df: pd.DataFrame) -> Optional[str]:
    return find_col(df, ["amount","sales","revenue","price","total","order_amount","grand_total","net_sales"])

def find_customer_id_col(df: pd.DataFrame) -> Optional[str]:
    return find_col(df, ["customer_id","customerid","cust_id","client_id","user_id","customer number","customer no"])

def find_product_col(df: pd.DataFrame) -> Optional[str]:
    return find_col(df, ["product","product_name","sku","item","item_name","product_id"])

def find_churn_col(df: pd.DataFrame) -> Optional[str]:
    return find_col(df, ["churn","is_churn","churned","exited","attrited","churn_flag"])

def to_bool_series(s: pd.Series) -> pd.Series:
    # normalize common labels to 0/1
    mapping = {
        "yes":1, "y":1, "true":1, "t":1, 1:1, "1":1, "churn":1, "exited":1, "left":1,
        "no":0, "n":0, "false":0, "f":0, 0:0, "0":0, "stay":0
    }
    return s.map(lambda v: mapping.get(str(v).strip().lower(), np.nan))

@dataclass
class Store:
    df_raw: Optional[pd.DataFrame] = None
    df_sales: Optional[pd.DataFrame] = None
    df_customers: Optional[pd.DataFrame] = None

    # churn
    churn_preprocessor_path: Path = field(default=Path("app/models/churn_preprocessor.joblib"))
    churn_model_path: Path = field(default=Path("app/models/churn_model.joblib"))
    churn_features_path: Path = field(default=Path("app/models/churn_features.json"))

    # sales
    sales_cache_path: Path = field(default=Path("app/models/sales_cache.parquet"))

    def save_churn_artifacts(self, preprocessor, model, features: List[str]):
        dump(preprocessor, self.churn_preprocessor_path)
        dump(model, self.churn_model_path)
        import json
        with open(self.churn_features_path, "w", encoding="utf-8") as f:
            json.dump(features, f)

    def load_churn_artifacts(self):
        from joblib import load
        import json
        if self.churn_preprocessor_path.exists() and self.churn_model_path.exists() and self.churn_features_path.exists():
            pre = load(self.churn_preprocessor_path)
            model = load(self.churn_model_path)
            with open(self.churn_features_path, "r", encoding="utf-8") as f:
                feats = json.load(f)
            return pre, model, feats
        return None, None, None

STORE = Store()
