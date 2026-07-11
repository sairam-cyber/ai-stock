require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

// ─── Route Imports ────────────────────────────
const authRoutes = require("./routes/auth");
const portfolioRoutes = require("./routes/portfolio");
const stockRoutes = require("./routes/stocks");
const aiRoutes = require("./routes/ai");

const app = express();
const server = http.createServer(app);

// ─── Connect to MongoDB ──────────────────────
connectDB();

// ─── Start Background Worker & Scheduler ──────
require("./workers/stockWorker");
const initScheduler = require("./cron/scheduler");
initScheduler();

// ─── Socket.IO ────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// ─── Middleware ────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── API Routes ───────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/ai", aiRoutes);

// ─── Health Check ─────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "ai-stock-backend",
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ──────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ─── Global Error Handler ─────────────────────
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// ─── Socket.IO Events ────────────────────────
io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Join room for specific stock ticker
  socket.on("join-stock", (symbol) => {
    if (symbol) {
      const room = `stock:${symbol.toUpperCase()}`;
      socket.join(room);
      console.log(`📡 Socket ${socket.id} joined room: ${room}`);
    }
  });

  // Leave room for specific stock ticker
  socket.on("leave-stock", (symbol) => {
    if (symbol) {
      const room = `stock:${symbol.toUpperCase()}`;
      socket.leave(room);
      console.log(`🚪 Socket ${socket.id} left room: ${room}`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// ─── Start Server ─────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});

module.exports = { app, server, io };
