function formatLocation(user, { hideExact = false } = {}) {
  if (!user.location?.latitude) {
    return null;
  }

  if (hideExact) {
    return {
      areaName:
        user.location.areaName || user.location.city || "Nearby area",
    };
  }

  return {
    latitude: user.location.latitude,
    longitude: user.location.longitude,
    city: user.location.city || null,
    areaName: user.location.areaName || user.location.city || null,
  };
}

function formatUser(user, options = {}) {
  return {
    id: user._id.toString(),
    name: user.name,
    age: user.age,
    gender: user.gender || null,
    bio: user.bio || null,
    photos: user.photos || [],
    location: formatLocation(user, options),
    interestsToday: user.interestsToday || [],
    interestsTodayUpdatedAt: user.interestsTodayUpdatedAt
      ? user.interestsTodayUpdatedAt.toISOString()
      : null,
    interestsTodayPeriodStartedAt: user.interestsTodayPeriodStartedAt
      ? user.interestsTodayPeriodStartedAt.toISOString()
      : null,
    interestsTodayUpdateCount: user.interestsTodayUpdateCount || 0,
    visibleInDiscovery: user.visibleInDiscovery !== false,
    lastActiveAt: user.lastActiveAt
      ? user.lastActiveAt.toISOString()
      : null,
    preferences: user.preferences
      ? {
          ageRange: user.preferences.ageRange,
          maxDistance: user.preferences.maxDistance || null,
          interests: user.preferences.interests || [],
        }
      : null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

/** Public card for discovery — no exact coordinates. */
function formatPublicUser(user) {
  return formatUser(user, { hideExact: true });
}

module.exports = { formatUser, formatPublicUser, formatLocation };
