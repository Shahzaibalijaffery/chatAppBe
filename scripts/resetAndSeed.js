/**
 * Wipe the database and seed fresh demo users + realistic local posts.
 *
 *   npm run seed:fresh
 *
 * Login: ahmed.hussain@mychat.demo / test1234
 */

require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require("../models/Post");
const PostComment = require("../models/PostComment");
const PostReaction = require("../models/PostReaction");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const Match = require("../models/Match");
const Report = require("../models/Report");
const {
  PASSWORD,
  DEMO_USERS,
  TARGET_USER_COUNT,
  buildUserDoc,
} = require("./seedData");
const { seedPostsForUsers, seedEngagement } = require("../services/feedSeedService");

async function wipeAll() {
  await Promise.all([
    Message.deleteMany({}),
    Chat.deleteMany({}),
    Match.deleteMany({}),
    PostComment.deleteMany({}),
    PostReaction.deleteMany({}),
    Post.deleteMany({}),
    Report.deleteMany({}),
    User.deleteMany({}),
  ]);
}

async function seedUsers(today) {
  const created = [];
  for (const profile of DEMO_USERS) {
    const doc = buildUserDoc(profile, today);
    const user = await User.create(doc);
    created.push({ user, profile });
  }
  return created;
}

async function run() {
  const now = new Date();
  const today = now;

  console.log("\n=== Fresh database seed ===\n");

  console.log("Wiping all collections...");
  await wipeAll();
  console.log("Database cleared.\n");

  console.log(`Creating ${TARGET_USER_COUNT} demo profiles...`);
  const createdUsers = await seedUsers(today);
  console.log(`Users: ${createdUsers.length}\n`);

  console.log("Creating local posts...");
  const users = createdUsers.map(({ user }) => user);
  const refreshSeed = Math.floor(now.getTime() / POST_TTL_MS);
  const { postCount, postsByCity } = await seedPostsForUsers(
    users,
    now,
    refreshSeed
  );
  console.log(`Posts: ${postCount}\n`);

  console.log("Adding comments and reactions (Islamabad)...");
  const engagement = await seedEngagement(postsByCity, users, now);
  console.log(
    `Comments: ${engagement.comments}, Reactions: ${engagement.reactions}\n`
  );

  console.log("---");
  console.log("Password (all users):", PASSWORD);
  console.log("Primary login: ahmed.hussain@mychat.demo");
  console.log(
    "Feed: enable location in Islamabad area to see the busiest posts."
  );
  console.log(
    "Auto-refresh: demo feed re-seeds every 12h when AUTO_SEED_DEMO_FEED is enabled.\n"
  );
}

const mongoUri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/chatapp";

mongoose
  .connect(mongoUri)
  .then(async () => {
    console.log("MongoDB:", mongoose.connection.name);
    await run();
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
