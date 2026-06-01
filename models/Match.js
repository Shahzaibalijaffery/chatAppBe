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
  },
  { timestamps: true }
);

matchSchema.index({ userA: 1, userB: 1 }, { unique: true });
matchSchema.index({ userA: 1, status: 1 });
matchSchema.index({ userB: 1, status: 1 });

module.exports = mongoose.model("Match", matchSchema);
