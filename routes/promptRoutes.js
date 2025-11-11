const express = require("express");
const router = express.Router();
const {
  addPrompt,
  editPrompt,
  getAllPrompts,
  getPromptById,
} = require("../controllers/promptController");

router.post("/add", addPrompt);        // POST /api/prompts/add
router.put("/edit/:id", editPrompt);   // PUT /api/prompts/edit/:id
router.get("/all", getAllPrompts);     // GET /api/prompts/all
router.get("/:id", getPromptById);     // GET /api/prompts/:id

module.exports = router;
