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

// Database connection
const User = require("./models/User");

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/chatapp")
  .then(async () => {
    console.log("MongoDB connected successfully");

    // Create test users if they don't exist
    try {
      const testUsers = [
        {
          name: "Test User 1",
          email: "test1@example.com",
          password: "test1234",
          age: 25,
          bio: "This is test user 1",
          photos: ["https://via.placeholder.com/150"],
          location: {
            latitude: 40.7128,
            longitude: -74.006,
            city: "New York",
          },
          preferences: {
            ageRange: { min: 20, max: 35 },
            maxDistance: 50,
            interests: ["coding", "music", "travel"],
          },
        },
        {
          name: "Test User 2",
          email: "test2@example.com",
          password: "test1234",
          age: 28,
          bio: "This is test user 2",
          photos: ["https://via.placeholder.com/150"],
          location: {
            latitude: 40.758,
            longitude: -73.9855,
            city: "New York",
          },
          preferences: {
            ageRange: { min: 22, max: 30 },
            maxDistance: 40,
            interests: ["photography", "hiking", "coffee"],
          },
        },
        {
          name: "Test User 3",
          email: "test3@example.com",
          password: "test1234",
          age: 23,
          bio: "This is test user 3",
          photos: ["https://via.placeholder.com/150"],
          location: {
            latitude: 40.7505,
            longitude: -73.9934,
            city: "New York",
          },
          preferences: {
            ageRange: { min: 20, max: 28 },
            maxDistance: 60,
            interests: ["reading", "movies", "cooking"],
          },
        },
        {
          name: "Test User 4",
          email: "test4@example.com",
          password: "test1234",
          age: 30,
          bio: "This is test user 4",
          photos: ["https://via.placeholder.com/150"],
          location: {
            latitude: 40.7282,
            longitude: -73.9942,
            city: "New York",
          },
          preferences: {
            ageRange: { min: 25, max: 35 },
            maxDistance: 45,
            interests: ["gaming", "tech", "sports"],
          },
        },
        {
          name: "Test User 5",
          email: "test5@example.com",
          password: "test1234",
          age: 27,
          bio: "This is test user 5",
          photos: ["https://via.placeholder.com/150"],
          location: {
            latitude: 40.7614,
            longitude: -73.9776,
            city: "New York",
          },
          preferences: {
            ageRange: { min: 23, max: 32 },
            maxDistance: 55,
            interests: ["art", "music", "travel"],
          },
        },
      ];

      console.log("\n=== Creating Test Users ===");
      for (const userData of testUsers) {
        const existingUser = await User.findOne({ email: userData.email });
        if (!existingUser) {
          const user = await User.create(userData);
          console.log(
            `✓ Created: ${user.email} (Password: ${userData.password})`
          );
        } else {
          console.log(`- Exists: ${existingUser.email} (Password: test1234)`);
        }
      }
      console.log("===========================\n");
    } catch (err) {
      console.error("Error creating test users:", err.message);
    }
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Initialize Socket.io in controllers for real-time updates
const messageController = require("./controllers/messageController");
const chatController = require("./controllers/chatController");
messageController.setSocketIO(io);
chatController.setSocketIO(io);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/chats", require("./routes/chats"));
app.use("/api/chats", require("./routes/messages")); // Messages routes are under /api/chats/:chatId/messages

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

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

server
  .listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. Please use a different port or kill the process using this port.`
      );
      console.error(`To kill the process: kill -9 $(lsof -ti:${PORT})`);
      process.exit(1);
    } else {
      console.error("Server error:", err);
      process.exit(1);
    }
  });

module.exports = { app, io };
