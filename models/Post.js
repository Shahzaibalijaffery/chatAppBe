const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    photos: {
      type: [String],
      default: [],
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      areaName: { type: String, default: null, trim: true },
      city: { type: String, default: null, trim: true },
      country: { type: String, default: null, trim: true },
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    expired: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

postSchema.index({ expired: 1, expiresAt: 1 });
postSchema.index({ authorId: 1, createdAt: -1 });
postSchema.index({ "location.latitude": 1, "location.longitude": 1 });

module.exports = mongoose.model("Post", postSchema);
