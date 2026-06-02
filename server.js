const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection setup (before middleware that checks it)
const User = require("./models/User");

// Configure mongoose to handle slow connections
mongoose.set("bufferCommands", false); // Disable mongoose buffering

const mongooseOptions = {
  serverSelectionTimeoutMS: 30000, // 30 seconds - time to wait for server selection
  socketTimeoutMS: 45000, // 45 seconds - time to wait for socket operations
  connectTimeoutMS: 30000, // 30 seconds - time to wait for initial connection
  maxPoolSize: 10, // Maximum number of connections in the pool
  minPoolSize: 2, // Minimum number of connections in the pool
  retryWrites: true, // Retry writes on network errors
  w: "majority", // Write concern
};

// Track connection state
let isDbConnected = false;

// Connection event handlers
mongoose.connection.on("connected", () => {
  console.log("MongoDB connection established");
  isDbConnected = true;
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
  isDbConnected = false;
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
  isDbConnected = false;
});

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get("user-agent") || "Unknown";

  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
  console.log(`  User-Agent: ${userAgent}`);

  // Log request body for POST/PUT/PATCH requests (excluding sensitive data)
  if (["POST", "PUT", "PATCH"].includes(method) && req.body) {
    const bodyCopy = { ...req.body };
    // Hide password in logs
    if (bodyCopy.password) {
      bodyCopy.password = "***hidden***";
    }
    console.log(`  Body:`, JSON.stringify(bodyCopy, null, 2));
  }

  // Log query parameters if any
  if (Object.keys(req.query).length > 0) {
    console.log(`  Query:`, JSON.stringify(req.query, null, 2));
  }

  next();
});

// Database connection check middleware (skip for health check)
app.use((req, res, next) => {
  if (req.path === "/api/health") {
    return next();
  }
  
  if (!isDbConnected && mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      error: "Database connection not available. Please try again in a moment.",
      dbState: mongoose.connection.readyState === 0 ? "disconnected" : 
               mongoose.connection.readyState === 2 ? "connecting" : "disconnecting"
    });
  }
  
  next();
});

// Handle process termination
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed through app termination");
  process.exit(0);
});

async function connectDatabase() {
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/chatapp",
    mongooseOptions
  );
  console.log("MongoDB connected successfully");
  console.log("Database:", mongoose.connection.name);
  isDbConnected = true;

  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.warn(
      "\n⚠ No users in database. Seed demo data:\n   npm run seed:companion\n   Login: ahmed.hussain@mychat.demo / test1234\n"
    );
  } else {
    console.log(`Users in database: ${userCount}\n`);
  }
}

// Initialize Socket.io for real-time message delivery
const messageService = require("./services/messageService");
const realtimeService = require("./services/realtimeService");
messageService.setSocketIO(io);
realtimeService.setSocketIO(io);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/discovery", require("./routes/discovery"));
app.use("/api/matches", require("./routes/matches"));
app.use("/api/chats", require("./routes/chats"));
app.use("/api/chats", require("./routes/messages")); // Messages routes are under /api/chats/:chatId/messages

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

const jwt = require("jsonwebtoken");
const { touchLastActive } = require("./services/userService");

// Socket.io connection handling
io.on("connection", (socket) => {
  const token = socket.handshake.auth?.token;
  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET ||
          "your_super_secret_jwt_key_change_this_in_production"
      );
      socket.userId = decoded.id;
      void touchLastActive(decoded.id);
    } catch {
      // unauthenticated socket — chat rooms only
    }
  }

  console.log("User connected:", socket.id);

  socket.on("presence-ping", () => {
    if (socket.userId) {
      void touchLastActive(socket.userId);
    }
  });

  // Join a chat room
  socket.on("join-chat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat ${chatId}`);
  });

  // Leave a chat room
  socket.on("leave-chat", (chatId) => {
    socket.leave(chatId);
    console.log(`User ${socket.id} left chat ${chatId}`);
  });

  // Handle typing indicator
  socket.on("typing", (data) => {
    socket.to(data.chatId).emit("user-typing", data);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

const PORT = process.env.PORT || 3000;

function startHttpServer() {
  return new Promise((resolve, reject) => {
    server
      .listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        resolve();
      })
      .on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          console.error(
            `Port ${PORT} is already in use. Please use a different port or kill the process using this port.`
          );
          console.error(`To kill the process: kill -9 $(lsof -ti:${PORT})`);
        } else {
          console.error("Server error:", err);
        }
        reject(err);
      });
  });
}

connectDatabase()
  .then(() => startHttpServer())
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });

module.exports = { app, io };
