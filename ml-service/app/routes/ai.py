from fastapi import APIRouter, Query, HTTPException, Body
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from app.services.ai_service import AIService

router = APIRouter(prefix="/api/ai", tags=["ai"])

class ChatRequest(BaseModel):
    symbol: str
    query: str
    chat_history: Optional[List[Dict[str, str]]] = []

@router.post("/chat")
async def chat_assistant(payload: ChatRequest = Body(...)):
    """
    Interact with the AI assistant for a stock, including conversation context.
    """
    if not payload.symbol or not payload.query:
        raise HTTPException(status_code=400, detail="Symbol and query are required parameters")
        
    response_text = AIService.generate_chat_response(
        payload.symbol.upper(),
        payload.query,
        payload.chat_history
    )
    
    return {"success": True, "response": response_text}

@router.get("/sentiment")
async def get_sentiment(
    symbol: str = Query(..., description="Stock symbol (e.g. AAPL)")
):
    """
    Retrieve real-time market sentiment analysis based on recent headlines.
    """
    if not symbol:
        raise HTTPException(status_code=400, detail="Symbol parameter is required")
        
    sentiment = AIService.get_market_sentiment(symbol.upper())
    return {"success": True, "symbol": symbol.upper(), "data": sentiment}

@router.get("/insights")
async def get_insights(
    symbol: str = Query(..., description="Stock symbol (e.g. AAPL)")
):
    """
    Retrieve 3 detailed AI insights (Bullish/Bearish/Opportunity) for a stock.
    """
    if not symbol:
        raise HTTPException(status_code=400, detail="Symbol parameter is required")
        
    insights = AIService.generate_insights(symbol.upper())
    return {"success": True, "symbol": symbol.upper(), "data": insights}
