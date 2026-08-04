// routes/chatRoutes.js
const express = require("express");
const { chatstarted, getUserChatRooms } = require("../controllers/chatController");
const router = express.Router();

// Matches POST http://192.168.1.7:5000/api/chat-rooms
router.post("/chat-rooms", chatstarted);

// Matches GET http://192.168.1.7:5000/api/chat-rooms/user/:userId
router.get("/chat-rooms/user/:userId", getUserChatRooms);

module.exports = router;