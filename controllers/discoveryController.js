const User = require("../models/User");
const discoveryService = require("../services/discoveryService");
const userService = require("../services/userService");
const { formatUser } = require("../utils/formatUser");

/** Optional body: { latitude, longitude } — saves location then returns nearby list. */
exports.refreshNearby = async (req, res, next) => {
  try {
    const radiusKm = req.query.radiusKm;
    const { latitude, longitude } = req.body || {};

    const userId = req.user._id.toString();

    if (latitude != null && longitude != null) {
      await userService.updateLocation(userId, req.user._id, {
        latitude,
        longitude,
      });
    }

    const result = await discoveryService.getNearbyUsers(userId, radiusKm);
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: result.profiles,
      meta: {
        origin: result.origin,
        radiusKm: result.radiusKm,
      },
      user: formatUser(user),
    });
  } catch (err) {
    next(err);
  }
};

exports.getNearby = async (req, res, next) => {
  try {
    const radiusKm = req.query.radiusKm;
    const result = await discoveryService.getNearbyUsers(
      req.user._id.toString(),
      radiusKm
    );
    res.json({
      success: true,
      data: result.profiles,
      meta: {
        origin: result.origin,
        radiusKm: result.radiusKm,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getExplore = async (req, res, next) => {
  try {
    const limit = req.query.limit;
    const result = await discoveryService.getExploreUsers(
      req.user._id.toString(),
      limit
    );
    res.json({
      success: true,
      data: result.profiles,
      meta: result.meta,
    });
  } catch (err) {
    next(err);
  }
};
