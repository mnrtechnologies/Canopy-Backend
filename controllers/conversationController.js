const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

exports.getLatestControllerForUser = async (req, res) => {
  try {
    // 1️⃣ Find the latest conversation for the user
    const latestConversation = await Conversation.findOne({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    if (!latestConversation) {
      return res.status(404).json({ message: "No conversation found" });
    }

    // 2️⃣ Find all messages for this conversation
    const messages = await Message.find({ conversationId: latestConversation._id })
      .sort({ createdAt: 1 }) // oldest to newest, change to -1 for newest first
      .lean();

    // 3️⃣ Return the full conversation plus its messages
    res.json({
      conversation: latestConversation,
      messages: messages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch latest conversation" });
  }
};





exports.getUserConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.user.id })
      .populate("messages")
      .sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
};

exports.getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ _id: req.params.id, userId: req.user.id })
      .populate("messages");

    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch conversation" });
  }
};

exports.createConversation = async (req, res) => {
  try {
    const { title, initialMessage } = req.body;

    const newConversation = new Conversation({
      userId: req.user.id,
      title,
      messages: [],
    });

    if (initialMessage) {
      const message = await Message.create({
        conversationId: newConversation._id,
        sender: "assistant",
        content: initialMessage,
      });

      newConversation.messages.push(message._id);
    }

    await newConversation.save();
    const populatedConversation = await Conversation.findById(newConversation._id).populate("messages");

    res.status(201).json(populatedConversation);
  } catch (err) {
    res.status(500).json({ message: "Failed to create conversation" });
  }
};

exports.deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ _id: req.params.id, userId: req.user.id });
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    // Delete all messages
    await Message.deleteMany({ conversationId: conversation._id });

    // Delete conversation
    await conversation.deleteOne();

    res.json({ message: "Conversation and messages deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete conversation" });
  }
};

exports.editConversationTitle = async (req, res) => {
  try {
    const { title } = req.body;
    const conversationId = req.params.id;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Title is required" });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    conversation.title = title;
    await conversation.save();

    res.status(200).json({ message: "Title updated", conversation });
  } catch (err) {
    console.error("Failed to edit conversation title:", err);
    res.status(500).json({ message: "Failed to update title" });
  }
};