/**
 * Shared demo users — real names, password test1234 for all.
 * Used by seedCompanionData.js (do not auto-run from server.js).
 */

require("dotenv").config();

const CENTER_LAT = Number(process.env.SEED_LAT) || 33.7233;
const CENTER_LNG = Number(process.env.SEED_LNG) || 73.0435;

const PASSWORD = "test1234";

const COUNTRY = "Pakistan";

const DAILY_INTERESTS = [
  "cafe",
  "food",
  "hiking",
  "walking",
  "photography",
  "shopping",
  "movies",
  "gym",
  "reading",
  "music",
];

/** Old accounts to remove from DB when seeding with --clean */
const LEGACY_EMAILS = [
  "test@example.com",
  "test1@example.com",
  "test2@example.com",
  "test3@example.com",
  "test4@example.com",
  "test5@example.com",
  "ayesha.companion@test.com",
  "hassan.companion@test.com",
  "sara.companion@test.com",
  "omar.companion@test.com",
  "zainab.companion@test.com",
  "bilal.companion@test.com",
  "fatima.companion@test.com",
  "usman.companion@test.com",
  "mariam.companion@test.com",
  "danish.companion@test.com",
];

/** City centers — hundreds of km apart for Explore / distance testing */
const PAKISTAN_CITIES = [
  {
    slug: "islamabad",
    city: "Islamabad",
    lat: 33.6844,
    lng: 73.0479,
    areas: ["F-6 Markaz", "F-7", "Blue Area", "G-9"],
  },
  {
    slug: "lahore",
    city: "Lahore",
    lat: 31.5204,
    lng: 74.3587,
    areas: ["Gulberg", "DHA Phase 5", "Liberty Market", "Johar Town"],
  },
  {
    slug: "karachi",
    city: "Karachi",
    lat: 24.8607,
    lng: 67.0011,
    areas: ["Clifton", "DHA Karachi", "Saddar", "Bahria Town Karachi"],
  },
  {
    slug: "peshawar",
    city: "Peshawar",
    lat: 34.0151,
    lng: 71.5249,
    areas: ["University Town", "Hayatabad", "Saddar Peshawar", "Regi Model Town"],
  },
  {
    slug: "quetta",
    city: "Quetta",
    lat: 30.1798,
    lng: 66.975,
    areas: ["Jinnah Town", "Satellite Town", "Brewery Road", "Sariab Road"],
  },
  {
    slug: "multan",
    city: "Multan",
    lat: 30.1575,
    lng: 71.5249,
    areas: ["Gulgasht Colony", "Cantt", "Bosan Road", "Shah Rukn-e-Alam"],
  },
  {
    slug: "faisalabad",
    city: "Faisalabad",
    lat: 31.4504,
    lng: 73.135,
    areas: ["D Ground", "Susan Road", "Madina Town", "Canal Road"],
  },
  {
    slug: "hyderabad",
    city: "Hyderabad",
    lat: 25.396,
    lng: 68.3578,
    areas: ["Latifabad", "Qasimabad", "Auto Bhan Road", "Saddar Hyderabad"],
  },
  {
    slug: "gilgit",
    city: "Gilgit",
    lat: 35.9208,
    lng: 74.3144,
    areas: ["Jutial", "Konodas", "Nagar Colony", "Gilgit Bazaar"],
  },
  {
    slug: "muzaffarabad",
    city: "Muzaffarabad",
    lat: 34.37,
    lng: 73.47,
    areas: ["Upper Chattar", "Lower Chattar", "Mirpur Road", "Domel"],
  },
  {
    slug: "bahawalpur",
    city: "Bahawalpur",
    lat: 29.3956,
    lng: 71.6836,
    areas: ["Model Town BWP", "Satellite Town", "Civil Hospital Road", "DHA Bahawalpur"],
  },
  {
    slug: "sialkot",
    city: "Sialkot",
    lat: 32.4945,
    lng: 74.5229,
    areas: ["Cantt", "Paris Road", "Ugoki", "Daska Road"],
  },
  {
    slug: "skardu",
    city: "Skardu",
    lat: 35.2971,
    lng: 75.6339,
    areas: ["Skardu Bazaar", "Kharpocho", "Hussainabad", "Satpara Road"],
  },
];

const FIRST_NAMES = [
  "Ahmed",
  "Ayesha",
  "Hassan",
  "Sara",
  "Omar",
  "Zainab",
  "Bilal",
  "Fatima",
  "Usman",
  "Mariam",
  "Danish",
  "Hira",
  "Imran",
  "Nadia",
  "Kamran",
  "Sana",
  "Faisal",
  "Rabia",
  "Tariq",
  "Amna",
  "Waqas",
  "Laiba",
  "Hamza",
  "Mehwish",
  "Asad",
  "Kinza",
  "Saad",
  "Hina",
  "Babar",
  "Iqra",
  "Zeeshan",
  "Mahnoor",
  "Arslan",
  "Sadia",
  "Rizwan",
  "Anum",
  "Shahzad",
  "Eman",
  "Noman",
  "Areeba",
  "Yasir",
  "Hafsa",
  "Junaid",
  "Palwasha",
  "Adnan",
  "Sumbul",
  "Khurram",
  "Maha",
  "Salman",
  "Tooba",
  "Farhan",
  "Aleena",
];

const LAST_NAMES = [
  "Hussain",
  "Khan",
  "Ali",
  "Malik",
  "Farooq",
  "Raza",
  "Ahmed",
  "Noor",
  "Sheikh",
  "Iqbal",
  "Shah",
  "Qureshi",
  "Baig",
  "Mirza",
  "Butt",
  "Chaudhry",
  "Siddiqui",
  "Akram",
  "Haider",
  "Yousaf",
];

const BIO_TEMPLATES = [
  "Based in {area}. I post local tips — cafés, traffic, and events around {city}.",
  "Live near {area}. Usually out for walks and chai on weekends in {city}.",
  "Work in {city}, home in {area}. Happy to share what's happening nearby.",
  "Student / freelancer in {area}. I notice small city updates and share them here.",
  "Born and raised around {city}. Know the food spots in {area} pretty well.",
  "Commute through {area} daily — I'll post road and transit stuff when it's useful.",
  "Weekend explorer in {city}. Cafés, pop-ups, and gigs near {area}.",
  "Night owl in {area}. Ask me about late food in {city}.",
];

const USERS_PER_CITY = 4;
const TARGET_USER_COUNT = PAKISTAN_CITIES.length * USERS_PER_CITY;

function offsetKm(lat, lng, distanceKm, bearingDeg) {
  const R = 6371;
  const brng = (bearingDeg * Math.PI) / 180;
  const lat1 = (lat * Math.PI) / 180;
  const lng1 = (lng * Math.PI) / 180;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distanceKm / R) +
      Math.cos(lat1) * Math.sin(distanceKm / R) * Math.cos(brng)
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(distanceKm / R) * Math.cos(lat1),
      Math.cos(distanceKm / R) - Math.sin(lat1) * Math.sin(lat2)
    );
  return {
    latitude: Math.round(((lat2 * 180) / Math.PI) * 1e6) / 1e6,
    longitude: Math.round(((lng2 * 180) / Math.PI) * 1e6) / 1e6,
  };
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
}

function pickInterests(index) {
  const a = DAILY_INTERESTS[index % DAILY_INTERESTS.length];
  const b = DAILY_INTERESTS[(index + 3) % DAILY_INTERESTS.length];
  const c = DAILY_INTERESTS[(index + 6) % DAILY_INTERESTS.length];
  return [...new Set([a, b, c])];
}

function buildDemoUsers() {
  const users = [];
  let globalIndex = 0;

  for (const city of PAKISTAN_CITIES) {
    for (let i = 0; i < USERS_PER_CITY; i += 1) {
      const first = FIRST_NAMES[globalIndex % FIRST_NAMES.length];
      const last = LAST_NAMES[(globalIndex * 7) % LAST_NAMES.length];
      const name = `${first} ${last}`;
      const areaName = `${city.areas[i % city.areas.length]}, ${city.city}`;
      const bioTemplate = BIO_TEMPLATES[globalIndex % BIO_TEMPLATES.length];
      const bio = bioTemplate
        .replace("{area}", city.areas[i % city.areas.length])
        .replace("{city}", city.city);

      const isPrimary = city.slug === "islamabad" && i === 0;
      const email = isPrimary
        ? "ahmed.hussain@mychat.demo"
        : `${slugify(first)}.${slugify(last)}.${city.slug}${i + 1}@mychat.demo`;

      const jitterKm = 3 + (globalIndex % 6) * 1.25;
      const jitterBearing = (globalIndex * 47 + i * 61) % 360;

      const lastActiveAt =
        globalIndex % 5 === 0
          ? new Date(Date.now() - (globalIndex % 12) * 15 * 60 * 1000)
          : new Date();

      users.push({
        name: isPrimary ? "Ahmed Hussain" : name,
        email,
        gender: globalIndex % 2 === 0 ? "male" : "female",
        age: 22 + (globalIndex % 12),
        bio,
        photos: [
          `https://i.pravatar.cc/300?u=${slugify(email)}`,
        ],
        areaName,
        locationPin: {
          lat: city.lat,
          lng: city.lng,
          city: city.city,
          country: COUNTRY,
        },
        jitterKm,
        jitterBearing,
        interestsToday: pickInterests(globalIndex),
        lastActiveAt,
      });

      globalIndex += 1;
    }
  }

  return users;
}

const DEMO_USERS = buildDemoUsers();

function buildUserDoc(profile, today) {
  const pin = profile.locationPin;
  const { latitude, longitude } = offsetKm(
    pin?.lat ?? CENTER_LAT,
    pin?.lng ?? CENTER_LNG,
    profile.jitterKm ?? 0,
    profile.jitterBearing ?? 0
  );

  return {
    name: profile.name,
    email: profile.email,
    password: PASSWORD,
    age: profile.age,
    gender: profile.gender || "other",
    bio: profile.bio,
    photos: profile.photos,
    location: {
      latitude,
      longitude,
      city: pin?.city || "Islamabad",
      areaName: profile.areaName,
      country: pin?.country || COUNTRY,
    },
    interestsToday: profile.interestsToday,
    interestsTodayUpdatedAt: today,
    interestsTodayPeriodStartedAt: today,
    interestsTodayUpdateCount: 0,
    visibleInDiscovery: true,
    lastActiveAt: profile.lastActiveAt ?? today,
    preferences: {
      ageRange: { min: 20, max: 40 },
      maxDistance: 50,
      interests: profile.interestsToday,
    },
  };
}

module.exports = {
  CENTER_LAT,
  CENTER_LNG,
  PASSWORD,
  COUNTRY,
  LEGACY_EMAILS,
  DEMO_USERS,
  TARGET_USER_COUNT,
  PAKISTAN_CITIES,
  buildUserDoc,
  offsetKm,
};
