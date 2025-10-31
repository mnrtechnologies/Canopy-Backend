const mongoose = require("mongoose"); //User.js

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin"],
      required: true,
    },

    token: { type: String },
    resetPasswordExpires: { type: Date },
    image:{
type: String
    },

    lastActive: {
      type: Date,
      default: Date.now,
    },

    conversations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
      },
    ],
  },

  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
