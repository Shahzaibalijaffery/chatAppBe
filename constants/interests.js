/** How long today's interests stay active before auto-clearing. */
const INTERESTS_TTL_HOURS = 12;
const INTERESTS_TTL_MS = INTERESTS_TTL_HOURS * 60 * 60 * 1000;

/** Max times a user may save different interests within one 12-hour window. */
const INTERESTS_MAX_UPDATES_PER_WINDOW = 2;

module.exports = {
  INTERESTS_TTL_HOURS,
  INTERESTS_TTL_MS,
  INTERESTS_MAX_UPDATES_PER_WINDOW,
};
