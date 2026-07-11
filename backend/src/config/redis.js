const Redis = require("ioredis");

const redisHost = process.env.REDIS_HOST || "localhost";
const redisPort = process.env.REDIS_PORT || 6379;

const redis = new Redis({
  host: redisHost,
  port: redisPort,
  maxRetriesPerRequest: null, // Required by BullMQ
});

redis.on("connect", () => {
  console.log("✅ Redis client connected");
});

redis.on("error", (err) => {
  console.error("❌ Redis client error:", err.message);
});

module.exports = redis;
