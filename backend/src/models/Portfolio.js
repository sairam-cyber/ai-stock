const mongoose = require("mongoose");

const holdingSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: [true, "Stock symbol is required"],
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    shares: {
      type: Number,
      required: [true, "Number of shares is required"],
      min: [0, "Shares cannot be negative"],
    },
    averageBuyPrice: {
      type: Number,
      required: [true, "Average buy price is required"],
      min: [0, "Average buy price cannot be negative"],
    },
  },
  { _id: false }
);

const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    holdings: [holdingSchema],
    cashBalance: {
      type: Number,
      default: 100000, // Default mock cash balance $100K
      min: [0, "Cash balance cannot be negative"],
    },
    history: [
      {
        date: { type: Date, default: Date.now },
        totalValue: { type: Number, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Virtual for calculating total portfolio value
portfolioSchema.virtual("totalHoldingsValue").get(function () {
  // Normally would fetch current prices, we will dynamically sum them
  return this.holdings.reduce(
    (sum, holding) => sum + holding.shares * holding.averageBuyPrice,
    0
  );
});

module.exports = mongoose.model("Portfolio", portfolioSchema);
