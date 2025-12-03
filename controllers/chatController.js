const Chat = require("../models/Chat");
const Message = require("../models/Message");

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

// Helper function to format chat response
const formatChatResponse = (chat, messages = [], lastMessage = null) => {
  return {
    id: chat._id.toString(),
    participants: chat.participants.map((p) => p.toString()),
    messages: messages.map(formatMessageResponse),
    lastMessage: lastMessage,
    createdAt: chat.createdAt.toISOString(),
    updatedAt: chat.updatedAt.toISOString(),
  };
};

// @desc    Get all chats for a user
// @route   GET /api/chats?userId=user-123
// @access  Private
exports.getAllChats = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId || userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to access these chats",
      });
    }

    // Find all chats where user is a participant
    const chats = await Chat.find({
      participants: req.user._id,
    }).sort({ updatedAt: -1 });

    // Get messages for each chat (limit to last 50) and last message
    const chatsWithMessages = await Promise.all(
      chats.map(async (chat) => {
        const messages = await Message.find({ chatId: chat._id })
          .sort({ createdAt: 1 })
          .limit(50);

        // Get the last message for the chat list
        const lastMsg = await Message.findOne({ chatId: chat._id })
          .sort({ createdAt: -1 })
          .limit(1);

        const lastMessage = lastMsg ? formatMessageResponse(lastMsg) : null;

        return formatChatResponse(chat, messages, lastMessage);
      })
    );

    res.json({
      success: true,
      data: chatsWithMessages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get single chat by ID
// @route   GET /api/chats/:chatId
// @access  Private
exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: "Chat not found",
      });
    }

    // Check if user is part of the chat
    const isUserInChat = chat.participants.some(
      (participantId) => participantId.toString() === req.user._id.toString()
    );

    if (!isUserInChat) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to access this chat",
      });
    }

    // Get messages for the chat
    const messages = await Message.find({ chatId: chat._id }).sort({
      createdAt: 1,
    });

    res.json({
      success: true,
      data: formatChatResponse(chat, messages),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Create chat
// @route   POST /api/chats
// @access  Private
exports.createChat = async (req, res) => {
  try {
    const { userId, otherUserId } = req.body;

    if (!userId || !otherUserId) {
      return res.status(400).json({
        success: false,
        error: "userId and otherUserId are required",
      });
    }

    // Ensure user can only create chats for themselves
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to create chat for this user",
      });
    }

    // Check if chat already exists between these two users
    const existingChat = await Chat.findOne({
      participants: { $all: [userId, otherUserId] },
    });

    if (existingChat) {
      const messages = await Message.find({ chatId: existingChat._id }).sort({
        createdAt: 1,
      });

      return res.json({
        success: true,
        data: formatChatResponse(existingChat, messages),
      });
    }

    // Create new chat
    const chat = await Chat.create({
      participants: [userId, otherUserId],
    });

    res.status(201).json({
      success: true,
      data: formatChatResponse(chat, []),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
