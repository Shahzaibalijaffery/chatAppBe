const { formatPublicUser } = require("./formatUser");

function buildPostSnapshot(post) {
  const text = (post.text || "").trim();
  return {
    category: post.category,
    areaName:
      post.location?.areaName || post.location?.city || "Nearby area",
    textPreview: text.length > 120 ? `${text.slice(0, 117)}...` : text,
    postCreatedAt: post.createdAt,
  };
}

function formatPost(post, extras = {}) {
  return {
    id: post._id.toString(),
    authorId: post.authorId.toString(),
    category: post.category,
    text: post.text,
    photos: post.photos || [],
    location: {
      areaName: post.location?.areaName || post.location?.city || "Nearby area",
      country: post.location?.country || null,
    },
    expiresAt: post.expiresAt.toISOString(),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    ...extras,
  };
}

function formatPostComment(comment, author) {
  return {
    id: comment._id.toString(),
    postId: comment.postId.toString(),
    authorId: comment.authorId.toString(),
    text: comment.text,
    createdAt: comment.createdAt.toISOString(),
    author: author ? formatPublicUser(author) : null,
  };
}

module.exports = {
  formatPost,
  formatPostComment,
  buildPostSnapshot,
};
