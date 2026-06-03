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

function postsForProfile(citySlug, area, city, userIndex) {
  const pool = POST_POOL[citySlug] || POST_POOL.islamabad;
  const extra = citySlug === "islamabad" ? 2 : citySlug === "lahore" || citySlug === "karachi" ? 1 : 0;
  const count = 1 + extra;
  const posts = [];
  const used = new Set();

  for (let n = 0; n < count; n += 1) {
    let idx = (userIndex * 3 + n * 5) % pool.length;
    while (used.has(idx)) {
      idx = (idx + 1) % pool.length;
    }
    used.add(idx);
    const template = pool[idx];
    const hoursAgo = 1 + ((userIndex + n) % 10);
    posts.push({
      category: template.category,
      text: fill(template.text, area, city),
      hoursAgo,
    });
  }

  return posts;
}

module.exports = {
  POST_POOL,
  COMMENT_LINES,
  postsForProfile,
  fill,
};
