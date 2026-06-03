const postService = require("../services/postService");
const postInteractionService = require("../services/postInteractionService");
const matchService = require("../services/matchService");

exports.createPost = async (req, res, next) => {
  try {
    const data = await postService.createPost(req.user._id, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getFeed = async (req, res, next) => {
  try {
    const result = await postService.getFeed(
      req.user._id,
      req.query.radiusKm
    );
    res.json({ success: true, data: result.posts, meta: { radiusKm: result.radiusKm } });
  } catch (err) {
    next(err);
  }
};

exports.getPostDetail = async (req, res, next) => {
  try {
    const data = await postService.getPostDetail(
      req.user._id,
      req.params.postId
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getMyPosts = async (req, res, next) => {
  try {
    const data = await postService.getMyPosts(req.user._id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const data = await postInteractionService.addComment(
      req.user._id,
      req.params.postId,
      req.body.text
    );
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.setReaction = async (req, res, next) => {
  try {
    const data = await postInteractionService.setReaction(
      req.user._id,
      req.params.postId,
      req.body.type
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.removeReaction = async (req, res, next) => {
  try {
    const data = await postInteractionService.removeReaction(
      req.user._id,
      req.params.postId
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.requestMessage = async (req, res, next) => {
  try {
    const { otherUserId } = req.body;
    const data = await matchService.requestMessageFromPost(
      req.user._id,
      req.params.postId,
      otherUserId
    );
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
