const User = require("../models/User");
const { INTERESTS_TTL_MS } = require("../constants/interests");

function getInterestsPeriodStart(user) {
  return user?.interestsTodayPeriodStartedAt || user?.interestsTodayUpdatedAt || null;
}

function isInterestsExpired(user) {
  if (!user?.interestsToday?.length) {
    return false;
  }
  const periodStart = getInterestsPeriodStart(user);
  if (!periodStart) {
    return true;
  }
  const started = new Date(periodStart).getTime();
  if (Number.isNaN(started)) {
    return true;
  }
  return Date.now() - started >= INTERESTS_TTL_MS;
}

const INTERESTS_CLEAR_FIELDS = {
  interestsToday: [],
  interestsTodayUpdatedAt: null,
  interestsTodayPeriodStartedAt: null,
  interestsTodayUpdateCount: 0,
};

/** True if user has interests set within the last 12 hours. */
function isActiveToday(user) {
  if (!user?.interestsToday?.length || !user.interestsTodayUpdatedAt) {
    return false;
  }
  return !isInterestsExpired(user);
}

function sharedInterestsCount(a = [], b = []) {
  const setB = new Set(b);
  return a.filter((interest) => setB.has(interest)).length;
}

/** Clear expired interests on this user document in MongoDB. */
async function expireUserInterestsIfStale(user) {
  if (!user?._id || !isInterestsExpired(user)) {
    return user;
  }

  await User.updateOne({ _id: user._id }, { $set: INTERESTS_CLEAR_FIELDS });

  Object.assign(user, INTERESTS_CLEAR_FIELDS);
  return user;
}

/** Bulk-clear all users whose interests are older than 12 hours. */
async function expireAllStaleInterests() {
  const cutoff = new Date(Date.now() - INTERESTS_TTL_MS);
  await User.updateMany(
    {
      interestsToday: { $exists: true, $not: { $size: 0 } },
      $or: [
        { interestsTodayPeriodStartedAt: { $lt: cutoff, $ne: null } },
        {
          interestsTodayPeriodStartedAt: null,
          interestsTodayUpdatedAt: { $lt: cutoff, $ne: null },
        },
      ],
    },
    { $set: INTERESTS_CLEAR_FIELDS }
  );
}

module.exports = {
  isActiveToday,
  isInterestsExpired,
  getInterestsPeriodStart,
  sharedInterestsCount,
  expireUserInterestsIfStale,
  expireAllStaleInterests,
};
