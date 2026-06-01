/**
 * Shared demo users — real names, password test1234 for all.
 * Used by seedCompanionData.js (do not auto-run from server.js).
 */

require("dotenv").config();

const CENTER_LAT = Number(process.env.SEED_LAT) || 33.7233;
const CENTER_LNG = Number(process.env.SEED_LNG) || 73.0435;

const PASSWORD = "test1234";

/** Old accounts to remove from DB when seeding */
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

/** Demo users near Islamabad — email: firstname.lastname@mychat.demo */
const DEMO_USERS = [
  {
    name: "Ahmed Hussain",
    email: "ahmed.hussain@mychat.demo",
    gender: "male",
    age: 26,
    lastActiveAt: new Date(),
    bio: "Local explorer — café hops and evening walks in Islamabad.",
    photos: ["https://i.pravatar.cc/300?u=ahmedhussain"],
    areaName: "F-6 Markaz, Islamabad",
    offset: { km: 0, bearing: 0 },
    interestsToday: ["cafe", "food", "walking"],
  },
  {
    name: "Ayesha Khan",
    email: "ayesha.khan@mychat.demo",
    gender: "female",
    age: 24,
    bio: "Coffee walks and weekend hikes around the city.",
    photos: ["https://i.pravatar.cc/300?u=ayeshakhan"],
    areaName: "F-6, Islamabad",
    offset: { km: 2.2, bearing: 45 },
    interestsToday: ["cafe", "walking", "photography"],
  },
  {
    name: "Hassan Ali",
    email: "hassan.ali@mychat.demo",
    gender: "male",
    age: 27,
    bio: "Food explorer — always trying new spots in F-7.",
    photos: ["https://i.pravatar.cc/300?u=hassanali"],
    areaName: "F-7, Islamabad",
    offset: { km: 4.5, bearing: 120 },
    interestsToday: ["food", "cafe", "movies"],
  },
  {
    name: "Sara Malik",
    email: "sara.malik@mychat.demo",
    gender: "female",
    age: 22,
    bio: "Photography and shopping in Blue Area.",
    photos: ["https://i.pravatar.cc/300?u=saramalik"],
    areaName: "Blue Area, Islamabad",
    offset: { km: 5.8, bearing: 200 },
    interestsToday: ["photography", "shopping", "cafe"],
  },
  {
    name: "Omar Farooq",
    email: "omar.farooq@mychat.demo",
    gender: "male",
    age: 29,
    bio: "Margalla trail runs on weekends.",
    photos: ["https://i.pravatar.cc/300?u=omarfarooq"],
    areaName: "G-9, Islamabad",
    offset: { km: 7.2, bearing: 280 },
    interestsToday: ["hiking", "walking", "gym"],
  },
  {
    name: "Zainab Raza",
    email: "zainab.raza@mychat.demo",
    gender: "female",
    age: 26,
    bio: "Book café lover in F-6.",
    photos: ["https://i.pravatar.cc/300?u=zainabraza"],
    areaName: "F-6, Islamabad",
    offset: { km: 3.1, bearing: 10 },
    interestsToday: ["cafe", "reading", "music"],
  },
  {
    name: "Bilal Ahmed",
    email: "bilal.ahmed@mychat.demo",
    gender: "male",
    age: 31,
    bio: "Gym mornings, food tours at night.",
    photos: ["https://i.pravatar.cc/300?u=bilahmed"],
    areaName: "F-8, Islamabad",
    offset: { km: 6.4, bearing: 160 },
    interestsToday: ["gym", "food", "walking"],
  },
  {
    name: "Fatima Noor",
    email: "fatima.noor@mychat.demo",
    gender: "female",
    age: 23,
    bio: "Movies and café dates nearby.",
    photos: ["https://i.pravatar.cc/300?u=fatimanoor"],
    areaName: "F-10, Islamabad",
    offset: { km: 8.1, bearing: 90 },
    interestsToday: ["movies", "cafe", "food"],
  },
  {
    name: "Usman Sheikh",
    email: "usman.sheikh@mychat.demo",
    gender: "male",
    age: 28,
    bio: "Street photography around Islamabad.",
    photos: ["https://i.pravatar.cc/300?u=usmansheikh"],
    areaName: "G-10, Islamabad",
    offset: { km: 9.3, bearing: 240 },
    interestsToday: ["photography", "walking", "cafe"],
  },
  {
    name: "Mariam Hussain",
    email: "mariam.hussain@mychat.demo",
    gender: "female",
    age: 25,
    bio: "Shopping and brunch in the city.",
    photos: ["https://i.pravatar.cc/300?u=mariamhussain"],
    areaName: "Centaurus vicinity, Islamabad",
    offset: { km: 4.8, bearing: 70 },
    interestsToday: ["shopping", "food", "cafe"],
  },
  {
    name: "Danish Iqbal",
    email: "danish.iqbal@mychat.demo",
    gender: "male",
    age: 30,
    bio: "Live music and casual walks.",
    photos: ["https://i.pravatar.cc/300?u=danishiqbal"],
    areaName: "I-8, Islamabad",
    offset: { km: 9.8, bearing: 310 },
    interestsToday: ["music", "walking", "movies"],
  },
  {
    name: "Hira Shah",
    email: "hira.shah@mychat.demo",
    gender: "female",
    age: 25,
    bio: "Yoga and hiking when the weather is good.",
    photos: ["https://i.pravatar.cc/300?u=hirashah"],
    areaName: "F-11, Islamabad",
    offset: { km: 6.9, bearing: 220 },
    interestsToday: ["hiking", "gym", "walking"],
  },
  {
    name: "Imran Qureshi",
    email: "imran.qureshi@mychat.demo",
    gender: "male",
    age: 32,
    lastActiveAt: new Date(Date.now() - 8 * 60 * 1000),
    bio: "Tech meetups and coffee in Blue Area.",
    photos: ["https://i.pravatar.cc/300?u=imranqureshi"],
    areaName: "Blue Area, Islamabad",
    offset: { km: 5.2, bearing: 190 },
    interestsToday: ["cafe", "food", "reading"],
  },
];

function buildUserDoc(profile, today) {
  const { latitude, longitude } = offsetKm(
    CENTER_LAT,
    CENTER_LNG,
    profile.offset.km,
    profile.offset.bearing
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
      city: "Islamabad",
      areaName: profile.areaName,
    },
    interestsToday: profile.interestsToday,
    interestsTodayUpdatedAt: today,
    lastActiveAt: profile.lastActiveAt ?? today,
    preferences: {
      ageRange: { min: 20, max: 35 },
      maxDistance: 10,
      interests: profile.interestsToday,
    },
  };
}

module.exports = {
  CENTER_LAT,
  CENTER_LNG,
  PASSWORD,
  LEGACY_EMAILS,
  DEMO_USERS,
  buildUserDoc,
};
