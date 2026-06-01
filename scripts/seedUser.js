/**
 * Create a single demo user if missing.
 * Prefer: npm run seed:companion
 */

require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");
const { DEMO_USERS, buildUserDoc, PASSWORD } = require("./seedData");

const primary = DEMO_USERS[0]; // Ahmed Hussain

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/chatapp")
  .then(async () => {
    console.log("MongoDB connected");

    const existing = await User.findOne({ email: primary.email });
    if (existing) {
      console.log("Demo user already exists:");
      console.log({
        name: existing.name,
        email: existing.email,
        password: PASSWORD,
      });
      process.exit(0);
    }

    const user = await User.create(buildUserDoc(primary, new Date()));
    console.log("Demo user created:");
    console.log({
      name: user.name,
      email: user.email,
      password: PASSWORD,
    });

    process.exit(0);
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
