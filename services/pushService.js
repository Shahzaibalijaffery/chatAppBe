const admin = require("firebase-admin");
const User = require("../models/User");

let enabled = false;

function initFirebaseAdmin() {
  if (enabled) return true;

  const jsonPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const jsonInline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  try {
    if (jsonInline) {
      const credentials = JSON.parse(jsonInline);
      admin.initializeApp({ credential: admin.credential.cert(credentials) });
      enabled = true;
      return true;
    }
    if (jsonPath) {
      const fs = require("fs");
      const credentials = JSON.parse(
        fs.readFileSync(jsonPath, { encoding: "utf8" })
      );
      admin.initializeApp({ credential: admin.credential.cert(credentials) });
      enabled = true;
      return true;
    }
  } catch (err) {
    console.warn("[push] Firebase Admin init failed:", err.message);
  }

  return false;
}

async function getTokensForUser(userId) {
  const user = await User.findById(userId).select("fcmTokens");
  if (!user?.fcmTokens?.length) return [];
  return user.fcmTokens.map((entry) => entry.token).filter(Boolean);
}

async function removeInvalidTokens(userId, tokensToRemove) {
  if (!tokensToRemove.length) return;
  await User.updateOne(
    { _id: userId },
    { $pull: { fcmTokens: { token: { $in: tokensToRemove } } } }
  );
}

async function sendToUser(userId, { title, body, data }) {
  if (!initFirebaseAdmin()) {
    console.warn("[push] Firebase Admin not initialized (missing env/credentials?)");
    return;
  }

  const tokens = await getTokensForUser(userId);
  if (!tokens.length) {
    console.warn("[push] No FCM tokens for user", userId?.toString?.() || userId);
    return;
  }

  const payload = {
    tokens,
    notification: { title, body },
    data: Object.fromEntries(
      Object.entries(data || {}).map(([key, value]) => [
        key,
        value == null ? "" : String(value),
      ])
    ),
    android: {
      priority: "high",
      notification: { channelId: "messages" },
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
        },
      },
    },
  };

  try {
    const result = await admin.messaging().sendEachForMulticast(payload);
    const stale = [];
    result.responses.forEach((response, index) => {
      if (
        !response.success &&
        response.error?.code === "messaging/registration-token-not-registered"
      ) {
        stale.push(tokens[index]);
      }
    });
    await removeInvalidTokens(userId, stale);
  } catch (err) {
    console.warn("[push] send failed:", err.message);
  }
}

exports.notifyNewMessage = async (
  recipientId,
  { chatId, senderId, senderName, preview }
) => {
  const title = senderName || "New message";
  const body =
    preview && preview.length > 120 ? `${preview.slice(0, 117)}...` : preview;

  await sendToUser(recipientId, {
    title,
    body: body || "You have a new message",
    data: {
      type: "message",
      chatId,
      senderId,
      matchId: "",
    },
  });
};

exports.notifyChatRequest = async (
  recipientId,
  { matchId, fromUserId, fromName }
) => {
  await sendToUser(recipientId, {
    title: "Chat request",
    body: `${fromName || "Someone"} wants to chat with you`,
    data: {
      type: "request",
      matchId,
      fromUserId,
    },
  });
};
