const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [18, "Age must be at least 18"],
      max: [120, "Age must be less than 120"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: null,
    },
    bio: {
      type: String,
      default: null,
      trim: true,
    },
    photos: [
      {
        type: String,
        default: [],
      },
    ],
    location: {
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
      city: {
        type: String,
        default: null,
        trim: true,
      },
      areaName: {
        type: String,
        default: null,
        trim: true,
      },
      country: {
        type: String,
        default: null,
        trim: true,
      },
    },
    interestsToday: {
      type: [String],
      default: [],
    },
    interestsTodayUpdatedAt: {
      type: Date,
      default: null,
    },
    /** Start of the current 12h interests window (fixed; does not slide on each save). */
    interestsTodayPeriodStartedAt: {
      type: Date,
      default: null,
    },
    /** Saves with a different selection in the current window (max 2 per 12h). */
    interestsTodayUpdateCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    /** When false, user is hidden from Nearby / discovery for everyone. */
    visibleInDiscovery: {
      type: Boolean,
      default: true,
    },
    lastActiveAt: {
      type: Date,
      default: null,
    },
    blockedUserIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    fcmTokens: [
      {
        token: { type: String, required: true },
        platform: { type: String, default: "unknown" },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    preferences: {
      ageRange: {
        min: {
          type: Number,
          default: 18,
        },
        max: {
          type: Number,
          default: 100,
        },
      },
      maxDistance: {
        type: Number,
        default: 50, // in km
      },
      interests: [
        {
          type: String,
          default: [],
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get user without sensitive data
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model("User", userSchema);
