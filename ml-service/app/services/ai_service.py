import os
import logging
from typing import Dict, Any, List, Optional
import google.generativeai as genai
from app.services.stock_service import StockService
import json

logger = logging.getLogger(__name__)

# Initialize Google Generative AI
api_key = os.getenv("GOOGLE_AI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if api_key and api_key != "your-google-ai-api-key":
    try:
        genai.configure(api_key=api_key)
        logger.info("✅ Gemini AI successfully configured")
    except Exception as e:
        logger.error(f"❌ Failed to configure Gemini: {str(e)}")
        api_key = None
else:
    logger.warning("⚠️ GOOGLE_AI_API_KEY not found or is default. Running in Mock/Demo mode for AI features.")
    api_key = None

class AIService:
    @staticmethod
    def _get_gemini_model():
        """Retrieve the Gemini model if configured."""
        if api_key:
            return genai.GenerativeModel("gemini-1.5-flash")
        return None

    @staticmethod
    def generate_chat_response(symbol: str, query: str, chat_history: List[Dict[str, str]] = []) -> str:
        """
        Generate an AI answer for user queries about a specific stock.
        Injects real-time financial stats from StockService to prevent hallucinations.
        """
        try:
            # 1. Fetch stock context
            summary = StockService.get_stock_summary(symbol)
            
            context_prompt = (
                f"You are a Senior Financial Analyst and AI Assistant for the AI Stock Platform.\n"
                f"You are discussing the stock symbol: {symbol} ({summary['name']}).\n"
                f"Here are the current real-time financial indicators for {symbol}:\n"
                f"- Current Price: ${summary['price']:.2f}\n"
                f"- Change today: {summary['changeValue']:.2f} ({summary['change']:.2f}%)\n"
                f"- Market Capitalization: {summary['cap']}\n"
                f"- P/E Ratio: {summary['pe']}\n"
                f"- EPS: {summary['eps']}\n"
                f"- Today's Volume: {summary['vol']} (Average Vol: {summary['avgVol']})\n"
                f"- 52-Week Range: {summary['range']}\n"
                f"- Dividend Yield: {summary['yield']}\n"
                f"- Sector: {summary['sector']} | Industry: {summary['industry']}\n"
                f"- Profile summary: {summary['summary'][:600]}...\n\n"
                f"Instructions:\n"
                f"1. Ground your answers using the data provided above.\n"
                f"2. Be concise, professional, and insight-driven.\n"
                f"3. Do not give direct, definitive financial advice; use terms like 'our analysis suggests' or 'technical indicators show'.\n"
            )

            # Build full message prompt
            history_text = ""
            for msg in chat_history:
                role = "User" if msg.get("role") == "user" else "AI"
                history_text += f"{role}: {msg.get('content')}\n"

            full_prompt = f"{context_prompt}\n{history_text}User: {query}\nAI:"

            model = AIService._get_gemini_model()
            if model:
                response = model.generate_content(full_prompt)
                return response.text.strip()
            else:
                return AIService._mock_chat_response(symbol, query, summary)

        except Exception as e:
            logger.error(f"Error generating chat response: {str(e)}")
            return f"I'm sorry, I encountered an issue analyzing {symbol} details right now. Please try again shortly."

    @staticmethod
    def get_market_sentiment(symbol: str) -> Dict[str, Any]:
        """
        Perform sentiment analysis for a stock based on recent news headlines.
        """
        try:
            # yfinance returns recent news list
            ticker = genai.configure(api_key=api_key) if api_key else None
            yf_ticker = yf_ticker = StockService.get_stock_summary(symbol) # just validating ticker
            import yfinance as yf
            t = yf.Ticker(symbol)
            news = t.news or []
            
            headlines = [n.get("title") for n in news[:8] if n.get("title")]
            
            if not headlines:
                # Fallback to simulated sentiment if no news found
                return AIService._mock_sentiment(symbol)
                
            prompt = (
                f"Analyze the market sentiment for {symbol} based on these recent headlines:\n"
                + "\n".join([f"- {h}" for h in headlines]) + "\n\n"
                f"Respond with a JSON object containing:\n"
                f"- 'score': an integer from 0 to 100 (where 0 is extremely bearish, 50 is neutral, and 100 is extremely bullish)\n"
                f"- 'label': 'Bullish', 'Bearish', or 'Neutral'\n"
                f"- 'summary': a 1-sentence explanation of why the sentiment is scored this way.\n"
                f"Return ONLY the raw JSON string, do not wrap it in markdown code blocks."
            )

            model = AIService._get_gemini_model()
            if model:
                response = model.generate_content(prompt)
                res_text = response.text.strip()
                # Clean markdown wrapper if model returns it
                if res_text.startswith("```"):
                    res_text = res_text.split("```")[1]
                    if res_text.startswith("json"):
                        res_text = res_text[4:]
                sentiment_data = json.loads(res_text.strip())
                sentiment_data["headlines_analyzed"] = len(headlines)
                return sentiment_data
            else:
                return AIService._mock_sentiment(symbol, headlines)
                
        except Exception as e:
            logger.error(f"Error calculating sentiment for {symbol}: {str(e)}")
            return AIService._mock_sentiment(symbol)

    @staticmethod
    def generate_insights(symbol: str) -> List[Dict[str, Any]]:
        """
        Generate 3 high-quality insights (Bullish, Bearish, Opportunity) for the AI Insights Panel.
        """
        try:
            summary = StockService.get_stock_summary(symbol)
            prompt = (
                f"Generate exactly 3 actionable stock market insights for {symbol} ({summary['name']}).\n"
                f"Current stats: Price ${summary['price']}, Change {summary['change']}%.\n"
                f"Sector: {summary['sector']}.\n\n"
                f"Return a JSON list containing exactly 3 objects. Each object must have:\n"
                f"- 'type': one of 'bullish', 'risk', or 'opportunity'\n"
                f"- 'title': a brief, punchy headline (5-7 words)\n"
                f"- 'description': a 2-sentence detailed explanation of the insight.\n"
                f"- 'confidence': a percentage integer between 50 and 99 indicating your certainty.\n"
                f"- 'time': 'Just now' or similar relative timestamp.\n"
                f"Return ONLY the raw JSON list string, do not wrap it in markdown."
            )

            model = AIService._get_gemini_model()
            if model:
                response = model.generate_content(prompt)
                res_text = response.text.strip()
                if res_text.startswith("```"):
                    res_text = res_text.split("```")[1]
                    if res_text.startswith("json"):
                        res_text = res_text[4:]
                return json.loads(res_text.strip())
            else:
                return AIService._mock_insights(symbol)
        except Exception as e:
            logger.error(f"Error generating insights for {symbol}: {str(e)}")
            return AIService._mock_insights(symbol)

    # ─── Mock Fallbacks ────────────────────────────
    @staticmethod
    def _mock_chat_response(symbol: str, query: str, summary: Dict[str, Any]) -> str:
        query_l = query.lower()
        price = summary["price"]
        change = summary["change"]
        
        if "price" in query_l or "value" in query_l:
            return (
                f"{symbol} is currently trading at ${price:.2f}, representing a change of {change:+.2f}% today. "
                f"The 52-week trading range stands at {summary['range']}. Short-term indicators show strong resistance "
                f"levels nearby."
            )
        elif "buy" in query_l or "sell" in query_l or "recommend" in query_l:
            verdict = "Bullish/Buy" if change >= 0 else "Neutral/Hold"
            return (
                f"Our basic indicators evaluate {symbol} with a {verdict} outlook. Support holds at standard moving averages. "
                f"Institutional accumulation is stable."
            )
        elif "risk" in query_l or "bearish" in query_l:
            return (
                f"For {symbol}, key risk factors include index sector concentrations (currently {summary['sector']}) "
                f"and potential macroeconomic pressures that could trigger volatility in high-beta assets."
            )
        else:
            return (
                f"Regarding {symbol} ({summary['name']}): The stock's financial health is rated high, with a P/E Ratio of "
                f"{summary['pe']} and an EPS of {summary['eps']}. Volume is currently {summary['vol']} compared to an average of {summary['avgVol']}. "
                f"Let me know if you would like technical parameters or specific metrics."
            )

    @staticmethod
    def _mock_sentiment(symbol: str, headlines: List[str] = []) -> Dict[str, Any]:
        # Generate stable mock sentiment based on symbol name
        score = 55
        if symbol in ["AAPL", "NVDA", "MSFT"]:
            score = 78
        elif symbol in ["TSLA"]:
            score = 48
            
        label = "Bullish" if score > 60 else "Bearish" if score < 45 else "Neutral"
        summary = f"Overall sentiment on {symbol} is currently {label.lower()} as social volumes and headlines show moderate confidence."
        
        return {
            "score": score,
            "label": label,
            "summary": summary,
            "headlines_analyzed": len(headlines) if headlines else 5
        }

    @staticmethod
    def _mock_insights(symbol: str) -> List[Dict[str, Any]]:
        return [
            {
                "type": "bullish",
                "title": f"{symbol} Momentum Surge",
                "description": f"{symbol} is showing positive volume divergence on daily candles. Support is established at short-term EMA bands, suggesting room for near-term expansion.",
                "confidence": 85,
                "time": "5 min ago"
            },
            {
                "type": "risk",
                "title": "Sector Volatility Risk",
                "description": f"The broader sector experiences macro headwinds. A breakdown under current support could result in a temporary 4% draw-down testing 50-day SMA support.",
                "confidence": 72,
                "time": "15 min ago"
            },
            {
                "type": "opportunity",
                "title": "Valuation Entry Window",
                "description": f"Current trailing PE indicates the stock is trading slightly below historical averages relative to its growth rate, offering a potential accumulation zone.",
                "confidence": 80,
                "time": "1 hr ago"
            }
        ]
