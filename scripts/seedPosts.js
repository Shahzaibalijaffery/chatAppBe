/**
 * Seed sample local posts for demo users (12h TTL).
 * Run after seed:companion:  node scripts/seedPosts.js
 */

require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require("../models/Post");
const { POST_TTL_MS, POST_CATEGORIES } = require("../constants/posts");

const SAMPLE_TEXTS = [
  "New café opened on the corner — great lattes and quiet seating.",
  "Heavy traffic on the main road, avoid for the next hour.",
  "Street concert tonight in the market area, starts around 8pm.",
  "Road work blocking one lane near the bridge.",
  "Food festival pop-up in the park this weekend.",
  "Protest gathering at the square — plan alternate routes.",
  "Amazing bakery just started serving fresh croissants.",
  "Power outage reported in a few blocks, may last an hour.",
];

async function seedPosts() {
  const users = await User.find({
    email: { $regex: /@mychat\.demo$/i },
    "location.latitude": { $ne: null },
  }).select("_id location");

  if (users.length === 0) {
    console.log("No demo users with location — run npm run seed:companion first.");
    return;
  }

  const now = new Date();
  let created = 0;

  for (let i = 0; i < users.length && i < SAMPLE_TEXTS.length; i += 1) {
    const user = users[i];
    const exists = await Post.findOne({
      authorId: user._id,
      expired: false,
      expiresAt: { $gt: now },
    });
    if (exists) {
      continue;
    }

    const category = POST_CATEGORIES[i % POST_CATEGORIES.length];
    await Post.create({
      authorId: user._id,
      category,
      text: SAMPLE_TEXTS[i],
      photos: [],
      location: {
        latitude: user.location.latitude,
        longitude: user.location.longitude,
        areaName: user.location.areaName || user.location.city || "Nearby area",
        city: user.location.city || null,
        country: user.location.country || null,
      },
      expiresAt: new Date(now.getTime() + POST_TTL_MS),
      expired: false,
    });
    created += 1;
  }

  console.log(`Seeded ${created} active posts (${users.length} demo users checked).`);
}

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/chatapp")
  .then(async () => {
    await seedPosts();
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
