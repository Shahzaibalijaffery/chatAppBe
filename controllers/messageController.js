const messageService = require("../services/messageService");

exports.sendMessage = async (req, res, next) => {
  try {
    const data = await messageService.sendMessage(
      req.params.chatId,
      req.user._id,
      req.body
    );
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.markMessagesAsRead = async (req, res, next) => {
  try {
    const result = await messageService.markMessagesAsRead(
      req.params.chatId,
      req.user._id,
      req.body.userId
    );
    res.json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
};
