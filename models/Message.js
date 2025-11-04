const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
      consultants: { type: Array, default: [] },
    imageUrl: {
      type: String,
    },
    webLinks: {
      type: [
        {
          title: { type: String },
          link: { type: String },
        },
      ],
      default: [],
    },
    youtubeLinks: {
      type: [
        {
          title: { type: String },
          link: { type: String },
          duration: { type: String, default: "N/A" },
        },
      ],
      default: [],
    },
    isChecked: {
      type: String,
      default: "false",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
