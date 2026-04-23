const express = require("express");
const router = express.Router();

const {createNewMessage,getAllMessages,editMessage,deleteMessage} = require("../controllers/messageContoller");
const {checkAuth} = require("../middlewares/auth");

router.post("/send-message",checkAuth,createNewMessage);
router.get("/get-all-messages/:chatUserId",checkAuth,getAllMessages);
router.patch("/edit-message/:messageId",checkAuth,editMessage);
router.delete("/delete-message/:messageId",checkAuth,deleteMessage);


module.exports = router;
