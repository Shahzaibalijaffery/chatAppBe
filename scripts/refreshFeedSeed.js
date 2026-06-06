/**
 * Refresh demo feed posts only (keeps users, chats, matches).
 *
 *   npm run seed:feed:refresh
 */

require("dotenv").config();

const mongoose = require("mongoose");
const { refreshDemoFeedPosts } = require("../services/feedSeedService");

const mongoUri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/chatapp";

mongoose
  .connect(mongoUri)
  .then(async () => {
    console.log("\n=== Refresh demo feed ===\n");
    console.log("MongoDB:", mongoose.connection.name);
    const result = await refreshDemoFeedPosts();
    console.log(result);
    console.log("");
    process.exit(result.ok ? 0 : 1);
  })
  .catch((err) => {
    console.error("Refresh failed:", err);
    process.exit(1);
  });
