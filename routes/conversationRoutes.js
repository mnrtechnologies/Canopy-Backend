const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { getLatestControllerForUser, getUserConversations, getConversationById, createConversation, deleteConversation, editConversationTitle } = require("../controllers/conversationController");

router.use(auth);

router.get("/latest-conversation",getLatestControllerForUser)

router.get("/", getUserConversations);
router.get("/:id", getConversationById);
router.post("/",createConversation);
router.delete("/:id", deleteConversation);
router.put("/:id", editConversationTitle)



module.exports = router;
