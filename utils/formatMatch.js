function formatMatch(match) {
  const snapshot = match.postSnapshot
    ? {
        category: match.postSnapshot.category,
        areaName: match.postSnapshot.areaName,
        textPreview: match.postSnapshot.textPreview,
        postCreatedAt:
          match.postSnapshot.postCreatedAt?.toISOString?.() ||
          match.postSnapshot.postCreatedAt,
      }
    : null;

  return {
    id: match._id.toString(),
    userA: match.userA.toString(),
    userB: match.userB.toString(),
    status: match.status,
    requestedBy: match.requestedBy.toString(),
    postId: match.postId?.toString() || null,
    postSnapshot: snapshot,
    trigger: match.trigger || null,
    createdAt: match.createdAt.toISOString(),
    updatedAt: match.updatedAt.toISOString(),
  };
}

module.exports = { formatMatch };
