const User = require("../models/User");
const { formatPublicUser } = require("../utils/formatUser");
const { buildPresence } = require("../utils/presence");
const { getDistanceKm } = require("../utils/distance");
const {
  isActiveToday,
  sharedInterestsCount,
  expireAllStaleInterests,
  expireUserInterestsIfStale,
} = require("../utils/userActivity");
const { INTERESTS_TTL_HOURS } = require("../constants/interests");
const { createError } = require("../utils/appError");

const DEFAULT_RADIUS_KM = 5;
const MAX_RADIUS_KM = 20;

exports.getNearbyUsers = async (currentUserId, radiusKm = DEFAULT_RADIUS_KM) => {
  const radius = Math.min(
    Math.max(Number(radiusKm) || DEFAULT_RADIUS_KM, 1),
    MAX_RADIUS_KM
  );

  await expireAllStaleInterests();

  let currentUser = await User.findById(currentUserId);
  if (!currentUser) {
    throw createError("User not found", 404);
  }

  currentUser = await expireUserInterestsIfStale(currentUser);

  await User.updateOne(
    { _id: currentUserId },
    { $set: { lastActiveAt: new Date() } }
  );
  currentUser.lastActiveAt = new Date();

  if (!isActiveToday(currentUser)) {
    throw createError(
      `Select your interests for today (active for ${INTERESTS_TTL_HOURS} hours)`,
      400
    );
  }

  if (!currentUser.location?.latitude) {
    throw createError("Enable location to see nearby companions", 400);
  }

  const blockedIds = new Set(
    (currentUser.blockedUserIds || []).map((id) => id.toString())
  );

  const candidates = await User.find({
    _id: { $ne: currentUserId },
    visibleInDiscovery: { $ne: false },
    "location.latitude": { $ne: null },
    interestsToday: { $exists: true, $not: { $size: 0 } },
    interestsTodayUpdatedAt: { $ne: null },
  }).select("-password");

  const { latitude: lat1, longitude: lon1 } = currentUser.location;
  const todayInterests = currentUser.interestsToday || [];

  const results = [];

  for (const candidate of candidates) {
    if (blockedIds.has(candidate._id.toString())) {
      continue;
    }
    if (
      candidate.blockedUserIds?.some(
        (id) => id.toString() === currentUserId.toString()
      )
    ) {
      continue;
    }
    if (!isActiveToday(candidate)) {
      continue;
    }
    if (candidate.visibleInDiscovery === false) {
      continue;
    }

    const shared = sharedInterestsCount(
      todayInterests,
      candidate.interestsToday || []
    );
    if (shared === 0) {
      continue;
    }

    const distance = getDistanceKm(
      lat1,
      lon1,
      candidate.location.latitude,
      candidate.location.longitude
    );

    if (distance > radius) {
      continue;
    }

    results.push({
      user: formatPublicUser(candidate),
      distance: Math.round(distance * 10) / 10,
      sharedInterestsCount: shared,
      areaName:
        candidate.location.areaName ||
        candidate.location.city ||
        "Nearby area",
      presence: buildPresence(candidate.lastActiveAt),
    });
  }

  results.sort((a, b) => a.distance - b.distance);

  return {
    profiles: results,
    origin: {
      latitude: lat1,
      longitude: lon1,
    },
    radiusKm: radius,
  };
};
