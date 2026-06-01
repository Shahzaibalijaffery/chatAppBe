const userService = require("../services/userService");

exports.getAllUsers = async (req, res, next) => {
  try {
    const data = await userService.getAllUsers(req.user._id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.touchActive = async (req, res, next) => {
  try {
    await userService.touchLastActive(req.user._id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.getPublicUser = async (req, res, next) => {
  try {
    const data = await userService.getPublicUser(
      req.user._id,
      req.params.userId
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.updateMyLocation = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const data = await userService.updateLocation(userId, req.user._id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.updateLocation = async (req, res, next) => {
  try {
    const data = await userService.updateLocation(
      req.params.userId,
      req.user._id,
      req.body
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.blockUser = async (req, res, next) => {
  try {
    await userService.blockUser(req.user._id, req.params.targetUserId);
    res.json({ success: true, message: "User blocked" });
  } catch (err) {
    next(err);
  }
};

exports.reportUser = async (req, res, next) => {
  try {
    await userService.reportUser(
      req.user._id,
      req.params.targetUserId,
      req.body.reason
    );
    res.json({ success: true, message: "Report submitted" });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const data = await userService.updateUser(
      req.params.userId,
      req.user._id,
      req.body
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
