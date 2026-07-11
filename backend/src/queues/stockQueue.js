const redis = require("../config/redis");

class StockQueue {
  async add(name, data) {
    try {
      console.log(`📥 [Queue] Enqueuing job: ${name}`);
      await redis.lpush("queue:stock-updates", JSON.stringify(data));
      return { id: Date.now() };
    } catch (err) {
      console.error("❌ [Queue] Failed to enqueue job:", err.message);
      throw err;
    }
  }
}

const stockQueue = new StockQueue();
console.log("📥 Custom Redis-List Queue initialized");

module.exports = stockQueue;
