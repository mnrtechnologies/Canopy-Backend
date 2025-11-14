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
    content:{
      type:String
    },
    first_response: {
      type: String,
    
    },
    consultants: {
      type: Array,
      default: [],
    },
    emailContent: {
      type: String,
      default: "",
    },
    summary_context: {
      type: String,
      default: "",
    },
    last_response: {
      type: String,
     
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
