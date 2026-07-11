const express = require("express");
const router = express.Router();
const axios = require("axios");
const { protect } = require("../middleware/auth");
const redis = require("../config/redis");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || `http://localhost:${process.env.ML_SERVICE_PORT || 8000}`;

// Protect all routes in this router
router.use(protect);

// ─── Get Stock Historical Data ────────────────
router.get("/:symbol/history", async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period, interval } = req.query;
    const cacheKey = `stock:history:${symbol.toUpperCase()}:${period || "1mo"}:${interval || "1d"}`;

    // Try cache first
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch (cacheErr) {
      console.warn("Redis cache read error:", cacheErr.message);
    }

    const response = await axios.get(`${ML_SERVICE_URL}/api/stock/history`, {
      params: { symbol, period, interval },
    });

    // Save to cache (1 hour)
    try {
      await redis.setex(cacheKey, 3600, JSON.stringify(response.data));
    } catch (cacheErr) {
      console.warn("Redis cache write error:", cacheErr.message);
    }

    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching history for ${req.params.symbol}:`, error.message);
    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.detail || "Error retrieving stock history";
    res.status(statusCode).json({ success: false, message });
  }
});

// ─── Get Stock Key Metrics Summary ────────────
router.get("/:symbol/summary", async (req, res) => {
  try {
    const { symbol } = req.params;
    const cacheKey = `stock:summary:${symbol.toUpperCase()}`;

    // Try cache first
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch (cacheErr) {
      console.warn("Redis cache read error:", cacheErr.message);
    }

    const response = await axios.get(`${ML_SERVICE_URL}/api/stock/summary`, {
      params: { symbol },
    });

    // Save to cache (15 minutes = 900 seconds)
    try {
      await redis.setex(cacheKey, 900, JSON.stringify(response.data));
    } catch (cacheErr) {
      console.warn("Redis cache write error:", cacheErr.message);
    }

    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching summary for ${req.params.symbol}:`, error.message);
    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.detail || "Error retrieving stock summary";
    res.status(statusCode).json({ success: false, message });
  }
});

// ─── Get Stock Price Forecast ─────────────────
router.get("/:symbol/forecast", async (req, res) => {
  try {
    const { symbol } = req.params;
    const { days } = req.query;
    const cacheKey = `stock:forecast:${symbol.toUpperCase()}:${days || 7}`;

    // Try cache first
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch (cacheErr) {
      console.warn("Redis cache read error:", cacheErr.message);
    }

    const response = await axios.get(`${ML_SERVICE_URL}/api/stock/forecast`, {
      params: { symbol, days },
    });

    // Save to cache (2 hours = 7200 seconds)
    try {
      await redis.setex(cacheKey, 7200, JSON.stringify(response.data));
    } catch (cacheErr) {
      console.warn("Redis cache write error:", cacheErr.message);
    }

    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching forecast for ${req.params.symbol}:`, error.message);
    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.detail || "Error generating stock forecast";
    res.status(statusCode).json({ success: false, message });
  }
});

module.exports = router;
