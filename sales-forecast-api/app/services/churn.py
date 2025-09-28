from __future__ import annotations
import pandas as pd
import numpy as np
from typing import Dict, Tuple, List
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from .common import STORE, find_churn_col, find_customer_id_col

def split_customer_sales(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
    # naive split: if there is a churn column we treat it as customer-level table
    churn_col = find_churn_col(df)
    if churn_col is not None:
        df_customers = df.copy()
        # if there is a date+amount too, we keep a sales subset as well
        # but a better approach is to provide separate files
        df_sales = pd.DataFrame()
    else:
        df_customers = pd.DataFrame()
        df_sales = df.copy()
    return df_customers, df_sales

def _prepare_xy(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series, List[str]]:
    churn_col = find_churn_col(df)
    if churn_col is None:
        raise ValueError("Could not detect a churn target column. Expect a column named like 'Churn'/'Exited'/'is_churn'.")
    y_raw = df[churn_col]
    # normalize y
    from .common import to_bool_series
    y = to_bool_series(y_raw)
    if y.isna().any():
        # If still NaNs, try to coerce numeric then drop NaNs
        y = pd.to_numeric(y_raw, errors="coerce")
    mask = ~y.isna()
    df = df.loc[mask].copy()
    y = y.loc[mask].astype(int)

    # drop target column
    X = df.drop(columns=[churn_col])
    # choose features: drop leakage obvious ids
    # keep all others; types will be handled by ColumnTransformer
    features = list(X.columns)
    return X, y, features

def _build_preprocessor(X: pd.DataFrame) -> Tuple[ColumnTransformer, List[str], List[str]]:
    numeric_cols = [c for c in X.columns if pd.api.types.is_numeric_dtype(X[c])]
    cat_cols = [c for c in X.columns if c not in numeric_cols]
    num_pipe = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])
    cat_pipe = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])
    pre = ColumnTransformer([
        ("num", num_pipe, numeric_cols),
        ("cat", cat_pipe, cat_cols)
    ])
    return pre, numeric_cols, cat_cols

def train_churn(df: pd.DataFrame, test_size: float = 0.2, random_state: int = 42) -> Dict[str, float]:
    X, y, features = _prepare_xy(df)
    pre, num_cols, cat_cols = _build_preprocessor(X)

    # Define candidate models
    candidates = {
        "logreg": LogisticRegression(max_iter=200, class_weight="balanced"),
        "rf": RandomForestClassifier(n_estimators=300, random_state=random_state, class_weight="balanced_subsample"),
        "gb": GradientBoostingClassifier(random_state=random_state),
    }

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=random_state, stratify=y)
    scores = {}
    best_name, best_score, best_pipe = None, -1.0, None

    for name, model in candidates.items():
        pipe = Pipeline([("pre", pre), ("clf", model)])
        pipe.fit(X_train, y_train)
        preds = pipe.predict(X_test)
        acc = accuracy_score(y_test, preds)
        scores[name] = round(float(acc) * 100.0, 2)  # as percentage
        if acc > best_score:
            best_score = acc
            best_name = name
            best_pipe = pipe

    # Persist best
    # Extract fitted preprocessor from pipe
    fitted_pre = best_pipe.named_steps["pre"]
    from .common import STORE
    STORE.save_churn_artifacts(fitted_pre, best_pipe.named_steps["clf"], features)
    return scores

def churn_proba(df_records: pd.DataFrame) -> np.ndarray:
    pre, model, features = STORE.load_churn_artifacts()
    if pre is None or model is None:
        raise RuntimeError("Churn model not trained yet. POST /api/churn/train first.")
    # align columns
    for f in features:
        if f not in df_records.columns:
            df_records[f] = np.nan
    X = df_records[features]
    # Build a new pipeline just for transform+predict
    from sklearn.pipeline import Pipeline
    pipe = Pipeline([("pre", pre), ("clf", model)])
    proba = pipe.predict_proba(X)[:, 1]
    return proba

def segments_from_proba(p: np.ndarray) -> List[str]:
    seg = []
    for val in p:
        if val >= 0.66:
            seg.append("High")
        elif val >= 0.33:
            seg.append("Medium")
        else:
            seg.append("Low")
    return seg

def build_top_churn(df: pd.DataFrame, n: int = 10) -> pd.DataFrame:
    probs = churn_proba(df.copy())
    segs = segments_from_proba(probs)
    df_out = df.copy()
    df_out["_churn_proba"] = probs
    df_out["_segment"] = segs
    cust_col = find_customer_id_col(df_out)
    # Ensure we return at least some id
    if cust_col is None:
        df_out["_customer_id"] = np.arange(len(df_out))
        cust_col = "_customer_id"
    top = df_out[[cust_col, "_churn_proba", "_segment"]].sort_values("_churn_proba", ascending=False).head(n)
    top = top.rename(columns={cust_col: "customer_id", "_churn_proba": "probability", "_segment": "segment"})
    return top

def churn_segments_summary(df: pd.DataFrame) -> Dict[str, int]:
    p = churn_proba(df.copy())
    segs = segments_from_proba(p)
    from collections import Counter
    return dict(Counter(segs))

def churn_rate_trend(df: pd.DataFrame) -> tuple[list[str], list[float]]:
    churn_col = find_churn_col(df)
    if churn_col is None:
        raise ValueError("Churn target column not found for trends.")
    # build a period column if date exists
    date_col = None
    for c in df.columns:
        if "date" in c.lower() or "time" in c.lower():
            date_col = c
            break
    if date_col and not pd.api.types.is_datetime64_any_dtype(df[date_col]):
        df[date_col] = pd.to_datetime(df[date_col], errors="coerce")
    if date_col is None or df[date_col].isna().all():
        # No dates; return overall churn rate only
        y = df[churn_col]
        from .common import to_bool_series
        yb = to_bool_series(y)
        rate = float(yb.mean())
        return ["overall"], [round(rate * 100.0, 2)]
    # With dates: monthly churn rate
    df["_ym"] = df[date_col].dt.to_period("M").astype(str)
    from .common import to_bool_series
    yb = to_bool_series(df[churn_col])
    grp = df.groupby("_ym")
    periods = []
    rates = []
    for k, g in grp:
        yb_g = to_bool_series(g[churn_col])
        if len(yb_g) == 0:
            continue
        periods.append(k)
        rates.append(round(float(yb_g.mean()) * 100.0, 2))
    return periods, rates
