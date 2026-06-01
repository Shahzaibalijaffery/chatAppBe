const {
  INTERESTS_TTL_HOURS,
  INTERESTS_TTL_MS,
  INTERESTS_MAX_UPDATES_PER_WINDOW,
} = require("../constants/interests");
const { createError } = require("./appError");
const { isInterestsExpired } = require("./userActivity");

function normalizeInterests(interests) {
  if (!Array.isArray(interests)) {
    return [];
  }
  return [...new Set(interests.map((s) => String(s).trim()).filter(Boolean))].sort();
}

function interestsEqual(a, b) {
  const left = normalizeInterests(a);
  const right = normalizeInterests(b);
  if (left.length !== right.length) {
    return false;
  }
  return left.every((value, index) => value === right[index]);
}

function isInActiveInterestsWindow(user) {
  if (!user?.interestsToday?.length) {
    return false;
  }
  return !isInterestsExpired(user);
}

/**
 * Builds Mongo update fields for interestsToday, enforcing the per-window change limit.
 * Returns {} when the selection is unchanged (no DB write needed).
 */
function buildInterestsTodayUpdate(user, rawInterests) {
  const interestsToday = normalizeInterests(rawInterests);
  if (interestsToday.length === 0) {
    throw createError("Pick at least one interest for today", 400);
  }

  if (isInActiveInterestsWindow(user) && interestsEqual(user.interestsToday, interestsToday)) {
    return {};
  }

  const now = new Date();

  if (!isInActiveInterestsWindow(user)) {
    return {
      interestsToday,
      interestsTodayUpdatedAt: now,
      interestsTodayPeriodStartedAt: now,
      interestsTodayUpdateCount: 1,
    };
  }

  const used = user.interestsTodayUpdateCount || 1;
  if (used >= INTERESTS_MAX_UPDATES_PER_WINDOW) {
    throw createError(
      `You can only change your interests ${INTERESTS_MAX_UPDATES_PER_WINDOW} times every ${INTERESTS_TTL_HOURS} hours. Wait until they reset to pick again.`,
      429
    );
  }

  return {
    interestsToday,
    interestsTodayUpdatedAt: now,
    interestsTodayUpdateCount: used + 1,
  };
}

module.exports = {
  normalizeInterests,
  interestsEqual,
  buildInterestsTodayUpdate,
  INTERESTS_MAX_UPDATES_PER_WINDOW,
};
