const { Queue } = require("bullmq");
const redis = require("../config/redis");

class DynamicStockQueue {
  constructor() {
    this.bullQueue = null;
    this.isFallback = false;
    this.initPromise = this.checkVersionAndInit();
  }

  async checkVersionAndInit() {
    try {
      const info = await redis.info("server");
      const match = info.match(/redis_version:([0-9.]+)/);
      const version = match ? match[1] : "0.0.0";
      const majorVersion = parseInt(version.split(".")[0], 10);

      if (majorVersion >= 5) {
        console.log(`📥 [Queue] Redis version ${version} >= 5.0.0. Initializing BullMQ Queue.`);
        this.bullQueue = new Queue("stock-updates", {
          connection: redis,
          defaultJobOptions: {
            removeOnComplete: true,
            removeOnFail: true,
          },
        });
      } else {
        console.warn(`⚠️ [Queue] Redis version ${version} is < 5.0.0. Falling back to custom Redis-List Queue.`);
        this.isFallback = true;
      }
    } catch (err) {
      console.error("❌ [Queue] Failed to query Redis version, defaulting to custom Redis-List Queue:", err.message);
      this.isFallback = true;
    }
  }

  async add(name, data, opts) {
    await this.initPromise;
    if (!this.isFallback && this.bullQueue) {
      try {
        console.log(`📥 [Queue] Enqueuing BullMQ job: ${name}`);
        return await this.bullQueue.add(name, data, opts);
      } catch (err) {
        console.error("❌ [Queue] BullMQ failed, falling back to custom list:", err.message);
      }
    }

    // Fallback implementation
    try {
      console.log(`📥 [Queue (Fallback)] Enqueuing custom job: ${name}`);
      await redis.lpush("queue:stock-updates", JSON.stringify(data));
      return { id: `fallback-${Date.now()}` };
    } catch (err) {
      console.error("❌ [Queue (Fallback)] Failed to enqueue job:", err.message);
      throw err;
    }
  }
}

const stockQueue = new DynamicStockQueue();

module.exports = stockQueue;
