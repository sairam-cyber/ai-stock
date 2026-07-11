const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getPortfolio,
  addHolding,
  sellHolding,
  toggleWatchlist,
} = require("../controllers/portfolioController");

// All routes require user protection
router.use(protect);

router.route("/").get(getPortfolio);
router.route("/buy").post(addHolding);
router.route("/sell").post(sellHolding);
router.route("/watchlist").post(toggleWatchlist);

module.exports = router;
