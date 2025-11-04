const express = require("express");
const router = express.Router();

const { auth } = require("../middleware/auth");
const { addMessage, getMessagesByConversationId } = require("../controllers/messageController");


router.use(auth);

router.post("/:conversationId",addMessage);
// router.put("/:messageId", controller.updateMessage);
router.get("/:conversationId",getMessagesByConversationId)


module.exports = router;
