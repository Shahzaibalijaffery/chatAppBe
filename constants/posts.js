/** How long a post stays visible (comments/reactions removed after). */
const POST_TTL_HOURS = 12;
const POST_TTL_MS = POST_TTL_HOURS * 60 * 60 * 1000;

const POST_CATEGORIES = [
  "cafe",
  "food",
  "traffic",
  "event",
  "alert",
  "other",
];

const DEFAULT_FEED_RADIUS_KM = 50;
const MAX_FEED_RADIUS_KM = 200;

const REACTION_TYPES = ["like", "helpful"];

module.exports = {
  POST_TTL_HOURS,
  POST_TTL_MS,
  POST_CATEGORIES,
  DEFAULT_FEED_RADIUS_KM,
  MAX_FEED_RADIUS_KM,
  REACTION_TYPES,
};
