const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/authRoutes");
const carRoutes = require("./routes/carRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

// Create HTTP Server
const server = http.createServer(app);

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: "*", // Changed to '*' so physical mobile devices & emulators can connect without CORS issues
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make io available in controllers
app.set("io", io);

// Socket Events
io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  // 1. Join Room (Handles both Primitive IDs and Object Payloads cleanly)
  socket.on("join_room", (data) => {
    const chatRoomId = typeof data === "object" ? data.chat_room_id : data;
    if (!chatRoomId) return;

    const roomIdStr = String(chatRoomId);
    socket.join(roomIdStr);
    console.log(`Socket ${socket.id} Joined Room: ${roomIdStr}`);
  });

  // 2. BROADCAST MESSAGE (THIS WAS MISSING!)
  socket.on("send_message", (data) => {
    if (!data || !data.chat_room_id) return;

    const roomIdStr = String(data.chat_room_id);

    // io.in(roomIdStr) emits to EVERYONE in the room (including the sender as a confirmation)
    // socket.to(roomIdStr) emits to everyone EXCEPT the sender
    io.in(roomIdStr).emit("receive_message", data);
    
    console.log(`Live message broadcasted to room ${roomIdStr}:`, data.message);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});

// Body size limit
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", carRoutes);
app.use("/api", wishlistRoutes);
app.use("/api", chatRoutes);
app.use("/api/messages", messageRoutes);

const PORT = 5000;

// Listen on 0.0.0.0
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});