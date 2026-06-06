/**
 * Demo feed seeding — refresh local posts for @mychat.demo users.
 * Used by npm run seed:fresh, seed:feed:refresh, and optional 12h server job.
 */

const User = require("../models/User");
const Post = require("../models/Post");
const PostComment = require("../models/PostComment");
const PostReaction = require("../models/PostReaction");
const { POST_TTL_MS } = require("../constants/posts");
const { PAKISTAN_CITIES } = require("../scripts/seedData");
const { COMMENT_LINES, planFeedPosts } = require("../scripts/seedPostsData");
const { expireStalePosts } = require("../utils/postExpiry");

const DEMO_EMAIL_PATTERN = /@mychat\.demo$/i;

/** Minimum active demo posts before startup skips auto-refresh. */
const MIN_ACTIVE_DEMO_POSTS = 5;

function isAutoSeedEnabled() {
  if (process.env.AUTO_SEED_DEMO_FEED === "false") {
    return false;
  }
  if (process.env.AUTO_SEED_DEMO_FEED === "true") {
    return true;
  }
  return process.env.NODE_ENV !== "production";
}

function getSeedIntervalMs() {
  const hours = Number(process.env.SEED_FEED_INTERVAL_HOURS);
  if (Number.isFinite(hours) && hours > 0) {
    return hours * 60 * 60 * 1000;
  }
  return POST_TTL_MS;
}

function citySlugForUser(user) {
  const area = user.location?.areaName || "";
  const city = user.location?.city || "";
  const match = PAKISTAN_CITIES.find(
    (c) => area.includes(c.city) || city.includes(c.city)
  );
  return match?.slug || "islamabad";
}

function isIslamabadUser(user) {
  const area = user.location?.areaName || "";
  const city = user.location?.city || "";
  return area.includes("Islamabad") || city.includes("Islamabad");
}

async function loadDemoUsers() {
  return User.find({
    email: DEMO_EMAIL_PATTERN,
    "location.latitude": { $ne: null },
  }).select("_id email location name");
}

async function countActiveDemoPosts() {
  const demoUsers = await User.find({ email: DEMO_EMAIL_PATTERN }).select("_id");
  if (demoUsers.length === 0) {
    return 0;
  }
  const now = new Date();
  return Post.countDocuments({
    authorId: { $in: demoUsers.map((u) => u._id) },
    expired: false,
    expiresAt: { $gt: now },
  });
}

async function clearDemoPostsAndEngagement() {
  const demoUsers = await User.find({ email: DEMO_EMAIL_PATTERN }).select("_id");
  const authorIds = demoUsers.map((u) => u._id);
  if (authorIds.length === 0) {
    return { postsRemoved: 0 };
  }

  const postIds = (
    await Post.find({ authorId: { $in: authorIds } }).select("_id")
  ).map((p) => p._id);

  if (postIds.length > 0) {
    await Promise.all([
      PostComment.deleteMany({ postId: { $in: postIds } }),
      PostReaction.deleteMany({ postId: { $in: postIds } }),
    ]);
  }

  const result = await Post.deleteMany({ authorId: { $in: authorIds } });
  return { postsRemoved: result.deletedCount || 0 };
}

async function seedPostsForUsers(users, now, refreshSeed = 0) {
  let postCount = 0;
  const postsByCity = new Map();

  const planned = planFeedPosts(users, citySlugForUser, refreshSeed);

  for (const entry of planned) {
    const { user, citySlug, category, text, hoursAgo, photos } = entry;
    const createdAt = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    const expiresAt = new Date(createdAt.getTime() + POST_TTL_MS);

    const post = await Post.create({
      authorId: user._id,
      category,
      text,
      photos: photos || [],
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

  return { postCount, postsByCity };
}

async function seedEngagement(postsByCity, users, now) {
  const islamabadPosts = postsByCity.get("islamabad") || [];
  const islamabadUsers = users.filter(isIslamabadUser);

  if (islamabadPosts.length < 3 || islamabadUsers.length < 4) {
    return { comments: 0, reactions: 0 };
  }

  let comments = 0;
  let reactions = 0;
  const hotPosts = islamabadPosts.slice(0, 8);

  for (const { post } of hotPosts) {
    const commenters = islamabadUsers
      .filter((user) => user._id.toString() !== post.authorId.toString())
      .slice(0, 3);

    for (let c = 0; c < commenters.length; c += 1) {
      const user = commenters[c];
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
      .filter((user) => user._id.toString() !== post.authorId.toString())
      .slice(0, 2);

    for (const user of reactors) {
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

/**
 * Replace all demo-user posts with a fresh batch (+ Islamabad engagement).
 */
async function refreshDemoFeedPosts() {
  await expireStalePosts();

  const users = await loadDemoUsers();
  if (users.length === 0) {
    return {
      ok: false,
      skipped: true,
      reason: "no demo users (@mychat.demo) with location",
    };
  }

  const { postsRemoved } = await clearDemoPostsAndEngagement();
  const now = new Date();
  const refreshSeed = Math.floor(now.getTime() / POST_TTL_MS);
  const { postCount, postsByCity } = await seedPostsForUsers(
    users,
    now,
    refreshSeed
  );
  const engagement = await seedEngagement(postsByCity, users, now);

  return {
    ok: true,
    users: users.length,
    postsRemoved,
    postsCreated: postCount,
    comments: engagement.comments,
    reactions: engagement.reactions,
  };
}

/**
 * Refresh on startup only when the demo feed is nearly empty.
 */
async function refreshDemoFeedIfNeeded() {
  const active = await countActiveDemoPosts();
  if (active >= MIN_ACTIVE_DEMO_POSTS) {
    return {
      ok: true,
      skipped: true,
      reason: `active demo posts (${active}) above threshold`,
    };
  }
  return refreshDemoFeedPosts();
}

function scheduleDemoFeedRefresh() {
  if (!isAutoSeedEnabled()) {
    console.log(
      "Demo feed auto-seed disabled (set AUTO_SEED_DEMO_FEED=true to enable in production)"
    );
    return null;
  }

  const intervalMs = getSeedIntervalMs();
  const hours = intervalMs / (60 * 60 * 1000);

  const run = (label) => {
    refreshDemoFeedPosts()
      .then((result) => {
        if (result.skipped) {
          console.log(`[feed-seed:${label}] skipped — ${result.reason}`);
        } else {
          console.log(
            `[feed-seed:${label}] posts=${result.postsCreated} comments=${result.comments} reactions=${result.reactions}`
          );
        }
      })
      .catch((err) => {
        console.error(`[feed-seed:${label}] failed:`, err);
      });
  };

  void refreshDemoFeedIfNeeded().then((result) => {
    if (result.skipped) {
      console.log(`[feed-seed:startup] skipped — ${result.reason}`);
    } else if (result.ok) {
      console.log(
        `[feed-seed:startup] posts=${result.postsCreated} comments=${result.comments} reactions=${result.reactions}`
      );
    }
  });

  const timer = setInterval(() => run("interval"), intervalMs);
  console.log(
    `Demo feed auto-seed scheduled every ${hours}h (AUTO_SEED_DEMO_FEED, SEED_FEED_INTERVAL_HOURS)`
  );

  return timer;
}

module.exports = {
  DEMO_EMAIL_PATTERN,
  isAutoSeedEnabled,
  getSeedIntervalMs,
  refreshDemoFeedPosts,
  refreshDemoFeedIfNeeded,
  scheduleDemoFeedRefresh,
  seedPostsForUsers,
  seedEngagement,
  clearDemoPostsAndEngagement,
};
