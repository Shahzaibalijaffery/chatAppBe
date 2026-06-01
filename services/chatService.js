const Chat = require("../models/Chat");
const Message = require("../models/Message");
const User = require("../models/User");
const { formatChat } = require("../utils/formatChat");
const { formatMessage } = require("../utils/formatMessage");
const { createError } = require("../utils/appError");
const matchService = require("./matchService");

function assertUserInChat(chat, userId) {
  const isMember = chat.participants.some(
    (participantId) => participantId.toString() === userId.toString()
  );
  if (!isMember) {
    throw createError("Not authorized to access this chat", 403);
  }
}

exports.getAllChats = async (userId) => {
  const currentUser = await User.findById(userId).select("blockedUserIds");
  const blockedIds = new Set(
    (currentUser?.blockedUserIds || []).map((id) => id.toString())
  );

  const chats = await Chat.find({ participants: userId }).sort({
    updatedAt: -1,
  });

  const visibleChats = [];
  for (const chat of chats) {
    const otherId = chat.participants.find(
      (participantId) => participantId.toString() !== userId.toString()
    );
    if (!otherId || blockedIds.has(otherId.toString())) {
      continue;
    }
    const other = await User.findById(otherId).select("blockedUserIds");
    if (
      other?.blockedUserIds?.some(
        (id) => id.toString() === userId.toString()
      )
    ) {
      continue;
    }
    visibleChats.push(chat);
  }

  if (visibleChats.length === 0) {
    return [];
  }

  const chatIds = visibleChats.map((chat) => chat._id);
  const allMessages = await Message.find({ chatId: { $in: chatIds } }).sort({
    createdAt: 1,
  });

  const messagesByChat = {};
  const lastByChat = {};
  for (const message of allMessages) {
    const chatId = message.chatId.toString();
    if (!messagesByChat[chatId]) {
      messagesByChat[chatId] = [];
    }
    messagesByChat[chatId].push(message);
    lastByChat[chatId] = message;
  }

  return visibleChats.map((chat) => {
    const chatId = chat._id.toString();
    const messages = (messagesByChat[chatId] || []).slice(-50);
    const lastMessage = lastByChat[chatId]
      ? formatMessage(lastByChat[chatId])
      : null;
    return formatChat(chat, messages, lastMessage);
  });
};

exports.getChatById = async (chatId, userId) => {
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw createError("Chat not found", 404);
  }

  assertUserInChat(chat, userId);

  const messages = await Message.find({ chatId: chat._id }).sort({
    createdAt: 1,
  });

  return formatChat(chat, messages);
};

exports.createChat = async (userId, otherUserId, currentUserId) => {
  if (!userId || !otherUserId) {
    throw createError("userId and otherUserId are required", 400);
  }

  if (userId !== currentUserId.toString()) {
    throw createError("Not authorized to create chat for this user", 403);
  }

  const accepted = await matchService.hasAcceptedMatch(userId, otherUserId);
  if (!accepted) {
    throw createError(
      "Chat is available only after your match request is accepted",
      403
    );
  }

  const existingChat = await Chat.findOne({
    participants: { $all: [userId, otherUserId] },
  });

  if (existingChat) {
    const messages = await Message.find({ chatId: existingChat._id }).sort({
      createdAt: 1,
    });
    return { chat: formatChat(existingChat, messages), created: false };
  }

  const chat = await Chat.create({
    participants: [userId, otherUserId],
  });

  return { chat: formatChat(chat, []), created: true };
};
