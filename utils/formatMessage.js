function formatMessage(message) {
  return {
    id: message._id.toString(),
    chatId: message.chatId.toString(),
    senderId: message.senderId.toString(),
    text: message.text,
    type: message.type,
    createdAt: message.createdAt.toISOString(),
    readAt: message.readAt ? message.readAt.toISOString() : null,
    imageUrl: message.imageUrl || null,
    audioUrl: message.audioUrl || null,
  };
}

module.exports = { formatMessage };
