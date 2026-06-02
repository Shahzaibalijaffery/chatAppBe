const Message = require("../models/Message");
const Chat = require("../models/Chat");
const { formatMessage } = require("../utils/formatMessage");
const { createError } = require("../utils/appError");
const matchService = require("./matchService");
const pushService = require("./pushService");
const User = require("../models/User");

let io;

exports.setSocketIO = (socketIO) => {
  io = socketIO;
};

function assertUserInChat(chat, userId) {
  const isMember = chat.participants.some(
    (participantId) => participantId.toString() === userId.toString(),
  );
  if (!isMember) {
    throw createError("Not authorized to access this chat", 403);
  }
}

async function getChatForUser(chatId, userId) {
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw createError("Chat not found", 404);
  }
  assertUserInChat(chat, userId);
  return chat;
}

function emitMessageEvents(chatId, message, updatedChat) {
  if (!io) return;

  const formattedMessage = formatMessage(message);
  io.to(chatId.toString()).emit("receive-message", formattedMessage);

  const chatUpdate = {
    chatId: chatId.toString(),
    lastMessage: formattedMessage,
    updatedAt: updatedChat.updatedAt.toISOString(),
  };

  updatedChat.participants.forEach((participantId) => {
    io.emit(`chat-update-${participantId.toString()}`, chatUpdate);
  });
}

exports.sendMessage = async (
  chatId,
  userId,
  { senderId, text, type, imageUrl, audioUrl },
) => {
  if (!senderId || !text || !type) {
    throw createError("senderId, text, and type are required", 400);
  }

  if (senderId !== userId.toString()) {
    throw createError("Not authorized to send message as this user", 403);
  }

  if (!["text", "image", "voice", "system"].includes(type)) {
    throw createError(
      'Type must be "text", "image", "voice", or "system"',
      400,
    );
  }

  if (type === "image" && !imageUrl) {
    throw createError("imageUrl is required for image messages", 400);
  }
  if (type === "voice" && !audioUrl) {
    throw createError("audioUrl is required for voice messages", 400);
  }

  const chat = await getChatForUser(chatId, userId);
  const otherParticipantId = chat.participants.find(
    (participantId) => participantId.toString() !== userId.toString(),
  );
  if (otherParticipantId) {
    await matchService.assertNotBlocked(userId, otherParticipantId);
  }

  const message = await Message.create({
    chatId,
    senderId: userId,
    text,
    type,
    imageUrl: imageUrl || null,
    audioUrl: audioUrl || null,
    readAt: null,
  });

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { updatedAt: new Date() },
    { new: true },
  );

  emitMessageEvents(chatId, message, updatedChat);

  if (otherParticipantId && type !== "system") {
    const sender = await User.findById(userId).select("name");
    const preview =
      type === "image" ? "Sent a photo" : String(text).slice(0, 200);
    pushService
      .notifyNewMessage(otherParticipantId, {
        chatId: chatId.toString(),
        senderId: userId.toString(),
        senderName: sender?.name || "Someone",
        preview,
      })
      .catch((err) => {
        console.warn("[push] notifyNewMessage error:", err?.message || err);
      });
  }

  return formatMessage(message);
};

exports.markMessagesAsRead = async (chatId, userId, bodyUserId) => {
  if (!bodyUserId) {
    throw createError("userId is required", 400);
  }

  if (bodyUserId !== userId.toString()) {
    throw createError(
      "Not authorized to mark messages as read for this user",
      403,
    );
  }

  await getChatForUser(chatId, userId);

  await Message.updateMany(
    {
      chatId,
      senderId: { $ne: userId },
      readAt: null,
    },
    { readAt: new Date() },
  );

  return { message: "Messages marked as read" };
};
