const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/chatapp")
  .then(async () => {
    console.log("MongoDB connected successfully");

    // Check if test user already exists
    const existingUser = await User.findOne({ email: "test@example.com" });

    if (existingUser) {
      console.log("Test user already exists:");
      console.log({
        id: existingUser._id.toString(),
        name: existingUser.name,
        email: existingUser.email,
      });
      process.exit(0);
    }

    // Create test user
    const testUser = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: "test1234",
      age: 25,
      bio: "This is a test user for development",
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
    });

    console.log("Test user created successfully:");
    console.log({
      id: testUser._id.toString(),
      name: testUser.name,
      email: testUser.email,
      password: "test1234",
    });

    process.exit(0);
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });

