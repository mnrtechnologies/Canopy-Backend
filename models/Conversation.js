const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      default: "New Conversation",
    },
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  },
  {
    timestamps: true,
  }
);

// Auto-delete conversation if it has no messages
// conversationSchema.post("save", async function (doc) {
//   try {
//     if (doc.messages.length === 0) {
//       await doc.deleteOne();
//       console.log("Deleted empty conversation:", doc._id);
//     }
//   } catch (err) {
//     console.error("Auto delete error:", err);
//   }
// });

module.exports = mongoose.model("Conversation", conversationSchema);
