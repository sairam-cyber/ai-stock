const Portfolio = require("../models/Portfolio");
const User = require("../models/User");

// ─── Get User Portfolio ──────────────────────
exports.getPortfolio = async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ user: req.user._id });

    // Initialize portfolio if not found
    if (!portfolio) {
      portfolio = await Portfolio.create({
        user: req.user._id,
        holdings: [],
        cashBalance: 100000,
        history: [{ date: new Date(), totalValue: 100000 }],
      });
    }

    res.json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    console.error("Get portfolio error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving portfolio",
    });
  }
};

// ─── Add/Buy Stock Holding ───────────────────
exports.addHolding = async (req, res) => {
  try {
    const { symbol, name, shares, price } = req.body;

    if (!symbol || !name || !shares || !price) {
      return res.status(400).json({
        success: false,
        message: "Please provide symbol, name, shares, and price",
      });
    }

    let portfolio = await Portfolio.findOne({ user: req.user._id });
    if (!portfolio) {
      portfolio = new Portfolio({ user: req.user._id, holdings: [] });
    }

    const totalCost = shares * price;
    if (portfolio.cashBalance < totalCost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient funds. Cost is $${totalCost.toFixed(2)}, cash balance is $${portfolio.cashBalance.toFixed(2)}`,
      });
    }

    // Deduct cash balance
    portfolio.cashBalance -= totalCost;

    // Check if stock already exists in holdings
    const existingHoldingIndex = portfolio.holdings.findIndex(
      (h) => h.symbol === symbol.toUpperCase()
    );

    if (existingHoldingIndex > -1) {
      // Average cost calculation
      const existing = portfolio.holdings[existingHoldingIndex];
      const newSharesCount = existing.shares + Number(shares);
      const newAvgPrice =
        (existing.shares * existing.averageBuyPrice + totalCost) /
        newSharesCount;

      portfolio.holdings[existingHoldingIndex].shares = newSharesCount;
      portfolio.holdings[existingHoldingIndex].averageBuyPrice =
        Math.round(newAvgPrice * 100) / 100;
    } else {
      portfolio.holdings.push({
        symbol: symbol.toUpperCase(),
        name,
        shares: Number(shares),
        averageBuyPrice: Number(price),
      });
    }

    // Update history
    const totalValue =
      portfolio.cashBalance +
      portfolio.holdings.reduce(
        (sum, h) => sum + h.shares * h.averageBuyPrice,
        0
      );
    portfolio.history.push({ date: new Date(), totalValue });

    await portfolio.save();

    res.json({
      success: true,
      message: `${shares} shares of ${symbol} purchased successfully`,
      data: portfolio,
    });
  } catch (error) {
    console.error("Add holding error:", error);
    res.status(500).json({
      success: false,
      message: "Server error processing purchase",
    });
  }
};

// ─── Sell/Remove Stock Holding ────────────────
exports.sellHolding = async (req, res) => {
  try {
    const { symbol, shares, price } = req.body;

    if (!symbol || !shares || !price) {
      return res.status(400).json({
        success: false,
        message: "Please provide symbol, shares, and price",
      });
    }

    const portfolio = await Portfolio.findOne({ user: req.user._id });
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    const holdingIndex = portfolio.holdings.findIndex(
      (h) => h.symbol === symbol.toUpperCase()
    );

    if (holdingIndex === -1) {
      return res.status(400).json({
        success: false,
        message: `No holding of ${symbol} found to sell`,
      });
    }

    const holding = portfolio.holdings[holdingIndex];
    if (holding.shares < Number(shares)) {
      return res.status(400).json({
        success: false,
        message: `Insufficient shares. You only own ${holding.shares} shares of ${symbol}`,
      });
    }

    // Sell shares
    const proceeds = Number(shares) * Number(price);
    portfolio.cashBalance += proceeds;
    holding.shares -= Number(shares);

    // If all shares sold, remove holding entry
    if (holding.shares === 0) {
      portfolio.holdings.splice(holdingIndex, 1);
    }

    // Update history
    const totalValue =
      portfolio.cashBalance +
      portfolio.holdings.reduce(
        (sum, h) => sum + h.shares * h.averageBuyPrice,
        0
      );
    portfolio.history.push({ date: new Date(), totalValue });

    await portfolio.save();

    res.json({
      success: true,
      message: `${shares} shares of ${symbol} sold successfully`,
      data: portfolio,
    });
  } catch (error) {
    console.error("Sell holding error:", error);
    res.status(500).json({
      success: false,
      message: "Server error processing sale",
    });
  }
};

// ─── Toggle Watchlist ─────────────────────────
exports.toggleWatchlist = async (req, res) => {
  try {
    const { symbol } = req.body;

    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: "Stock symbol is required",
      });
    }

    const user = await User.findById(req.user._id);
    const upperSymbol = symbol.toUpperCase();

    const index = user.watchlist.indexOf(upperSymbol);
    let isAdded = false;

    if (index > -1) {
      user.watchlist.splice(index, 1);
    } else {
      user.watchlist.push(upperSymbol);
      isAdded = true;
    }

    await user.save();

    res.json({
      success: true,
      message: isAdded
        ? `${upperSymbol} added to watchlist`
        : `${upperSymbol} removed from watchlist`,
      data: {
        watchlist: user.watchlist,
        isAdded,
      },
    });
  } catch (error) {
    console.error("Toggle watchlist error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating watchlist",
    });
  }
};
