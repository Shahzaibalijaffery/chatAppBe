const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    userA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    postSnapshot: {
      category: { type: String, required: true },
      areaName: { type: String, default: "Nearby area" },
      textPreview: { type: String, default: "" },
      postCreatedAt: { type: Date, required: true },
    },
    trigger: {
      type: String,
      enum: ["comment", "react", "author_initiated"],
      required: true,
    },
  },
  { timestamps: true }
);

matchSchema.index({ userA: 1, userB: 1 }, { unique: true });
matchSchema.index({ userA: 1, status: 1 });
matchSchema.index({ userB: 1, status: 1 });

module.exports = mongoose.model("Match", matchSchema);
