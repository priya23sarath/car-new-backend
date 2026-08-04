const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

// Matches POST http://192.168.1.7:5000/api/messages
router.post("/", messageController.sendMessage);

// Matches GET http://192.168.1.7:5000/api/messages/:chat_room_id
router.get("/:chat_room_id", messageController.getMessages);

// Matches GET http://192.168.1.7:5000/api/messages/user-chats
router.get("/user-chats", messageController.getUserChats);

// Matches DELETE http://192.168.1.7:5000/api/messages/clear-all
router.delete("/clear-all", messageController.clearAllChats);

module.exports = router;