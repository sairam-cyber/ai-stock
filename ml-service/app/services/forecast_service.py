import datetime
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
import logging
from app.services.stock_service import StockService

# Setup logger
logger = logging.getLogger(__name__)

# Try to import Prophet, fallback to scikit-learn if not installed/configured properly
HAS_PROPHET = False
try:
    from prophet import Prophet
    HAS_PROPHET = True
    # Suppress cmdstanpy / prophet logs to keep console clean
    logging.getLogger("prophet").setLevel(logging.ERROR)
    logging.getLogger("cmdstanpy").setLevel(logging.ERROR)
except ImportError:
    logger.warning("Prophet not found. Falling back to Scikit-learn for forecasting.")

from sklearn.linear_model import Ridge
from sklearn.preprocessing import MinMaxScaler

class ForecastService:
    @staticmethod
    def forecast_stock(symbol: str, forecast_days: int = 30) -> Dict[str, Any]:
        """
        Generates a price forecast for the given stock symbol.
        Uses Facebook Prophet if available, otherwise falls back to a Scikit-learn Ridge regression model.
        """
        try:
            # Fetch 2 years of daily history
            history = StockService.get_stock_history(symbol, period="2y", interval="1d")
            if not history or len(history) < 15:
                raise ValueError(f"Not enough historical data to generate forecast for {symbol}")

            df = pd.DataFrame(history)
            df["time"] = pd.to_datetime(df["time"])
            
            # Sort by time
            df = df.sort_values("time").reset_index(drop=True)

            if HAS_PROPHET:
                return ForecastService._forecast_prophet(df, forecast_days)
            else:
                return ForecastService._forecast_sklearn(df, forecast_days)

        except Exception as e:
            logger.error(f"Forecasting error for {symbol}: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "symbol": symbol,
                "historical": [],
                "forecast": [],
                "model": "None"
            }

    @staticmethod
    def _forecast_prophet(df: pd.DataFrame, forecast_days: int) -> Dict[str, Any]:
        """
        Generate time series forecast using Prophet.
        """
        # Prophet expects columns 'ds' (datetimes) and 'y' (values)
        prophet_df = df[["time", "close"]].rename(columns={"time": "ds", "close": "y"})
        
        # Fit Prophet model
        model = Prophet(
            daily_seasonality=False,
            weekly_seasonality=True,
            yearly_seasonality=True,
            interval_width=0.95 # 95% confidence intervals
        )
        model.fit(prophet_df)
        
        # Create future dataframe (excluding weekends since stock markets are closed)
        future = model.make_future_dataframe(periods=forecast_days * 2) # Generate extra to filter down to trading days
        future["day"] = future["ds"].dt.dayofweek
        future = future[future["day"] < 5] # Keep Mon-Fri
        future = future.head(len(prophet_df) + forecast_days)
        
        # Predict
        forecast = model.predict(future)
        
        # Extract results
        historical_records = []
        for _, row in df.iterrows():
            historical_records.append({
                "time": row["time"].strftime("%Y-%m-%d"),
                "value": float(row["close"])
            })

        forecast_records = []
        # Filter for rows in the future
        future_forecast = forecast.tail(forecast_days)
        for _, row in future_forecast.iterrows():
            forecast_records.append({
                "time": row["ds"].strftime("%Y-%m-%d"),
                "value": round(float(row["yhat"]), 2),
                "lower": round(float(row["yhat_lower"]), 2),
                "upper": round(float(row["yhat_upper"]), 2)
            })

        return {
            "success": True,
            "symbol": df.name if hasattr(df, "name") else "",
            "model": "Prophet",
            "historical": historical_records[-90:], # Return last 90 days of history for context
            "forecast": forecast_records
        }

    @staticmethod
    def _forecast_sklearn(df: pd.DataFrame, forecast_days: int) -> Dict[str, Any]:
        """
        Fallback time series forecasting using Scikit-Learn Ridge Regression with lag features.
        """
        logger.info("Using Scikit-learn Ridge model for stock forecasting")
        
        # Feature Engineering: Lags & Rolling Averages
        close_prices = df["close"].values
        dates = df["time"].values
        
        n_features = 10 # Number of days of lag to use as features
        X, y = [], []
        
        for i in range(len(close_prices) - n_features):
            X.append(close_prices[i : i + n_features])
            y.append(close_prices[i + n_features])
            
        X = np.array(X)
        y = np.array(y)
        
        # Train Ridge Regression Model
        model = Ridge(alpha=1.0)
        model.fit(X, y)
        
        # Generate predictions sequentially
        last_features = close_prices[-n_features:].tolist()
        predictions = []
        
        # Generate future dates (Mon-Fri)
        last_date = pd.to_datetime(dates[-1])
        future_dates = []
        current_date = last_date
        
        while len(future_dates) < forecast_days:
            current_date += datetime.timedelta(days=1)
            if current_date.weekday() < 5: # Monday is 0, Friday is 4
                future_dates.append(current_date)
        
        # Predict prices step-by-step
        for _ in range(forecast_days):
            x_in = np.array(last_features[-n_features:]).reshape(1, -1)
            pred = model.predict(x_in)[0]
            predictions.append(float(pred))
            last_features.append(pred)
            
        # Calculate a simple variance/confidence bound based on training residuals
        residuals = y - model.predict(X)
        std_err = np.std(residuals)
        
        historical_records = []
        for _, row in df.iterrows():
            historical_records.append({
                "time": row["time"].strftime("%Y-%m-%d"),
                "value": float(row["close"])
            })

        forecast_records = []
        for i, date in enumerate(future_dates):
            pred_val = predictions[i]
            # Simple expanding confidence interval
            width = std_err * (1 + 0.1 * i)
            forecast_records.append({
                "time": date.strftime("%Y-%m-%d"),
                "value": round(pred_val, 2),
                "lower": round(pred_val - width, 2),
                "upper": round(pred_val + width, 2)
            })

        return {
            "success": True,
            "model": "Ridge Regression (Lag-10)",
            "historical": historical_records[-90:], # Return last 90 days
            "forecast": forecast_records
        }
