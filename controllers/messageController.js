const Message = require("../models/Message");
const Chat = require("../models/Chat");

// Get Socket.io instance
let io;
module.exports.setSocketIO = (socketIO) => {
  io = socketIO;
};

// Helper function to format message response
const formatMessageResponse = (message) => {
  return {
    id: message._id.toString(),
    chatId: message.chatId.toString(),
    senderId: message.senderId.toString(),
    text: message.text,
    type: message.type,
    createdAt: message.createdAt.toISOString(),
    readAt: message.readAt ? message.readAt.toISOString() : null,
    imageUrl: message.imageUrl || null,
  };
};

// @desc    Send a message
// @route   POST /api/chats/:chatId/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { senderId, text, type, imageUrl } = req.body;

    if (!senderId || !text || !type) {
      return res.status(400).json({
        success: false,
        error: "senderId, text, and type are required",
      });
    }

    // Ensure user can only send messages as themselves
    if (senderId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to send message as this user",
      });
    }

    // Validate type
    if (!["text", "image", "system"].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type must be "text", "image", or "system"',
      });
    }

    // For image messages, imageUrl is required
    if (type === "image" && !imageUrl) {
      return res.status(400).json({
        success: false,
        error: "imageUrl is required for image messages",
      });
    }

    // Check if chat exists and user is part of it
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        error: "Chat not found",
      });
    }

    const isUserInChat = chat.participants.some(
      (participantId) => participantId.toString() === req.user._id.toString()
    );

    if (!isUserInChat) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to send message to this chat",
      });
    }

    // Create message
    const message = await Message.create({
      chatId,
      senderId: req.user._id,
      text,
      type,
      imageUrl: imageUrl || null,
      readAt: null,
    });

    // Update chat's updatedAt timestamp
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        updatedAt: new Date(),
      },
      { new: true }
    );

    // Emit message via Socket.io for real-time delivery
    if (io) {
      const formattedMessage = formatMessageResponse(message);

      // Emit message to all participants in the chat room
      io.to(chatId.toString()).emit("receive-message", formattedMessage);

      // Emit chat update event to all participants so their chat list updates
      // This includes the last message info
      const chatUpdate = {
        chatId: chatId.toString(),
        lastMessage: formattedMessage,
        updatedAt: updatedChat.updatedAt.toISOString(),
      };

      // Emit to all participants so their chat lists update
      updatedChat.participants.forEach((participantId) => {
        io.emit(`chat-update-${participantId.toString()}`, chatUpdate);
      });
    }

    res.status(201).json({
      success: true,
      data: formatMessageResponse(message),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Mark messages as read
// @route   POST /api/chats/:chatId/read
// @access  Private
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "userId is required",
      });
    }

    // Ensure user can only mark messages as read for themselves
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to mark messages as read for this user",
      });
    }

    // Check if chat exists and user is part of it
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        error: "Chat not found",
      });
    }

    const isUserInChat = chat.participants.some(
      (participantId) => participantId.toString() === req.user._id.toString()
    );

    if (!isUserInChat) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to access this chat",
      });
    }

    // Mark all unread messages as read (only messages sent by other users)
    await Message.updateMany(
      {
        chatId,
        senderId: { $ne: req.user._id },
        readAt: null,
      },
      {
        readAt: new Date(),
      }
    );

    res.json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
