const crypto = require("crypto");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { createError } = require("../utils/appError");

const ALLOWED_KINDS = new Set([
  "profile-image",
  "message-image",
  "voice-message",
]);

const KIND_TO_CONTENT_PREFIX = {
  "profile-image": "image/",
  "message-image": "image/",
  "voice-message": "audio/",
};

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw createError(`${name} is missing`, 500);
  }
  return value;
}

function getR2Config() {
  return {
    accountId: requireEnv("R2_ACCOUNT_ID"),
    accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    bucketName: requireEnv("R2_BUCKET_NAME"),
    publicBaseUrl: requireEnv("R2_PUBLIC_BASE_URL"),
  };
}

function getClient(accountId, accessKeyId, secretAccessKey) {
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function sanitizeExtension(ext) {
  if (!ext) return "";
  const cleaned = ext.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!cleaned) return "";
  return `.${cleaned.slice(0, 8)}`;
}

function buildObjectKey(kind, userId, extension) {
  const suffix = crypto.randomBytes(12).toString("hex");
  const safeExt = sanitizeExtension(extension);
  return `${kind}/${userId}/${Date.now()}-${suffix}${safeExt}`;
}

exports.createUploadUrl = async (userId, { kind, contentType, extension }) => {
  if (!ALLOWED_KINDS.has(kind)) {
    throw createError("Unsupported upload kind", 400);
  }
  if (!contentType) {
    throw createError("contentType is required", 400);
  }

  const expectedPrefix = KIND_TO_CONTENT_PREFIX[kind];
  if (!contentType.startsWith(expectedPrefix)) {
    throw createError(`contentType must start with ${expectedPrefix}`, 400);
  }

  const { accountId, accessKeyId, secretAccessKey, bucketName, publicBaseUrl } =
    getR2Config();

  const key = buildObjectKey(kind, userId.toString(), extension);
  const client = getClient(accountId, accessKeyId, secretAccessKey);

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: 60 * 5,
  });
  const fileUrl = `${publicBaseUrl.replace(/\/$/, "")}/${key}`;

  return { uploadUrl, fileUrl, key, expiresInSeconds: 300 };
};
