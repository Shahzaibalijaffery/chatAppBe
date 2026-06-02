const uploadService = require("../services/uploadService");

exports.createUploadUrl = async (req, res, next) => {
  try {
    const data = await uploadService.createUploadUrl(req.user._id, req.body || {});
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

