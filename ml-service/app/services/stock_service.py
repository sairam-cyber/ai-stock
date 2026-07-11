import yfinance as yf
import pandas as pd
from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger(__name__)

class StockService:
    @staticmethod
    def get_stock_history(symbol: str, period: str = "1y", interval: str = "1d") -> List[Dict[str, Any]]:
        """
        Fetch historical stock data using yfinance.
        Periods: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max
        Intervals: 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo
        """
        try:
            logger.info(f"Fetching history for {symbol} (period={period}, interval={interval})")
            ticker = yf.Ticker(symbol)
            df = ticker.history(period=period, interval=interval)
            
            if df.empty:
                logger.warning(f"No history found for {symbol}")
                return []
            
            # Reset index to get dates as a column
            df = df.reset_index()
            
            # Format datetime
            if "Date" in df.columns:
                date_col = "Date"
            elif "Datetime" in df.columns:
                date_col = "Datetime"
            else:
                date_col = df.columns[0]
                
            history = []
            for _, row in df.iterrows():
                # Format time depending on daily vs intraday
                time_val = row[date_col]
                if isinstance(time_val, pd.Timestamp):
                    if interval in ["1d", "5d", "1wk", "1mo", "3mo"]:
                        time_str = time_val.strftime("%Y-%m-%d")
                    else:
                        time_str = time_val.isoformat()
                else:
                    time_str = str(time_val)
                    
                history.append({
                    "time": time_str,
                    "open": float(row["Open"]),
                    "high": float(row["High"]),
                    "low": float(row["Low"]),
                    "close": float(row["Close"]),
                    "volume": int(row["Volume"])
                })
            
            return history
        except Exception as e:
            logger.error(f"Error fetching history for {symbol}: {str(e)}")
            return []

    @staticmethod
    def get_stock_summary(symbol: str) -> Dict[str, Any]:
        """
        Fetch financial summary metrics for a stock symbol from yfinance.
        """
        try:
            logger.info(f"Fetching summary for {symbol}")
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            # Helper to safely fetch info values
            def get_val(key: str, default: Any = "N/A") -> Any:
                val = info.get(key)
                if val is None or val == "":
                    return default
                return val

            # Format large numbers to human-readable strings (e.g. 3.08T, 790.2B)
            def format_large_num(num: Any) -> str:
                if not isinstance(num, (int, float)):
                    return "N/A"
                if num >= 1e12:
                    return f"{num / 1e12:.2f}T"
                elif num >= 1e9:
                    return f"{num / 1e9:.2f}B"
                elif num >= 1e6:
                    return f"{num / 1e6:.2f}M"
                return str(num)

            market_cap = get_val("marketCap")
            volume = get_val("volume")
            avg_volume = get_val("averageVolume")
            
            # Formulate the response
            summary = {
                "symbol": symbol.upper(),
                "name": get_val("longName", get_val("shortName", symbol.upper())),
                "price": float(get_val("currentPrice", get_val("regularMarketPrice", 0.0))),
                "changeValue": float(get_val("currentPrice", 0.0) - get_val("previousClose", 0.0)) if info.get("currentPrice") and info.get("previousClose") else 0.0,
                "change": float(((get_val("currentPrice", 0.0) - get_val("previousClose", 0.0)) / get_val("previousClose", 1.0)) * 100) if info.get("currentPrice") and info.get("previousClose") else 0.0,
                "cap": format_large_num(market_cap),
                "pe": str(get_val("trailingPE", "N/A")),
                "eps": f"${get_val('trailingEps', 'N/A')}" if get_val('trailingEps') != "N/A" else "N/A",
                "vol": format_large_num(volume),
                "avgVol": format_large_num(avg_volume),
                "range": f"${get_val('fiftyTwoWeekLow', 'N/A')} - ${get_val('fiftyTwoWeekHigh', 'N/A')}" if get_val('fiftyTwoWeekLow') != "N/A" else "N/A",
                "yield": f"{float(get_val('dividendYield', 0.0)) * 100:.2f}%" if get_val('dividendYield') != "N/A" and get_val('dividendYield') != 0.0 else "N/A",
                "sector": get_val("sector"),
                "industry": get_val("industry"),
                "summary": get_val("longBusinessSummary", "")
            }
            return summary
        except Exception as e:
            logger.error(f"Error fetching summary for {symbol}: {str(e)}")
            # Return basic defaults if fails
            return {
                "symbol": symbol.upper(),
                "name": symbol.upper(),
                "price": 0.0,
                "changeValue": 0.0,
                "change": 0.0,
                "cap": "N/A",
                "pe": "N/A",
                "eps": "N/A",
                "vol": "N/A",
                "avgVol": "N/A",
                "range": "N/A",
                "yield": "N/A",
                "sector": "N/A",
                "industry": "N/A",
                "summary": "Financial details currently unavailable."
            }
