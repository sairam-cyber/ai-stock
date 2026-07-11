const cron = require("node-cron");
const stockQueue = require("../queues/stockQueue");

const TICKERS = ["AAPL", "MSFT", "TSLA", "NVDA", "AMZN"];

const initScheduler = () => {
  console.log("⏰ Ingestion scheduler initialized");

  // Schedule to run every 15 seconds
  cron.schedule("*/15 * * * * *", async () => {
    console.log("⏰ Cron triggered: Dispatching refresh tasks for tickers:", TICKERS.join(", "));
    for (const symbol of TICKERS) {
      try {
        await stockQueue.add(
          `update-${symbol}`,
          { symbol },
          {
            attempts: 2,
            backoff: 1000,
            removeOnComplete: true,
            removeOnFail: true,
          }
        );
      } catch (err) {
        console.error(`❌ Failed to enqueue cron update for ${symbol}:`, err.message);
      }
    }
  });
};

module.exports = initScheduler;
