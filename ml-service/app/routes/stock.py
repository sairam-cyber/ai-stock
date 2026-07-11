from fastapi import APIRouter, Query, HTTPException
from typing import Dict, Any, List
from app.services.stock_service import StockService
from app.services.forecast_service import ForecastService

router = APIRouter(prefix="/api/stock", tags=["stocks"])

@router.get("/history")
async def get_history(
    symbol: str = Query(..., description="Stock symbol (e.g. AAPL)"),
    period: str = Query("1y", description="Time period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y)"),
    interval: str = Query("1d", description="Data interval (1m, 5m, 15m, 1h, 1d, 1wk)")
):
    """
    Fetch historical stock price data for charting.
    """
    if not symbol:
        raise HTTPException(status_code=400, detail="Symbol parameter is required")
        
    data = StockService.get_stock_history(symbol.upper(), period, interval)
    if not data:
        raise HTTPException(status_code=404, detail=f"Stock data not found for symbol {symbol}")
        
    return {"success": True, "symbol": symbol.upper(), "data": data}

@router.get("/summary")
async def get_summary(
    symbol: str = Query(..., description="Stock symbol (e.g. AAPL)")
):
    """
    Fetch financial indicators and info for a stock.
    """
    if not symbol:
        raise HTTPException(status_code=400, detail="Symbol parameter is required")
        
    data = StockService.get_stock_summary(symbol.upper())
    return {"success": True, "data": data}

@router.get("/forecast")
async def get_forecast(
    symbol: str = Query(..., description="Stock symbol (e.g. AAPL)"),
    days: int = Query(30, ge=1, le=90, description="Number of days to forecast")
):
    """
    Generate stock price predictions for the next N days.
    """
    if not symbol:
        raise HTTPException(status_code=400, detail="Symbol parameter is required")
        
    res = ForecastService.forecast_stock(symbol.upper(), days)
    if not res.get("success", False):
        raise HTTPException(status_code=500, detail=res.get("error", "Error generating forecast"))
        
    return res
