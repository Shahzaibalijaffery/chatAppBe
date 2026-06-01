const Match = require("../models/Match");
const User = require("../models/User");
const { formatMatch } = require("../utils/formatMatch");
const { createError } = require("../utils/appError");

function sortPair(userId1, userId2) {
  const a = userId1.toString();
  const b = userId2.toString();
  return a < b ? [a, b] : [b, a];
}

exports.assertNotBlocked = async function assertNotBlocked(userId, otherUserId) {
  const user = await User.findById(userId).select("blockedUserIds");
  const other = await User.findById(otherUserId).select("blockedUserIds");
  if (!user || !other) {
    throw createError("User not found", 404);
  }

  const blocked =
    user.blockedUserIds.some((id) => id.toString() === otherUserId.toString()) ||
    other.blockedUserIds.some((id) => id.toString() === userId.toString());

  if (blocked) {
    throw createError("Unable to interact with this user", 403);
  }
};

exports.hasAcceptedMatch = async (userId1, userId2) => {
  const [userA, userB] = sortPair(userId1, userId2);
  const match = await Match.findOne({ userA, userB, status: "accepted" });
  return Boolean(match);
};

exports.getMatchBetween = async (userId1, userId2) => {
  const [userA, userB] = sortPair(userId1, userId2);
  const match = await Match.findOne({ userA, userB });
  return match ? formatMatch(match) : null;
};

exports.requestChat = async (requesterId, otherUserId) => {
  if (requesterId.toString() === otherUserId.toString()) {
    throw createError("Cannot request chat with yourself", 400);
  }

  await exports.assertNotBlocked(requesterId, otherUserId);

  const [userA, userB] = sortPair(requesterId, otherUserId);
  let match = await Match.findOne({ userA, userB });

  if (match) {
    if (match.status === "accepted") {
      throw createError("You are already matched with this user", 400);
    }
    if (match.status === "rejected") {
      match.status = "pending";
      match.requestedBy = requesterId;
      await match.save();
      return formatMatch(match);
    }
    if (match.status === "pending") {
      throw createError("A chat request is already pending", 400);
    }
  }

  match = await Match.create({
    userA,
    userB,
    status: "pending",
    requestedBy: requesterId,
  });

  return formatMatch(match);
};

exports.respondToRequest = async (matchId, userId, action) => {
  const match = await Match.findById(matchId);
  if (!match) {
    throw createError("Match request not found", 404);
  }

  const isParticipant =
    match.userA.toString() === userId.toString() ||
    match.userB.toString() === userId.toString();

  if (!isParticipant) {
    throw createError("Not authorized", 403);
  }

  if (match.status !== "pending") {
    throw createError("This request is no longer pending", 400);
  }

  if (match.requestedBy.toString() === userId.toString()) {
    throw createError("You cannot respond to your own request", 400);
  }

  if (action === "accept") {
    match.status = "accepted";
  } else if (action === "reject") {
    match.status = "rejected";
  } else {
    throw createError("Invalid action", 400);
  }

  await match.save();
  return formatMatch(match);
};

exports.getMatchesForUser = async (userId) => {
  const matches = await Match.find({
    $or: [{ userA: userId }, { userB: userId }],
  }).sort({ updatedAt: -1 });

  return matches.map(formatMatch);
};
