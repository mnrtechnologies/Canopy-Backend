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
    reasoning_context: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    last_response: {
      type: String,
     
    },
    response_text: {
      type: String,
      default: "",
    },
    comparison_summary: {
      type: String,
      default: "",
    },
    final_recommendation: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
