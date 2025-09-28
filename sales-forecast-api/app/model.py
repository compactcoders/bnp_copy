import pandas as pd
import numpy as np
import joblib

# Load trained LGBM model once
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # points to app/
model = joblib.load(os.path.join(BASE_DIR, "lgbm_final_model.pkl"))


def preprocess_data(data: pd.DataFrame) -> pd.DataFrame:
    data['sales'] = data['unit_price'] * data['quantity']
    data['signup_date'] = pd.to_datetime(data['signup_date'], errors='coerce')
    data['last_purchase_date'] = pd.to_datetime(data['last_purchase_date'], errors='coerce')
    data = data.dropna(subset=['last_purchase_date', 'sales'])
    data = data.sort_values(by=['product_id', 'last_purchase_date'])
    return data

def feature_engineering(data: pd.DataFrame) -> pd.DataFrame:
    feature_df = pd.DataFrame()

    for pid in data['product_id'].unique():
        product_data = data[data['product_id'] == pid].copy()

        product_data['sales_smooth'] = product_data['sales'].rolling(3, min_periods=1).mean()
        product_data['day_of_week'] = product_data['last_purchase_date'].dt.dayofweek
        product_data['month'] = product_data['last_purchase_date'].dt.month
        product_data['weekofyear'] = product_data['last_purchase_date'].dt.isocalendar().week.astype(int)

        # Lags
        for lag in [1, 2, 3, 7, 14, 30]:
            product_data[f'lag_{lag}'] = product_data['sales_smooth'].shift(lag)

        # Rolling features
        for window in [7, 14, 30]:
            product_data[f'roll_mean_{window}'] = product_data['sales_smooth'].shift(1).rolling(window).mean()
            product_data[f'roll_std_{window}'] = product_data['sales_smooth'].shift(1).rolling(window).std()

        # Diffs
        product_data['diff_1'] = product_data['sales_smooth'] - product_data['sales_smooth'].shift(1)
        product_data['diff_7'] = product_data['sales_smooth'] - product_data['sales_smooth'].shift(7)

        product_data = product_data.fillna(0)
        feature_df = pd.concat([feature_df, product_data])

    feature_df = feature_df.reset_index(drop=True)
    return feature_df

def generate_forecast(feature_df: pd.DataFrame, forecast_days: int = 30) -> pd.DataFrame:
    all_forecasts = []

    for pid in feature_df['product_id'].unique():
        product_data = feature_df[feature_df['product_id'] == pid].copy().sort_values('last_purchase_date')

        last_known_sales = product_data['sales'].tolist()
        last_dates = product_data['last_purchase_date'].tolist()

        for day in range(1, forecast_days + 1):
            future_date = last_dates[-1] + pd.Timedelta(days=1)
            last_dates.append(future_date)

            feat = {}
            feat['day_of_week'] = future_date.dayofweek
            feat['month'] = future_date.month
            feat['weekofyear'] = future_date.isocalendar()[1]

            # Lag features
            for lag in [1, 2, 3, 7, 14, 30]:
                feat[f'lag_{lag}'] = last_known_sales[-lag] if len(last_known_sales) >= lag else 0

            # Rolling stats
            for window in [7, 14, 30]:
                if len(last_known_sales) >= window:
                    roll = last_known_sales[-window:]
                    feat[f'roll_mean_{window}'] = np.mean(roll)
                    feat[f'roll_std_{window}'] = np.std(roll)
                else:
                    feat[f'roll_mean_{window}'] = 0
                    feat[f'roll_std_{window}'] = 0

            # Differences
            feat['diff_1'] = last_known_sales[-1] - last_known_sales[-2] if len(last_known_sales) > 1 else 0
            feat['diff_7'] = last_known_sales[-1] - last_known_sales[-8] if len(last_known_sales) > 7 else 0

            # Extra columns from last row
            for col in ['age', 'unit_price', 'quantity', 'purchase_frequency', 'cancellations_count', 'Ratings']:
                feat[col] = product_data[col].iloc[-1] if col in product_data.columns else 0

            feat_df = pd.DataFrame([feat])

            # Predict
            pred_log = model.predict(feat_df)[0]
            pred_sales = np.expm1(pred_log)

            # Clip extreme values
            min_sales, max_sales = 0, product_data['sales'].max() * 1.5
            pred_sales = np.clip(pred_sales, min_sales, max_sales)

            last_known_sales.append(pred_sales)

            all_forecasts.append({
                'product_id': pid,
                'date': str(future_date.date()),
                'predicted_sales': float(pred_sales)
            })

    return pd.DataFrame(all_forecasts)
