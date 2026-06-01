const authService = require("../services/authService");

exports.register = async (req, res, next) => {
  try {
    const { user, token } = await authService.register(req.body);
    res.status(201).json({ success: true, data: user, token });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body);
    res.json({ success: true, data: user, token });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const data = await authService.getUserById(req.user._id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};
