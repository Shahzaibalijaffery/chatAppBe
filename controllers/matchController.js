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
    const { otherUserId } = req.body;
    const data = await matchService.requestChat(req.user._id, otherUserId);
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
