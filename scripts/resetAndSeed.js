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
const { POST_TTL_MS } = require("../constants/posts");
const {
  PASSWORD,
  DEMO_USERS,
  TARGET_USER_COUNT,
  buildUserDoc,
  PAKISTAN_CITIES,
} = require("./seedData");
const { postsForProfile, COMMENT_LINES } = require("./seedPostsData");

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

async function seedPosts(createdUsers, now) {
  let postCount = 0;
  const postsByCity = new Map();

  for (const { user, profile } of createdUsers) {
    const citySlug =
      PAKISTAN_CITIES.find((c) => profile.areaName.includes(c.city))?.slug ||
      "islamabad";
    const area = profile.areaName.split(",")[0].trim();
    const city = profile.locationPin?.city || "Islamabad";
    const index = postCount;

    const templates = postsForProfile(citySlug, area, city, index);

    for (const tpl of templates) {
      const createdAt = new Date(now.getTime() - tpl.hoursAgo * 60 * 60 * 1000);
      const expiresAt = new Date(createdAt.getTime() + POST_TTL_MS);

      const post = await Post.create({
        authorId: user._id,
        category: tpl.category,
        text: tpl.text,
        photos: [],
        location: {
          latitude: user.location.latitude,
          longitude: user.location.longitude,
          areaName: user.location.areaName,
          city: user.location.city,
          country: user.location.country,
        },
        expiresAt,
        expired: false,
        createdAt,
        updatedAt: createdAt,
      });

      postCount += 1;
      if (!postsByCity.has(citySlug)) {
        postsByCity.set(citySlug, []);
      }
      postsByCity.get(citySlug).push({ post, authorId: user._id.toString() });
    }
  }

  return { postCount, postsByCity };
}

async function seedEngagement(postsByCity, createdUsers, now) {
  const islamabadPosts = postsByCity.get("islamabad") || [];
  const islamabadUsers = createdUsers.filter(({ profile }) =>
    profile.areaName.includes("Islamabad")
  );

  if (islamabadPosts.length < 3 || islamabadUsers.length < 4) {
    return { comments: 0, reactions: 0 };
  }

  let comments = 0;
  let reactions = 0;

  const hotPosts = islamabadPosts.slice(0, 8);

  for (const { post } of hotPosts) {
    const commenters = islamabadUsers
      .filter(({ user }) => user._id.toString() !== post.authorId.toString())
      .slice(0, 3);

    for (let c = 0; c < commenters.length; c += 1) {
      const { user } = commenters[c];
      const minsAgo = 30 + c * 18 + comments * 5;
      await PostComment.create({
        postId: post._id,
        authorId: user._id,
        text: COMMENT_LINES[(comments + c) % COMMENT_LINES.length],
        createdAt: new Date(now.getTime() - minsAgo * 60 * 1000),
      });
      comments += 1;
    }

    const reactors = islamabadUsers
      .filter(({ user }) => user._id.toString() !== post.authorId.toString())
      .slice(0, 2);

    for (const { user } of reactors) {
      try {
        await PostReaction.create({
          postId: post._id,
          userId: user._id,
          type: reactions % 2 === 0 ? "like" : "helpful",
        });
        reactions += 1;
      } catch {
        /* duplicate */
      }
    }
  }

  return { comments, reactions };
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
  const { postCount, postsByCity } = await seedPosts(createdUsers, now);
  console.log(`Posts: ${postCount}\n`);

  console.log("Adding comments and reactions (Islamabad)...");
  const engagement = await seedEngagement(postsByCity, createdUsers, now);
  console.log(
    `Comments: ${engagement.comments}, Reactions: ${engagement.reactions}\n`
  );

  console.log("---");
  console.log(`Password (all users): ${PASSWORD}`);
  console.log("Primary login: ahmed.hussain@mychat.demo");
  console.log("Feed: enable location in Islamabad area to see the busiest posts.\n");
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
