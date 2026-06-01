const { formatMessage } = require("./formatMessage");

function formatChat(chat, messages = [], lastMessage = null) {
  return {
    id: chat._id.toString(),
    participants: chat.participants.map((p) => p.toString()),
    messages: messages.map(formatMessage),
    lastMessage,
    createdAt: chat.createdAt.toISOString(),
    updatedAt: chat.updatedAt.toISOString(),
  };
}

module.exports = { formatChat };
