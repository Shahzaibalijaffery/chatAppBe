const Post = require("../models/Post");
const PostComment = require("../models/PostComment");
const PostReaction = require("../models/PostReaction");
const User = require("../models/User");
const { formatPost } = require("../utils/formatPost");
const { formatPublicUser } = require("../utils/formatUser");
const { getDistanceKm } = require("../utils/distance");
const { expireStalePosts } = require("../utils/postExpiry");
const { createError } = require("../utils/appError");
const {
  POST_TTL_MS,
  POST_CATEGORIES,
  DEFAULT_FEED_RADIUS_KM,
  MAX_FEED_RADIUS_KM,
} = require("../constants/posts");

async function loadActivePost(postId) {
  await expireStalePosts();
  const post = await Post.findById(postId);
  if (!post || post.expired) {
    throw createError("Post not found or expired", 404);
  }
  if (post.expiresAt <= new Date()) {
    throw createError("Post has expired", 410);
  }
  return post;
}

exports.createPost = async (userId, payload) => {
  const category = String(payload.category || "").trim();
  const text = String(payload.text || "").trim();

  if (!POST_CATEGORIES.includes(category)) {
    throw createError("Invalid post category", 400);
  }
  if (!text) {
    throw createError("Post text is required", 400);
  }

  const user = await User.findById(userId);
  if (!user?.location?.latitude || !user.location?.longitude) {
    throw createError("Enable location before posting", 400);
  }

  const now = new Date();
  const post = await Post.create({
    authorId: userId,
    category,
    text,
    photos: Array.isArray(payload.photos) ? payload.photos : [],
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

  return formatPost(post, {
    author: formatPublicUser(user),
    commentCount: 0,
    reactionCount: 0,
    distanceKm: 0,
    viewerCommentCount: 0,
    viewerReacted: false,
  });
};

exports.getFeed = async (userId, radiusKm = DEFAULT_FEED_RADIUS_KM) => {
  await expireStalePosts();

  const radius = Math.min(
    Math.max(Number(radiusKm) || DEFAULT_FEED_RADIUS_KM, 5),
    MAX_FEED_RADIUS_KM
  );

  const user = await User.findById(userId);
  if (!user?.location?.latitude) {
    throw createError("Enable location to see the feed", 400);
  }

  const blockedIds = new Set(
    (user.blockedUserIds || []).map((id) => id.toString())
  );

  const now = new Date();
  const posts = await Post.find({
    expired: false,
    expiresAt: { $gt: now },
    authorId: { $ne: userId },
  }).sort({ createdAt: -1 });

  const { latitude: lat1, longitude: lon1 } = user.location;
  const results = [];

  for (const post of posts) {
    const authorId = post.authorId.toString();
    if (blockedIds.has(authorId)) {
      continue;
    }

    const author = await User.findById(post.authorId).select(
      "blockedUserIds name visibleInDiscovery"
    );
    if (author?.visibleInDiscovery === false) {
      continue;
    }
    if (
      author?.blockedUserIds?.some(
        (id) => id.toString() === userId.toString()
      )
    ) {
      continue;
    }

    const distance = getDistanceKm(
      lat1,
      lon1,
      post.location.latitude,
      post.location.longitude
    );
    if (distance > radius) {
      continue;
    }

    const [commentCount, reactionCount, viewerCommentCount, viewerReaction] =
      await Promise.all([
        PostComment.countDocuments({ postId: post._id }),
        PostReaction.countDocuments({ postId: post._id }),
        PostComment.countDocuments({ postId: post._id, authorId: userId }),
        PostReaction.findOne({ postId: post._id, userId }),
      ]);

    const authorDoc = await User.findById(post.authorId).select("-password");

    results.push(
      formatPost(post, {
        author: authorDoc ? formatPublicUser(authorDoc) : null,
        commentCount,
        reactionCount,
        distanceKm: Math.round(distance * 10) / 10,
        viewerCommentCount,
        viewerReacted: Boolean(viewerReaction),
        viewerReactionType: viewerReaction?.type || null,
      })
    );
  }

  results.sort((a, b) => a.distanceKm - b.distanceKm);

  return {
    posts: results,
    radiusKm: radius,
  };
};

exports.getPostDetail = async (userId, postId) => {
  const post = await loadActivePost(postId);
  const author = await User.findById(post.authorId).select("-password");
  if (!author) {
    throw createError("Post not found", 404);
  }

  const [comments, reactions, viewerCommentCount, viewerReaction] =
    await Promise.all([
      PostComment.find({ postId: post._id }).sort({ createdAt: 1 }),
      PostReaction.find({ postId: post._id }),
      PostComment.countDocuments({ postId: post._id, authorId: userId }),
      PostReaction.findOne({ postId: post._id, userId }),
    ]);

  const commentAuthors = await User.find({
    _id: { $in: comments.map((c) => c.authorId) },
  }).select("-password");
  const authorMap = new Map(
    commentAuthors.map((u) => [u._id.toString(), u])
  );

  const { formatPostComment } = require("../utils/formatPost");

  let distanceKm = null;
  const viewer = await User.findById(userId).select("location");
  if (viewer?.location?.latitude) {
    distanceKm =
      Math.round(
        getDistanceKm(
          viewer.location.latitude,
          viewer.location.longitude,
          post.location.latitude,
          post.location.longitude
        ) * 10
      ) / 10;
  }

  const reactionUsers = await User.find({
    _id: { $in: reactions.map((r) => r.userId) },
  }).select("-password");

  const reactionUserMap = new Map(
    reactionUsers.map((u) => [u._id.toString(), u])
  );

  return {
    post: formatPost(post, {
      author: formatPublicUser(author),
      commentCount: comments.length,
      reactionCount: reactions.length,
      distanceKm,
      viewerCommentCount,
      viewerReacted: Boolean(viewerReaction),
      viewerReactionType: viewerReaction?.type || null,
      isAuthor: post.authorId.toString() === userId.toString(),
    }),
    comments: comments.map((c) =>
      formatPostComment(c, authorMap.get(c.authorId.toString()))
    ),
    reactions: reactions.map((r) => ({
      userId: r.userId.toString(),
      type: r.type,
      user: reactionUserMap.get(r.userId.toString())
        ? formatPublicUser(reactionUserMap.get(r.userId.toString()))
        : null,
    })),
  };
};

exports.getMyPosts = async (userId) => {
  await expireStalePosts();
  const now = new Date();
  const posts = await Post.find({
    authorId: userId,
    expired: false,
    expiresAt: { $gt: now },
  }).sort({ createdAt: -1 });

  return posts.map((post) =>
    formatPost(post, {
      commentCount: 0,
      reactionCount: 0,
      distanceKm: 0,
      viewerCommentCount: 0,
      viewerReacted: false,
      isAuthor: true,
    })
  );
};

exports.loadActivePost = loadActivePost;
