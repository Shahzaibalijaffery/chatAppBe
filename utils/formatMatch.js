function formatMatch(match) {
  return {
    id: match._id.toString(),
    userA: match.userA.toString(),
    userB: match.userB.toString(),
    status: match.status,
    requestedBy: match.requestedBy.toString(),
    createdAt: match.createdAt.toISOString(),
    updatedAt: match.updatedAt.toISOString(),
  };
}

module.exports = { formatMatch };
