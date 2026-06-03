const matchService = require("../services/matchService");

exports.getMatches = async (req, res, next) => {
  try {
    const data = await matchService.getMatchesForUser(req.user._id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getMatchWithUser = async (req, res, next) => {
  try {
    const data = await matchService.getMatchBetween(
      req.user._id,
      req.params.otherUserId
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.requestChat = async (req, res, next) => {
  try {
    const { postId, otherUserId } = req.body;
    if (!postId || !otherUserId) {
      return res.status(400).json({
        success: false,
        error: "postId and otherUserId are required",
      });
    }
    const data = await matchService.requestMessageFromPost(
      req.user._id,
      postId,
      otherUserId
    );
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.respondToRequest = async (req, res, next) => {
  try {
    const { action } = req.body;
    const data = await matchService.respondToRequest(
      req.params.matchId,
      req.user._id,
      action
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
