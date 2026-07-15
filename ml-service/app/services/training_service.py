# Live model packages verification
import os
import datetime
import logging
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from app.services.stock_service import StockService

# Try imports
HAS_PROPHET = False
try:
    from prophet import Prophet
    from prophet.serialize import model_to_json, model_from_json
    HAS_PROPHET = True
except ImportError:
    pass

HAS_XGBOOST = False
try:
    import xgboost as xgb
    HAS_XGBOOST = True
except ImportError:
    pass

logger = logging.getLogger(__name__)
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "models")

class TrainingService:
    @staticmethod
    def get_model_path(symbol: str, model_type: str) -> Tuple[str, str]:
        """Get file paths for model and its metadata."""
        os.makedirs(MODELS_DIR, exist_ok=True)
        sanitized_symbol = symbol.upper()
        model_file = f"{sanitized_symbol}_{model_type}.joblib" if model_type != "prophet" else f"{sanitized_symbol}_prophet.json"
        meta_file = f"{sanitized_symbol}_{model_type}_meta.joblib"
        return os.path.join(MODELS_DIR, model_file), os.path.join(MODELS_DIR, meta_file)

    @staticmethod
    def prepare_lag_features(df: pd.DataFrame, n_lags: int = 10) -> Tuple[np.ndarray, np.ndarray]:
        """Helper to create lag features from historical close prices."""
        close_prices = df["close"].values
        X, y = [], []
        for i in range(len(close_prices) - n_lags):
            X.append(close_prices[i : i + n_lags])
            y.append(close_prices[i + n_lags])
        return np.array(X), np.array(y)

    @staticmethod
    def train_model(symbol: str, model_type: str = "xgboost") -> Dict[str, Any]:
        """
        Train a model on historical stock prices and serialize its weights to disk.
        Supported types: 'xgboost', 'prophet', 'ridge'
        """
        model_type = model_type.lower()
        symbol = symbol.upper()
        
        try:
            logger.info(f"Training started for {symbol} using {model_type}")
            # Fetch 2 years of daily data
            history = StockService.get_stock_history(symbol, period="2y", interval="1d")
            if not history or len(history) < 20:
                raise ValueError(f"Insufficient historical data (requires at least 20 daily bars) for {symbol}")
            
            df = pd.DataFrame(history)
            df["time"] = pd.to_datetime(df["time"])
            df = df.sort_values("time").reset_index(drop=True)
            
            model_path, meta_path = TrainingService.get_model_path(symbol, model_type)
            start_time = datetime.datetime.now()

            if model_type == "prophet":
                if not HAS_PROPHET:
                    raise ImportError("Facebook Prophet is not installed on this system.")
                
                # Fit Prophet
                prophet_df = df[["time", "close"]].rename(columns={"time": "ds", "close": "y"})
                model = Prophet(
                    daily_seasonality=False,
                    weekly_seasonality=True,
                    yearly_seasonality=True,
                    interval_width=0.95
                )
                model.fit(prophet_df)
                
                # Calculate metrics (mean absolute percentage error on training data)
                forecasts = model.predict(prophet_df)
                mape = float(np.mean(np.abs((prophet_df["y"] - forecasts["yhat"]) / prophet_df["y"])) * 100)
                
                # Save model as JSON
                with open(model_path, "w") as f:
                    f.write(model_to_json(model))
                
                # Save metadata
                meta = {
                    "symbol": symbol,
                    "model_type": "prophet",
                    "trained_at": datetime.datetime.now().isoformat(),
                    "mape": mape,
                    "last_price": float(df["close"].iloc[-1]),
                    "last_date": df["time"].iloc[-1].strftime("%Y-%m-%d")
                }
                joblib.dump(meta, meta_path)

            elif model_type == "xgboost":
                if not HAS_XGBOOST:
                    raise ImportError("XGBoost is not installed on this system.")
                
                X, y = TrainingService.prepare_lag_features(df, n_lags=10)
                
                # Train XGBoost Regressor
                model = xgb.XGBRegressor(
                    n_estimators=120,
                    max_depth=4,
                    learning_rate=0.07,
                    random_state=42
                )
                model.fit(X, y)
                
                # Evaluate residuals
                predictions = model.predict(X)
                residuals = y - predictions
                std_err = float(np.std(residuals))
                mae = float(np.mean(np.abs(residuals)))
                
                # Save weights and metadata
                joblib.dump(model, model_path)
                meta = {
                    "symbol": symbol,
                    "model_type": "xgboost",
                    "trained_at": datetime.datetime.now().isoformat(),
                    "std_err": std_err,
                    "mae": mae,
                    "last_features": df["close"].values[-10:].tolist(),
                    "last_price": float(df["close"].iloc[-1]),
                    "last_date": df["time"].iloc[-1].strftime("%Y-%m-%d")
                }
                joblib.dump(meta, meta_path)
                
            else:  # Ridge Regression (fallback/standard)
                from sklearn.linear_model import Ridge
                X, y = TrainingService.prepare_lag_features(df, n_lags=10)
                
                model = Ridge(alpha=1.5)
                model.fit(X, y)
                
                predictions = model.predict(X)
                residuals = y - predictions
                std_err = float(np.std(residuals))
                mae = float(np.mean(np.abs(residuals)))
                
                joblib.dump(model, model_path)
                meta = {
                    "symbol": symbol,
                    "model_type": "ridge",
                    "trained_at": datetime.datetime.now().isoformat(),
                    "std_err": std_err,
                    "mae": mae,
                    "last_features": df["close"].values[-10:].tolist(),
                    "last_price": float(df["close"].iloc[-1]),
                    "last_date": df["time"].iloc[-1].strftime("%Y-%m-%d")
                }
                joblib.dump(meta, meta_path)

            end_time = datetime.datetime.now()
            duration = (end_time - start_time).total_seconds()
            
            logger.info(f"Model trained successfully for {symbol} in {duration:.2f}s")
            return {
                "success": True,
                "symbol": symbol,
                "model_type": model_type,
                "trained_at": meta.get("trained_at"),
                "duration_seconds": round(duration, 2),
                "metrics": {
                    "mae": meta.get("mae", 0.0) if model_type != "prophet" else None,
                    "mape_percent": meta.get("mape", 0.0) if model_type == "prophet" else None,
                    "std_err": meta.get("std_err", 0.0) if model_type != "prophet" else None
                }
            }

        except Exception as e:
            logger.error(f"Failed training {model_type} for {symbol}: {str(e)}")
            return {
                "success": False,
                "symbol": symbol,
                "model_type": model_type,
                "error": str(e)
            }
