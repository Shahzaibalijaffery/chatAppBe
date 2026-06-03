const Post = require("../models/Post");
const PostComment = require("../models/PostComment");
const PostReaction = require("../models/PostReaction");

/** Remove expired post content; chats and match snapshots are kept. */
async function expireStalePosts() {
  const now = new Date();
  const stale = await Post.find({
    expired: false,
    expiresAt: { $lte: now },
  }).select("_id");

  if (stale.length === 0) {
    return 0;
  }

  const ids = stale.map((p) => p._id);

  await PostComment.deleteMany({ postId: { $in: ids } });
  await PostReaction.deleteMany({ postId: { $in: ids } });
  await Post.updateMany(
    { _id: { $in: ids } },
    {
      $set: {
        expired: true,
        text: "",
        photos: [],
      },
    }
  );

  return ids.length;
}

module.exports = { expireStalePosts };
