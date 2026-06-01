const { ONLINE_THRESHOLD_MS } = require("../constants/presence");

function buildPresence(lastActiveAt) {
  if (!lastActiveAt) {
    return { isOnline: false, lastActiveAt: null };
  }

  const last = new Date(lastActiveAt);
  const ms = last.getTime();
  if (Number.isNaN(ms)) {
    return { isOnline: false, lastActiveAt: null };
  }

  const isOnline = Date.now() - ms < ONLINE_THRESHOLD_MS;

  return {
    isOnline,
    lastActiveAt: last.toISOString(),
  };
}

module.exports = { buildPresence };
