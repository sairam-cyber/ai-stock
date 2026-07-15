import numpy as np
import pandas as pd
from typing import List, Dict, Any
import logging
from app.services.stock_service import StockService

logger = logging.getLogger(__name__)

class OptimizationService:
    @staticmethod
    def optimize_portfolio(symbols: List[str], risk_free_rate: float = 0.02) -> Dict[str, Any]:
        """
        Calculates optimal asset allocations using Modern Portfolio Theory (Mean-Variance / Sharpe Ratio).
        Performs a Monte Carlo simulation to find the Maximum Sharpe Ratio and Minimum Volatility portfolios.
        Returns frontier points for charting.
        """
        if not symbols or len(symbols) < 2:
            return {
                "success": False,
                "error": "At least 2 stock symbols are required for portfolio optimization."
            }

        try:
            symbols = [s.upper() for s in symbols]
            logger.info(f"Optimizing portfolio for symbols: {symbols}")

            # 1. Fetch 1 year of daily historical prices for all symbols
            price_data = {}
            for symbol in symbols:
                history = StockService.get_stock_history(symbol, period="1y", interval="1d")
                if not history or len(history) < 30:
                    raise ValueError(f"Insufficient daily price history for stock: {symbol}")
                
                # Extract close prices indexed by date
                prices = {item["time"]: item["close"] for item in history}
                price_data[symbol] = prices

            # 2. Align data in a pandas DataFrame
            df = pd.DataFrame(price_data)
            # Fill missing values if stock markets had local holidays
            df = df.ffill().bfill()
            
            # 3. Calculate daily returns
            returns_df = df.pct_change().dropna()
            
            # 4. Calculate annualized mean returns and covariance matrix
            # 252 trading days in a year
            mean_returns = returns_df.mean() * 252
            cov_matrix = returns_df.cov() * 252

            # Calculate individual stock statistics
            stock_stats = []
            for symbol in symbols:
                ann_return = float(mean_returns[symbol])
                ann_vol = float(np.sqrt(cov_matrix.loc[symbol, symbol]))
                stock_stats.append({
                    "symbol": symbol,
                    "expectedReturn": round(ann_return, 4),
                    "volatility": round(ann_vol, 4),
                    "sharpeRatio": round((ann_return - risk_free_rate) / ann_vol, 4)
                })

            # 5. Monte Carlo Simulation
            num_portfolios = 3000
            results = np.zeros((3, num_portfolios))
            weights_record = []

            # Set random seed for deterministic optimization results per run
            np.random.seed(42)

            for i in range(num_portfolios):
                weights = np.random.random(len(symbols))
                weights /= np.sum(weights)
                weights_record.append(weights)
                
                # Portfolio Return
                p_return = np.sum(mean_returns * weights)
                # Portfolio Volatility
                p_vol = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
                
                results[0, i] = p_return
                results[1, i] = p_vol
                # Sharpe Ratio
                results[2, i] = (p_return - risk_free_rate) / p_vol

            # 6. Locate optimal portfolios
            # Max Sharpe Ratio
            max_sharpe_idx = np.argmax(results[2])
            max_sharpe_return = results[0, max_sharpe_idx]
            max_sharpe_vol = results[1, max_sharpe_idx]
            max_sharpe_weights = weights_record[max_sharpe_idx]

            # Min Volatility
            min_vol_idx = np.argmin(results[1])
            min_vol_return = results[0, min_vol_idx]
            min_vol_vol = results[1, min_vol_idx]
            min_vol_weights = weights_record[min_vol_idx]

            # 7. Format optimal outputs
            max_sharpe_allocation = {symbols[j]: round(float(max_sharpe_weights[j]), 4) for j in range(len(symbols))}
            min_vol_allocation = {symbols[j]: round(float(min_vol_weights[j]), 4) for j in range(len(symbols))}

            # 8. Generate sample frontier points (subset of simulated points to keep payload lightweight)
            # Sort by volatility for easier frontier rendering
            sample_indices = np.random.choice(num_portfolios, size=250, replace=False)
            # Always include the optimal points in the scatter sample
            sample_indices = np.append(sample_indices, [max_sharpe_idx, min_vol_idx])
            sample_indices = np.unique(sample_indices)
            
            frontier_points = []
            for idx in sample_indices:
                frontier_points.append({
                    "volatility": round(float(results[1, idx]), 4),
                    "return": round(float(results[0, idx]), 4),
                    "sharpe": round(float(results[2, idx]), 4)
                })
            
            frontier_points = sorted(frontier_points, key=lambda x: x["volatility"])

            return {
                "success": True,
                "stockStats": stock_stats,
                "maxSharpe": {
                    "return": round(float(max_sharpe_return), 4),
                    "volatility": round(float(max_sharpe_vol), 4),
                    "sharpeRatio": round(float(results[2, max_sharpe_idx]), 4),
                    "allocation": max_sharpe_allocation
                },
                "minVolatility": {
                    "return": round(float(min_vol_return), 4),
                    "volatility": round(float(min_vol_vol), 4),
                    "sharpeRatio": round(float(results[2, min_vol_idx]), 4),
                    "allocation": min_vol_allocation
                },
                "efficientFrontier": frontier_points
            }

        except Exception as e:
            logger.error(f"Error executing portfolio optimization: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
