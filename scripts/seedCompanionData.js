/**
 * Seed demo users across Pakistan (52 users, spread city centers).
 *
 *   npm run seed:companion
 *   npm run seed:companion -- --clean   # delete legacy test@example.com users only
 *
 * Login (main): ahmed.hussain@mychat.demo / test1234
 */

require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");
const {
  CENTER_LAT,
  CENTER_LNG,
  PASSWORD,
  LEGACY_EMAILS,
  DEMO_USERS,
  TARGET_USER_COUNT,
  buildUserDoc,
} = require("./seedData");

async function seed() {
  const clean = process.argv.includes("--clean");
  const today = new Date();

  console.log("\n=== Demo users seed (Pakistan — spread locations) ===");
  console.log(`Users to seed: ${DEMO_USERS.length} (target ${TARGET_USER_COUNT})`);
  console.log(`Password (all): ${PASSWORD}\n`);

  if (clean) {
    const removed = await User.deleteMany({ email: { $in: LEGACY_EMAILS } });
    console.log(`Removed ${removed.deletedCount} legacy test accounts\n`);
  }

  let created = 0;
  let updated = 0;

  for (const profile of DEMO_USERS) {
    const doc = buildUserDoc(profile, today);
    const exists = await User.findOne({ email: profile.email });

    if (exists) {
      const { password: _pw, ...fields } = doc;
      await User.updateOne({ email: profile.email }, { $set: fields });
      console.log(`↻ ${profile.name} <${profile.email}>`);
      updated++;
    } else {
      await User.create(doc);
      console.log(`✓ ${profile.name} <${profile.email}>`);
      created++;
    }
  }

  console.log(`\nDone. Created: ${created}, updated: ${updated}`);
  console.log(`\nPrimary login: ahmed.hussain@mychat.demo / ${PASSWORD}\n`);
}

const mongoUri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/chatapp";

mongoose
  .connect(mongoUri)
  .then(async () => {
    console.log("MongoDB connected:", mongoose.connection.host);
    console.log("Database:", mongoose.connection.name);
    await seed();
    const count = await User.countDocuments();
    console.log(`Verified: ${count} users in database`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
