const mongoose = require("mongoose");
const User = require("../models/User");
const Report = require("../models/Report");
const { formatUser } = require("../utils/formatUser");
const { reverseGeocode } = require("../utils/geocode");
const { createError } = require("../utils/appError");
const {
  expireAllStaleInterests,
  expireUserInterestsIfStale,
} = require("../utils/userActivity");
const { buildInterestsTodayUpdate } = require("../utils/interestsUpdate");

exports.touchLastActive = async (userId) => {
  if (mongoose.connection.readyState !== 1) {
    return;
  }
  await User.updateOne({ _id: userId }, { $set: { lastActiveAt: new Date() } });
};

exports.getPublicUser = async (currentUserId, targetUserId) => {
  if (currentUserId.toString() === targetUserId.toString()) {
    throw createError("User not found", 404);
  }

  const currentUser = await User.findById(currentUserId).select("blockedUserIds");
  const blocked = new Set(
    (currentUser?.blockedUserIds || []).map((id) => id.toString())
  );

  if (blocked.has(targetUserId.toString())) {
    throw createError("User not found", 404);
  }

  let user = await User.findById(targetUserId).select("-password");
  if (!user) {
    throw createError("User not found", 404);
  }

  if (
    user.blockedUserIds?.some((id) => id.toString() === currentUserId.toString())
  ) {
    throw createError("User not found", 404);
  }

  user = await expireUserInterestsIfStale(user);

  const { buildPresence } = require("../utils/presence");
  const formatted = formatUser(user, { hideExact: true });
  return { ...formatted, presence: buildPresence(user.lastActiveAt) };
};

exports.getAllUsers = async (currentUserId) => {
  await expireAllStaleInterests();

  const currentUser = await User.findById(currentUserId).select("blockedUserIds");
  const blocked = new Set(
    (currentUser?.blockedUserIds || []).map((id) => id.toString())
  );

  const users = await User.find({ _id: { $ne: currentUserId } })
    .select("-password")
    .sort({ createdAt: -1 });

  return users
    .filter(
      (user) =>
        !blocked.has(user._id.toString()) &&
        !user.blockedUserIds?.some((id) => id.toString() === currentUserId.toString())
    )
    .map((user) => formatUser(user, { hideExact: true }));
};

exports.updateUser = async (userId, currentUserId, updates) => {
  if (userId.toString() !== currentUserId.toString()) {
    throw createError("Not authorized to update this profile", 403);
  }

  const allowed = [
    "name",
    "age",
    "gender",
    "bio",
    "photos",
    "location",
    "preferences",
    "interestsToday",
    "visibleInDiscovery",
  ];
  const updateData = {};
  for (const key of allowed) {
    if (key === "interestsToday") {
      continue;
    }
    if (updates[key] !== undefined) {
      updateData[key] = updates[key];
    }
  }

  if (updates.interestsToday !== undefined) {
    let existing = await User.findById(userId);
    if (!existing) {
      throw createError("User not found", 404);
    }
    existing = await expireUserInterestsIfStale(existing);
    const interestsPatch = buildInterestsTodayUpdate(
      existing,
      updates.interestsToday
    );
    Object.assign(updateData, interestsPatch);
  }

  if (updates.location?.latitude != null && updates.location?.longitude != null) {
    const areaName = await reverseGeocode(
      updates.location.latitude,
      updates.location.longitude
    );
    updateData.location = {
      ...updates.location,
      areaName: areaName || updates.location.areaName || updates.location.city,
      city: updates.location.city || areaName,
    };
  }

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw createError("User not found", 404);
  }

  return formatUser(user);
};

exports.updateLocation = async (userId, currentUserId, { latitude, longitude }) => {
  if (userId.toString() !== currentUserId.toString()) {
    throw createError("Not authorized", 403);
  }

  if (latitude == null || longitude == null) {
    throw createError("latitude and longitude are required", 400);
  }

  const lat = Number(latitude);
  const lng = Number(longitude);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    throw createError("Invalid latitude or longitude", 400);
  }

  let areaName = null;
  try {
    areaName = await Promise.race([
      reverseGeocode(lat, lng),
      new Promise((resolve) => setTimeout(() => resolve(null), 4000)),
    ]);
  } catch {
    areaName = null;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      location: {
        latitude: lat,
        longitude: lng,
        areaName: areaName || "Nearby area",
        city: areaName || "Nearby area",
      },
    },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw createError("User not found", 404);
  }

  return formatUser(user);
};

exports.blockUser = async (currentUserId, targetUserId) => {
  if (currentUserId.toString() === targetUserId.toString()) {
    throw createError("Cannot block yourself", 400);
  }

  await User.findByIdAndUpdate(currentUserId, {
    $addToSet: { blockedUserIds: targetUserId },
  });

  return { success: true };
};

exports.reportUser = async (currentUserId, targetUserId, reason) => {
  if (currentUserId.toString() === targetUserId.toString()) {
    throw createError("Cannot report yourself", 400);
  }

  if (!reason?.trim()) {
    throw createError("Report reason is required", 400);
  }

  await Report.create({
    reporterId: currentUserId,
    reportedUserId: targetUserId,
    reason: reason.trim(),
  });

  return { success: true };
};
