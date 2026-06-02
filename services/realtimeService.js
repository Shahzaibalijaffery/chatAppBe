let io = null;

exports.setSocketIO = (socketIO) => {
  io = socketIO;
};

exports.emitMatchUpdate = (userId, match) => {
  if (!io || !userId || !match) return;
  io.emit(`match-update-${userId.toString()}`, { match });
};

exports.emitMatchUpdates = (userIds, match) => {
  if (!match) return;
  const seen = new Set();
  for (const id of userIds) {
    const key = id?.toString();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    exports.emitMatchUpdate(key, match);
  }
};
