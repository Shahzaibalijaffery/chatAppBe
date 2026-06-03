const mongoose = require("mongoose");

const postReactionSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "helpful"],
      default: "like",
    },
  },
  { timestamps: true }
);

postReactionSchema.index({ postId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("PostReaction", postReactionSchema);
