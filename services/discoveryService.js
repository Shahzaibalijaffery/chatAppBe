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
const EXPLORE_LIMIT = 30;
const EXPLORE_SAME_COUNTRY_RATIO = 0.75;

function shuffleInPlace(items) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function buildExploreProfile(currentUser, candidate, todayInterests) {
  const shared = sharedInterestsCount(
    todayInterests,
    candidate.interestsToday || []
  );
  if (shared === 0) {
    return null;
  }

  let distance = null;
  if (
    currentUser.location?.latitude != null &&
    candidate.location?.latitude != null
  ) {
    distance =
      Math.round(
        getDistanceKm(
          currentUser.location.latitude,
          currentUser.location.longitude,
          candidate.location.latitude,
          candidate.location.longitude
        ) * 10
      ) / 10;
  }

  return {
    user: formatPublicUser(candidate),
    distance,
    sharedInterestsCount: shared,
    areaName:
      candidate.location?.areaName ||
      candidate.location?.city ||
      candidate.location?.country ||
      "Somewhere",
    presence: buildPresence(candidate.lastActiveAt),
  };
}

function pickExploreProfiles(pool, viewerCountry, limit) {
  if (pool.length <= limit) {
    return shuffleInPlace([...pool]);
  }

  if (!viewerCountry) {
    return shuffleInPlace([...pool]).slice(0, limit);
  }

  const sameCountry = pool.filter(
    (p) => p.user.location?.country === viewerCountry
  );
  const other = pool.filter(
    (p) => p.user.location?.country !== viewerCountry
  );

  shuffleInPlace(sameCountry);
  shuffleInPlace(other);

  const sameTarget = Math.min(
    sameCountry.length,
    Math.ceil(limit * EXPLORE_SAME_COUNTRY_RATIO)
  );
  const picked = [...sameCountry.slice(0, sameTarget)];
  const remaining = limit - picked.length;

  if (remaining > 0) {
    picked.push(...other.slice(0, remaining));
  }

  if (picked.length < limit) {
    const pickedIds = new Set(picked.map((p) => p.user.id));
    const leftovers = shuffleInPlace(
      pool.filter((p) => !pickedIds.has(p.user.id))
    );
    picked.push(...leftovers.slice(0, limit - picked.length));
  }

  return shuffleInPlace(picked);
}

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

/** Random companions from anywhere — reshuffled on each request; prefers same country. */
exports.getExploreUsers = async (currentUserId, limit = EXPLORE_LIMIT) => {
  const pageSize = Math.min(Math.max(Number(limit) || EXPLORE_LIMIT, 1), 50);

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

  const blockedIds = new Set(
    (currentUser.blockedUserIds || []).map((id) => id.toString())
  );

  const candidates = await User.find({
    _id: { $ne: currentUserId },
    visibleInDiscovery: { $ne: false },
    interestsToday: { $exists: true, $not: { $size: 0 } },
    interestsTodayUpdatedAt: { $ne: null },
  }).select("-password");

  const todayInterests = currentUser.interestsToday || [];
  const viewerCountry = currentUser.location?.country || null;
  const pool = [];

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

    const profile = buildExploreProfile(
      currentUser,
      candidate,
      todayInterests
    );
    if (profile) {
      pool.push(profile);
    }
  }

  const profiles = pickExploreProfiles(pool, viewerCountry, pageSize);

  return {
    profiles,
    meta: {
      viewerCountry,
      totalEligible: pool.length,
    },
  };
};
