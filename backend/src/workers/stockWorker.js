const axios = require("axios");
const redis = require("../config/redis");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || `http://localhost:${process.env.ML_SERVICE_PORT || 8000}`;

const processJob = async (jobData) => {
  const { symbol } = jobData;
  console.log(`⚙️ [Worker] Processing background update for: ${symbol}`);

  try {
    const response = await axios.get(`${ML_SERVICE_URL}/api/stock/summary`, {
      params: { symbol },
    });

    if (response.data && response.data.success) {
      const stockData = response.data.data;
      const cacheKey = `stock:summary:${symbol.toUpperCase()}`;

      // Cache updated metrics in Redis (15 mins)
      await redis.setex(cacheKey, 900, JSON.stringify(response.data));
      console.log(`✅ [Worker] Cached updated summary in Redis for ${symbol}`);

      // Broadcast to clients using Socket.IO (lazy-loaded to avoid circular dependencies)
      try {
        const serverModule = require("../server");
        if (serverModule && serverModule.io) {
          const upperSymbol = symbol.toUpperCase();
          const updatePayload = {
            symbol: upperSymbol,
            price: stockData.price,
            change: stockData.change,
            changePercent: stockData.changePercent,
            timestamp: new Date().toISOString(),
          };

          // Broadcast to ticker-specific room clients
          serverModule.io.to(`stock:${upperSymbol}`).emit("price-update", updatePayload);
          
          // Broadcast to general dashboard feed
          serverModule.io.emit("price-update-summary", updatePayload);
          
          console.log(`📡 [Worker] Broadcasted Socket.IO update for ${symbol}: $${stockData.price}`);
        }
      } catch (socketErr) {
        console.warn("[Worker] Could not broadcast socket event:", socketErr.message);
      }
    }
  } catch (err) {
    console.error(`❌ [Worker] Failed to refresh stock ${symbol}:`, err.message);
  }
};

// Simple polling loop (every 1 second checks for queue items)
const startWorker = () => {
  console.log("⚙️ Redis-List Worker polling thread active");
  
  setInterval(async () => {
    try {
      const item = await redis.rpop("queue:stock-updates");
      if (item) {
        const jobData = JSON.parse(item);
        await processJob(jobData);
      }
    } catch (err) {
      console.error("❌ [Worker] Error polling queue:", err.message);
    }
  }, 1000);
};

startWorker();

module.exports = { processJob };
