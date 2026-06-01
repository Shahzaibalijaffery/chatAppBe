const chatService = require("../services/chatService");

exports.getAllChats = async (req, res, next) => {
  try {
    const data = await chatService.getAllChats(req.user._id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getChatById = async (req, res, next) => {
  try {
    const data = await chatService.getChatById(
      req.params.chatId,
      req.user._id
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.createChat = async (req, res, next) => {
  try {
    const { userId, otherUserId } = req.body;
    const { chat, created } = await chatService.createChat(
      userId,
      otherUserId,
      req.user._id
    );
    res.status(created ? 201 : 200).json({ success: true, data: chat });
  } catch (err) {
    next(err);
  }
};
