const Prompt = require("../models/Prompt");

// Add new prompt
exports.addPrompt = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required.",
      });
    }

    const newPrompt = await Prompt.create({ title, content });

    res.status(201).json({
      success: true,
      data: newPrompt,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding prompt",
      error: error.message,
    });
  }
};

// Edit existing prompt
exports.editPrompt = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const updatedPrompt = await Prompt.findByIdAndUpdate(
      id,
      { title, content },
      { new: true, runValidators: true }
    );

    if (!updatedPrompt) {
      return res.status(404).json({
        success: false,
        message: "Prompt not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedPrompt,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error editing prompt",
      error: error.message,
    });
  }
};

// ✅ Get all prompts
exports.getAllPrompts = async (req, res) => {
  try {
    const prompts = await Prompt.find().sort({ createdAt: -1 }); // newest first
    res.status(200).json({
      success: true,
      count: prompts.length,
      data: prompts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching prompts",
      error: error.message,
    });
  }
};

// ✅ Get prompt by ID
exports.getPromptById = async (req, res) => {
  try {
    const { id } = req.params;
    const prompt = await Prompt.findById(id);

    if (!prompt) {
      return res.status(404).json({
        success: false,
        message: "Prompt not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: prompt,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching prompt",
      error: error.message,
    });
  }
};

// ✅ Delete prompt
exports.deletePrompt = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPrompt = await Prompt.findByIdAndDelete(id);

    if (!deletedPrompt) {
      return res.status(404).json({
        success: false,
        message: "Prompt not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Prompt deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting prompt",
      error: error.message,
    });
  }
};

