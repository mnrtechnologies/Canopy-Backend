const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

exports.getMessagesByConversationId = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Verify conversation belongs to the user
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: req.user.id,
    }).populate("messages");

    if (!conversation) {
      return res
        .status(404)
        .json({ message: "Conversation not found or unauthorized" });
    }

    res.json({
      success: true,
      message: "Messages fetched successfully",
      messages: conversation.messages,
    });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Failed to get messages" });
  }
};

exports.addMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { sender, content,consultants , imageUrl, webLinks, youtubeLinks} = req.body;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: req.user.id,
    });
    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    const message = await Message.create({
      conversationId,
      sender,
      content,
      consultants: consultants || [],
      imageUrl,
      webLinks,
      youtubeLinks,
    });

    conversation.messages.push(message._id);
    await conversation.save();

    const populated = await Conversation.findById(conversationId).populate(
      "messages"
    );

    res.json(populated);
  } catch (err) {
    console.error("Add Message Error:", err);
    res
      .status(500)
      .json({ message: "Failed to send message", error: err.message });
  }
};
