from __future__ import annotations
import pandas as pd
import numpy as np
from typing import Tuple, List, Dict
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from sklearn.linear_model import LinearRegression
from .common import find_date_col, find_amount_col, find_product_col, STORE

def _coerce_ts(df: pd.DataFrame) -> Tuple[pd.Series, str]:
    date_col = find_date_col(df)
    amt_col = find_amount_col(df)
    if date_col is None or amt_col is None:
        raise ValueError("Could not detect date/amount columns. Expect columns like 'date' and 'sales'/'amount'.")
    if not pd.api.types.is_datetime64_any_dtype(df[date_col]):
        df[date_col] = pd.to_datetime(df[date_col], errors="coerce")
    ts = df.dropna(subset=[date_col, amt_col]).set_index(date_col)[amt_col].sort_index()
    # choose frequency: monthly if > 9 months, else weekly/daily
    span_days = (ts.index.max() - ts.index.min()).days if len(ts) else 0
    if span_days >= 300:
        freq = "M"
        series = ts.resample("M").sum()
    elif span_days >= 90:
        freq = "W"
        series = ts.resample("W").sum()
    else:
        freq = "D"
        series = ts.resample("D").sum()
    return series, freq

def forecast_total(df: pd.DataFrame, horizon: int) -> Tuple[List[str], List[float], str]:
    series, freq = _coerce_ts(df)
    if len(series) < 6:
        # naive mean forecast
        mean_val = float(series.mean()) if len(series) else 0.0
        idx = pd.period_range(series.index[-1].to_period(freq), periods=horizon+1, freq=freq)[1:]
        return [str(p) for p in idx], [mean_val]*horizon, freq

    seasonal = {"M": 12, "W": 52, "D": 7}.get(freq, None)
    model = ExponentialSmoothing(series, trend="add", seasonal="add" if seasonal else None, seasonal_periods=seasonal).fit()
    fc = model.forecast(horizon)
    periods = [str(pd.Period(i, freq=freq)) for i in fc.index.to_period(freq)]
    return periods, [float(x) for x in fc.values], freq

def top_products(df: pd.DataFrame, n: int = 10) -> List[Dict]:
    date_col = find_date_col(df)
    amt_col = find_amount_col(df)
    prod_col = find_product_col(df)
    if prod_col is None:
        # fallback: no product column -> return top dates (not ideal)
        series, freq = _coerce_ts(df)
        last_val = float(series.iloc[-1]) if len(series) else 0.0
        return [{"product": "ALL", "predicted_next": last_val}]

    if not pd.api.types.is_datetime64_any_dtype(df[date_col]):
        df[date_col] = pd.to_datetime(df[date_col], errors="coerce")
    # Build per-product trend using last 6 periods (resample to monthly if span big, else weekly)
    series, freq = _coerce_ts(df)
    resample_rule = {"M":"M","W":"W","D":"W"}.get(freq,"M")  # keep monthly or weekly
    items = []
    for prod, g in df.dropna(subset=[prod_col]).groupby(prod_col):
        s = g.set_index(date_col)[amt_col].sort_index().resample(resample_rule).sum()
        if len(s) < 3 or s.isna().all():
            pred = float(s.dropna().iloc[-1]) if len(s.dropna()) else 0.0
        else:
            # linear trend on last 6 points
            tail = s.tail(6).fillna(0.0)
            X = np.arange(len(tail)).reshape(-1,1)
            y = tail.values
            lr = LinearRegression().fit(X, y)
            pred = float(lr.predict(np.array([[len(tail)]]))[0])
        items.append({"product": str(prod), "predicted_next": max(0.0, pred)})
    items = sorted(items, key=lambda d: d["predicted_next"], reverse=True)[:n]
    return items
