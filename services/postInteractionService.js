const PostComment = require("../models/PostComment");
const PostReaction = require("../models/PostReaction");
const User = require("../models/User");
const { formatPostComment } = require("../utils/formatPost");
const { formatPublicUser } = require("../utils/formatUser");
const { createError } = require("../utils/appError");
const { REACTION_TYPES } = require("../constants/posts");
const postService = require("./postService");

exports.addComment = async (userId, postId, text) => {
  const trimmed = String(text || "").trim();
  if (!trimmed) {
    throw createError("Comment text is required", 400);
  }

  const post = await postService.loadActivePost(postId);
  await assertNotBlocked(userId, post.authorId);

  const comment = await PostComment.create({
    postId: post._id,
    authorId: userId,
    text: trimmed,
  });

  const author = await User.findById(userId).select("-password");
  return formatPostComment(comment, author);
};

exports.setReaction = async (userId, postId, type = "like") => {
  if (!REACTION_TYPES.includes(type)) {
    throw createError("Invalid reaction type", 400);
  }

  const post = await postService.loadActivePost(postId);
  if (post.authorId.toString() === userId.toString()) {
    throw createError("You cannot react to your own post", 400);
  }

  await assertNotBlocked(userId, post.authorId);

  const reaction = await PostReaction.findOneAndUpdate(
    { postId: post._id, userId },
    { type },
    { upsert: true, new: true }
  );

  return {
    postId: postId.toString(),
    type: reaction.type,
    reacted: true,
  };
};

exports.removeReaction = async (userId, postId) => {
  await postService.loadActivePost(postId);
  await PostReaction.deleteOne({ postId, userId });
  return { postId: postId.toString(), reacted: false };
};

/** Whether requester may send a DM request to recipient for this post. */
exports.assertCanRequestDm = async (requesterId, postId, recipientId) => {
  const post = await postService.loadActivePost(postId);
  const authorId = post.authorId.toString();
  const requester = requesterId.toString();
  const recipient = recipientId.toString();

  if (requester === recipient) {
    throw createError("Cannot message yourself", 400);
  }

  await assertNotBlocked(requesterId, recipientId);

  const [commentCount, reaction] = await Promise.all([
    PostComment.countDocuments({ postId: post._id, authorId: requesterId }),
    PostReaction.findOne({ postId: post._id, userId: requesterId }),
  ]);

  if (requester === authorId) {
    const engaged =
      (await PostComment.exists({ postId: post._id, authorId: { $ne: post.authorId } })) ||
      (await PostReaction.exists({
        postId: post._id,
        userId: { $ne: post.authorId },
      }));
    if (!engaged) {
      throw createError(
        "Wait for someone to comment or react before sending a request",
        400
      );
    }
    if (recipient === authorId) {
      throw createError("Invalid recipient", 400);
    }
    const recipientEngaged =
      (await PostComment.exists({
        postId: post._id,
        authorId: recipientId,
      })) ||
      (await PostReaction.exists({ postId: post._id, userId: recipientId }));
    if (!recipientEngaged) {
      throw createError("This user has not engaged with your post", 400);
    }
    return { post, trigger: "author_initiated" };
  }

  if (recipient !== authorId) {
    throw createError("Message requests must go through the post author", 400);
  }

  if (commentCount > 0) {
    return { post, trigger: "comment" };
  }

  if (reaction) {
    return { post, trigger: "react" };
  }

  throw createError(
    "Comment or react on this post before requesting a message",
    400
  );
};

async function assertNotBlocked(userId, otherUserId) {
  const [user, other] = await Promise.all([
    User.findById(userId).select("blockedUserIds"),
    User.findById(otherUserId).select("blockedUserIds"),
  ]);
  if (!user || !other) {
    throw createError("User not found", 404);
  }
  const blocked =
    user.blockedUserIds.some(
      (id) => id.toString() === otherUserId.toString()
    ) ||
    other.blockedUserIds.some((id) => id.toString() === userId.toString());
  if (blocked) {
    throw createError("Unable to interact with this user", 403);
  }
}
