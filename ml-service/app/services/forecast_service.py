import os
import datetime
import logging
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from app.services.stock_service import StockService
from app.services.training_service import TrainingService, MODELS_DIR, HAS_PROPHET, HAS_XGBOOST

# Load optional dependencies
if HAS_PROPHET:
    from prophet.serialize import model_from_json

logger = logging.getLogger(__name__)

class ForecastService:
    @staticmethod
    def forecast_stock(symbol: str, forecast_days: int = 30, preferred_model: str = "xgboost") -> Dict[str, Any]:
        """
        Generates a price forecast for the given stock symbol.
        Checks if a serialized model exists in `models/` first. If not found, trains and saves one dynamically.
        """
        symbol = symbol.upper()
        preferred_model = preferred_model.lower()
        
        # Check compatibility
        if preferred_model == "prophet" and not HAS_PROPHET:
            logger.warn("Prophet requested but not installed. Falling back to xgboost.")
            preferred_model = "xgboost"
        if preferred_model == "xgboost" and not HAS_XGBOOST:
            logger.warn("XGBoost requested but not installed. Falling back to ridge.")
            preferred_model = "ridge"

        model_path, meta_path = TrainingService.get_model_path(symbol, preferred_model)

        # 1. Trigger training if model files do not exist
        if not os.path.exists(model_path) or not os.path.exists(meta_path):
            logger.info(f"Pre-trained {preferred_model} model for {symbol} not found. Training model now...")
            train_res = TrainingService.train_model(symbol, preferred_model)
            if not train_res.get("success", False):
                # Fallback to on-the-fly ridge regression if training completely fails
                logger.error(f"Training failed: {train_res.get('error')}. Falling back to default on-the-fly Ridge.")
                return ForecastService._forecast_ridge_on_the_fly(symbol, forecast_days)

        # 2. Load model and meta weights from disk
        try:
            meta = joblib.load(meta_path)
            
            # Fetch latest history for context
            history = StockService.get_stock_history(symbol, period="2y", interval="1d")
            if not history or len(history) < 15:
                raise ValueError(f"Insufficient historical data to align forecast for {symbol}")
            
            df = pd.DataFrame(history)
            df["time"] = pd.to_datetime(df["time"])
            df = df.sort_values("time").reset_index(drop=True)

            historical_records = []
            for _, row in df.iterrows():
                historical_records.append({
                    "time": row["time"].strftime("%Y-%m-%d"),
                    "value": float(row["close"])
                })

            # Create future date series (Mon-Fri)
            last_date = df["time"].iloc[-1]
            future_dates = []
            current_date = last_date
            while len(future_dates) < forecast_days:
                current_date += datetime.timedelta(days=1)
                if current_date.weekday() < 5:
                    future_dates.append(current_date)

            if preferred_model == "prophet":
                # Load Prophet JSON
                with open(model_path, "r") as f:
                    model = model_from_json(f.read())
                
                # Predict
                future = model.make_future_dataframe(periods=forecast_days * 2)
                future["day"] = future["ds"].dt.dayofweek
                future = future[future["day"] < 5]
                future = future.head(len(df) + forecast_days)
                
                forecast = model.predict(future)
                future_forecast = forecast.tail(forecast_days)
                
                forecast_records = []
                for _, row in future_forecast.iterrows():
                    forecast_records.append({
                        "time": row["ds"].strftime("%Y-%m-%d"),
                        "value": round(float(row["yhat"]), 2),
                        "lower": round(float(row["yhat_lower"]), 2),
                        "upper": round(float(row["yhat_upper"]), 2)
                    })

                return {
                    "success": True,
                    "symbol": symbol,
                    "model": f"Prophet (Loaded from weights, trained {meta.get('trained_at')})",
                    "historical": historical_records[-90:],
                    "forecast": forecast_records
                }

            else:
                # Load regressor (XGBoost or Ridge)
                model = joblib.load(model_path)
                std_err = meta.get("std_err", 1.0)
                
                # Make forecasts sequentially using lag inputs
                last_features = df["close"].values[-10:].tolist()
                predictions = []
                
                for _ in range(forecast_days):
                    x_in = np.array(last_features[-10:]).reshape(1, -1)
                    pred = model.predict(x_in)[0]
                    predictions.append(float(pred))
                    last_features.append(pred)

                forecast_records = []
                for i, date in enumerate(future_dates):
                    pred_val = predictions[i]
                    # Expanding uncertainty bound
                    width = std_err * (1 + 0.12 * i)
                    forecast_records.append({
                        "time": date.strftime("%Y-%m-%d"),
                        "value": round(pred_val, 2),
                        "lower": round(pred_val - width, 2),
                        "upper": round(pred_val + width, 2)
                    })

                model_name = "XGBoost" if preferred_model == "xgboost" else "Ridge Regression"
                return {
                    "success": True,
                    "symbol": symbol,
                    "model": f"{model_name} (Loaded from weights, trained {meta.get('trained_at')})",
                    "historical": historical_records[-90:],
                    "forecast": forecast_records
                }

        except Exception as e:
            logger.error(f"Error loading and predicting pre-trained model for {symbol}: {str(e)}")
            # Fallback
            return ForecastService._forecast_ridge_on_the_fly(symbol, forecast_days)

    @staticmethod
    def _forecast_ridge_on_the_fly(symbol: str, forecast_days: int) -> Dict[str, Any]:
        """Simple on-the-fly Ridge prediction fallback if file load/training errors."""
        from sklearn.linear_model import Ridge
        logger.info(f"Using on-the-fly Ridge fallback for {symbol}")
        try:
            history = StockService.get_stock_history(symbol, period="2y", interval="1d")
            if not history or len(history) < 15:
                raise ValueError("Insufficient history")
            
            df = pd.DataFrame(history)
            df["time"] = pd.to_datetime(df["time"])
            df = df.sort_values("time").reset_index(drop=True)
            
            close_prices = df["close"].values
            dates = df["time"].values
            
            X, y = [], []
            for i in range(len(close_prices) - 10):
                X.append(close_prices[i : i + 10])
                y.append(close_prices[i + 10])
            
            model = Ridge(alpha=1.0)
            model.fit(np.array(X), np.array(y))
            
            last_features = close_prices[-10:].tolist()
            predictions = []
            
            last_date = pd.to_datetime(dates[-1])
            future_dates = []
            current_date = last_date
            while len(future_dates) < forecast_days:
                current_date += datetime.timedelta(days=1)
                if current_date.weekday() < 5:
                    future_dates.append(current_date)
            
            for _ in range(forecast_days):
                x_in = np.array(last_features[-10:]).reshape(1, -1)
                pred = model.predict(x_in)[0]
                predictions.append(float(pred))
                last_features.append(pred)
                
            residuals = y - model.predict(X)
            std_err = np.std(residuals)
            
            historical_records = [{"time": row["time"].strftime("%Y-%m-%d"), "value": float(row["close"])} for _, row in df.iterrows()]
            forecast_records = []
            for i, date in enumerate(future_dates):
                pred_val = predictions[i]
                width = std_err * (1 + 0.1 * i)
                forecast_records.append({
                    "time": date.strftime("%Y-%m-%d"),
                    "value": round(pred_val, 2),
                    "lower": round(pred_val - width, 2),
                    "upper": round(pred_val + width, 2)
                })
                
            return {
                "success": True,
                "model": "Ridge Regression (On-the-fly Fallback)",
                "historical": historical_records[-90:],
                "forecast": forecast_records
            }
        except Exception as err:
            return {
                "success": False,
                "error": str(err),
                "symbol": symbol,
                "historical": [],
                "forecast": []
            }
