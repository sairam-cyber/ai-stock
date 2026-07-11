const express = require("express");
const router = express.Router();
const axios = require("axios");
const { protect } = require("../middleware/auth");
const redis = require("../config/redis");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || `http://localhost:${process.env.ML_SERVICE_PORT || 8000}`;

// Protect all routes in this router
router.use(protect);

// ─── AI Chat Assistant ────────────────────────
router.post("/chat", async (req, res) => {
  try {
    const { symbol, query, chat_history } = req.body;

    if (!symbol || !query) {
      return res.status(400).json({
        success: false,
        message: "Symbol and query are required in request body",
      });
    }

    const response = await axios.post(`${ML_SERVICE_URL}/api/ai/chat`, {
      symbol,
      query,
      chat_history,
    });

    res.json(response.data);
  } catch (error) {
    console.error(`Error in AI Chat for ${req.body.symbol}:`, error.message);
    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.detail || "Error communicating with AI Assistant";
    res.status(statusCode).json({ success: false, message });
  }
});

// ─── Get AI Sentiment Score ───────────────────
router.get("/:symbol/sentiment", async (req, res) => {
  try {
    const { symbol } = req.params;
    const cacheKey = `ai:sentiment:${symbol.toUpperCase()}`;

    // Try cache first
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch (cacheErr) {
      console.warn("Redis cache read error:", cacheErr.message);
    }

    const response = await axios.get(`${ML_SERVICE_URL}/api/ai/sentiment`, {
      params: { symbol },
    });

    // Save to cache (1 hour)
    try {
      await redis.setex(cacheKey, 3600, JSON.stringify(response.data));
    } catch (cacheErr) {
      console.warn("Redis cache write error:", cacheErr.message);
    }

    res.json(response.data);
  } catch (error) {
    console.error(`Error in AI Sentiment for ${req.params.symbol}:`, error.message);
    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.detail || "Error generating AI sentiment analysis";
    res.status(statusCode).json({ success: false, message });
  }
});

// ─── Get AI Core Insights ──────────────────────
router.get("/:symbol/insights", async (req, res) => {
  try {
    const { symbol } = req.params;
    const cacheKey = `ai:insights:${symbol.toUpperCase()}`;

    // Try cache first
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch (cacheErr) {
      console.warn("Redis cache read error:", cacheErr.message);
    }

    const response = await axios.get(`${ML_SERVICE_URL}/api/ai/insights`, {
      params: { symbol },
    });

    // Save to cache (2 hours)
    try {
      await redis.setex(cacheKey, 7200, JSON.stringify(response.data));
    } catch (cacheErr) {
      console.warn("Redis cache write error:", cacheErr.message);
    }

    res.json(response.data);
  } catch (error) {
    console.error(`Error in AI Insights for ${req.params.symbol}:`, error.message);
    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.detail || "Error generating AI insights";
    res.status(statusCode).json({ success: false, message });
  }
});

module.exports = router;
