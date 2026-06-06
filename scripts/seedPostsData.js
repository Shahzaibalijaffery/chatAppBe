/**
 * Realistic local post copy — keyed by city slug.
 * Placeholders: {area}, {city}
 */

const POST_POOL = {
  islamabad: [
    { category: "cafe", text: "New specialty coffee bar opened in {area} — single-origin pour-over and outdoor seating. Worth a visit." },
    { category: "food", text: "Street burger cart near {area} is back tonight. Long queue but portions are huge." },
    { category: "traffic", text: "Slow traffic on Kashmir Highway toward {area}. Add 20–25 min if you're heading that way." },
    { category: "event", text: "Open mic night at a café in {area} this Friday, 8pm. No cover charge." },
    { category: "alert", text: "Short power dip in {area} — lights flickered twice. Generator noise on some streets." },
    { category: "cafe", text: "Work-friendly spot in {area}: quiet upstairs, decent Wi‑Fi, plugs at every table." },
    { category: "traffic", text: "Road resurfacing near {area} — one lane closed until evening. Bikes weaving through." },
    { category: "event", text: "Weekend book swap in {area} park, 4–7pm. Bring one book, leave with another." },
    { category: "food", text: "Chai dhaba in {area} started serving paratha breakfast after 6am — solid and cheap." },
    { category: "other", text: "Margalla trail entrance from {area} side is muddy after last night's rain. Wear proper shoes." },
    { category: "alert", text: "Water tanker blocking the narrow lane in {area} — cars reversing for 10 minutes." },
    { category: "cafe", text: "Matcha soft serve pop-up in {area} today only — small cup is enough." },
    { category: "food", text: "Home baker in {area} selling cinnamon rolls after 4pm — pre-order on WhatsApp." },
    { category: "event", text: "Free yoga session on the {area} community lawn, Saturday 7am. Bring a mat." },
    { category: "traffic", text: "School pickup chaos near {area} between 1:30–2:15pm. Avoid if you can." },
    { category: "other", text: "Lost cat poster up near {area} mosque — grey tabby, very friendly." },
    { category: "alert", text: "Gas smell reported on one street in {area} — utility crew already on site." },
    { category: "food", text: "New desi brunch spot in {area} — karahi and fresh naan, opens at 10am." },
  ],
  lahore: [
    { category: "food", text: "Nihari stall in {area} was packed at sehri time. They ran out by 4:15am." },
    { category: "traffic", text: "Canal Road toward {area} jammed — school rush plus wedding season." },
    { category: "event", text: "Qawwali evening advertised in {area} tomorrow. Tickets at the gate only." },
    { category: "cafe", text: "Dessert café in {area} doing buy-one-get-one on weekdays till Eid." },
    { category: "alert", text: "Smog heavy around {area} this morning. Visibility low on bike." },
    { category: "food", text: "New BBQ joint in {area} — try the malai boti, skip the fries." },
  ],
  karachi: [
    { category: "traffic", text: "Sea View road near {area} congested — weekend families plus food trucks." },
    { category: "alert", text: "Humid and hazy in {area}. Stay hydrated if you're out all day." },
    { category: "food", text: "Biryani home chef taking orders in {area} — DM for menu card photo." },
    { category: "event", text: "Beach cleanup meetup {area} Sunday 7am. Bags and gloves provided." },
    { category: "other", text: "Fishing boats back at {area} jetty — fresh catch sold by 9am." },
  ],
  peshawar: [
    { category: "food", text: "Chapli kebab spot in {area} reopened after Eid holidays. Cash only." },
    { category: "traffic", text: "University Road near {area} — diversions for pipe work till Thursday." },
    { category: "event", text: "Cricket screening in {area} tonight if Pakistan plays — projector at the plaza." },
  ],
  quetta: [
    { category: "alert", text: "Cool evening in {area} — jacket weather after 7pm." },
    { category: "food", text: "Sajji house in {area} taking pre-orders for Sunday family trays." },
    { category: "traffic", text: "Brewery Road patchy near {area}. Go slow over the speed bumps." },
  ],
  multan: [
    { category: "food", text: "Mango season starting — best cart in {area} had Sindhri today." },
    { category: "event", text: "Shrine area in {area} crowded for Thursday night. Plan parking early." },
  ],
  faisalabad: [
    { category: "traffic", text: "Susan Road gridlock near {area}. Rickshaws blocking the U-turn." },
    { category: "food", text: "Samosa shop in {area} frying fresh at 5pm — still warm at the counter." },
  ],
  hyderabad: [
    { category: "food", text: "Palla fish fry famous stall in {area} — line moves fast though." },
    { category: "alert", text: "Warm breeze from the river side in {area} all afternoon." },
  ],
  gilgit: [
    { category: "event", text: "Cherry blossom walk starting near {area} this week — mornings are best." },
    { category: "other", text: "Road to {area} clear today. Tourist vans parking along the bazaar." },
  ],
  muzaffarabad: [
    { category: "alert", text: "Light rain in {area} — roads slick on the hill bends." },
    { category: "food", text: "Kashmiri chai and kulcha combo in {area} — small shop by the bridge." },
  ],
  bahawalpur: [
    { category: "event", text: "Heritage walk in old {area} quarter Saturday 10am. Local guide, tips appreciated." },
    { category: "food", text: "Mithai shop in {area} taking orders for boxes — call before you drive over." },
  ],
  sialkot: [
    { category: "traffic", text: "Export zone traffic spilling into {area} after shift change at 2pm." },
    { category: "food", text: "Fish shop in {area} — Friday only, sold out by 1pm last week." },
  ],
  skardu: [
    { category: "event", text: "Clear skies over {area} — good day for Satpara lake trip." },
    { category: "other", text: "Tourist season picking up in {area}. Hotels filling on weekends." },
  ],
};

const COMMENT_LINES = [
  "Thanks for the heads-up, saved me a detour.",
  "Can you share the exact spot?",
  "Was just there — can confirm.",
  "Still open as of 20 minutes ago.",
  "Any idea till what time?",
  "Appreciate the local update.",
  "We need more posts like this in the area.",
  "Is parking easy nearby?",
];

function fill(text, area, city) {
  return text.replace(/\{area\}/g, area).replace(/\{city\}/g, city);
}

function seededShuffle(items, seed) {
  const arr = items.slice();
  let state = (seed >>> 0) || 1;
  for (let i = arr.length - 1; i > 0; i -= 1) {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    const j = state % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function postsPerUserForCity(citySlug) {
  if (citySlug === "islamabad") {
    return 3;
  }
  if (citySlug === "lahore" || citySlug === "karachi") {
    return 2;
  }
  return 1;
}

const PHOTO_CATEGORY_PREFIX = {
  cafe: "cafe",
  food: "food",
  traffic: "road",
  event: "event",
  alert: "alert",
  other: "local",
};

/** ~60% of seeded posts get 1–2 placeholder photos; rest stay text-only. */
function seedPostPhotos(category, photoSeed) {
  if (photoSeed % 5 >= 3) {
    return [];
  }

  const prefix = PHOTO_CATEGORY_PREFIX[category] || "local";
  const slug = `mychat-${prefix}-${photoSeed}`;
  const photos = [`https://picsum.photos/seed/${slug}/800/600`];

  if (photoSeed % 6 === 0) {
    photos.push(`https://picsum.photos/seed/${slug}-b/800/600`);
  }

  return photos;
}

/**
 * Plan varied posts for all demo users.
 * @param {Array} users — mongoose user docs with location + email
 * @param {(user: object) => string} getCitySlug
 * @param {number} refreshSeed — changes each 12h refresh so copy rotates
 */
function planFeedPosts(users, getCitySlug, refreshSeed = 0) {
  const sorted = [...users].sort((a, b) =>
    String(a.email || "").localeCompare(String(b.email || ""))
  );

  const byCity = new Map();
  for (let i = 0; i < sorted.length; i += 1) {
    const user = sorted[i];
    const slug = getCitySlug(user);
    if (!byCity.has(slug)) {
      byCity.set(slug, []);
    }
    byCity.get(slug).push({ user, globalIndex: i });
  }

  const planned = [];

  for (const [citySlug, group] of byCity.entries()) {
    const pool = POST_POOL[citySlug] || POST_POOL.islamabad;
    const perUser = postsPerUserForCity(citySlug);
    const citySeed =
      refreshSeed +
      citySlug.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

    const shuffled = seededShuffle(
      pool.map((template, poolIndex) => ({ ...template, poolIndex })),
      citySeed
    );

    const globalUsedTexts = new Set();
    let cursor = 0;

    for (const { user, globalIndex } of group) {
      const area = (user.location?.areaName || user.location?.city || "Nearby")
        .split(",")[0]
        .trim();
      const city = user.location?.city || "Islamabad";
      const usedCategories = new Set();

      for (let n = 0; n < perUser; n += 1) {
        let picked = null;

        for (let attempt = 0; attempt < shuffled.length; attempt += 1) {
          const candidate = shuffled[(cursor + attempt) % shuffled.length];
          const textKey = candidate.text;

          if (globalUsedTexts.has(textKey)) {
            continue;
          }
          if (
            usedCategories.has(candidate.category) &&
            usedCategories.size < 6 &&
            attempt < shuffled.length - 1
          ) {
            continue;
          }

          picked = candidate;
          cursor = (cursor + attempt + 1) % shuffled.length;
          globalUsedTexts.add(textKey);
          usedCategories.add(candidate.category);
          break;
        }

        if (!picked) {
          picked = shuffled[cursor % shuffled.length];
          cursor += 1;
        }

        planned.push({
          user,
          citySlug,
          category: picked.category,
          text: fill(picked.text, area, city),
          hoursAgo: 1 + ((globalIndex + n + refreshSeed) % 11),
          photos: seedPostPhotos(
            picked.category,
            globalIndex * 17 + refreshSeed * 31 + picked.poolIndex + n * 7
          ),
        });
      }
    }
  }

  return planned;
}

/** @deprecated Use planFeedPosts for batch seeding. */
function postsForProfile(citySlug, area, city, userIndex, refreshSeed = 0) {
  const stubUser = {
    email: `seed.${userIndex}@mychat.demo`,
    location: { areaName: area, city },
  };
  return planFeedPosts(
    [stubUser],
    () => citySlug,
    refreshSeed + userIndex
  ).map(({ category, text, hoursAgo, photos }) => ({
    category,
    text,
    hoursAgo,
    photos: photos || [],
  }));
}

module.exports = {
  POST_POOL,
  COMMENT_LINES,
  postsForProfile,
  planFeedPosts,
  postsPerUserForCity,
  seedPostPhotos,
  fill,
};
