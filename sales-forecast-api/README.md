# Sales Forecast API

This project is a FastAPI application that provides an endpoint for forecasting sales for the next 30 days based on historical sales data. The application utilizes a trained LightGBM model to make predictions.

## Project Structure

```
sales-forecast-api
├── app
│   ├── main.py          # Entry point for the FastAPI application
│   ├── model.py         # Logic for loading the model and making predictions
│   ├── utils.py         # Utility functions for data manipulation and feature engineering
│   └── requirements.txt  # List of dependencies
├── lgbm_final_model.pkl  # Trained LightGBM model
└── README.md             # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd sales-forecast-api
   ```

2. Navigate to the `app` directory:
   ```
   cd app
   ```

3. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

## Usage

1. Start the FastAPI application:
   ```
   uvicorn main:app --reload
   ```

2. Open your browser and go to `http://127.0.0.1:8000/docs` to access the API documentation.

3. Use the `/forecast` endpoint to upload a CSV file containing historical sales data. The CSV should have the necessary columns as expected by the model.

4. The API will return the forecasted sales for the next 30 days.

## API Endpoints

- **POST /forecast**: Upload a CSV file to get sales forecasts for the next 30 days.

## Model Details

The application uses a LightGBM model trained on historical sales data. The model is designed to predict sales while minimizing worst-case errors.

## License

This project is licensed under the MIT License.