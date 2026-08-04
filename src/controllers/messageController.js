const db = require("../config/database"); // Change this path if your DB file is elsewhere

// Send Message
exports.sendMessage = (req, res) => {
    const { chat_room_id, sender_id, message } = req.body;

    if (!chat_room_id || !sender_id || !message) {
        return res.status(400).json({
            success: false,
            message: "chat_room_id, sender_id and message are required"
        });
    }

    const sql = `
        INSERT INTO messages (chat_room_id, sender_id, message)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [chat_room_id, sender_id, message], (err, result) => {
        if (err) {
            console.error("Send Message Error:", err);
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            message_id: result.insertId
        });
    });
};

// Get All Messages for a specific chat room
exports.getMessages = (req, res) => {
    const { chat_room_id } = req.params;

    const sql = `
        SELECT *
        FROM messages
        WHERE chat_room_id = ?
        ORDER BY created_at ASC
    `;

    db.query(sql, [chat_room_id], (err, results) => {
        if (err) {
            console.error("Get Messages Error:", err);
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        res.status(200).json({
            success: true,
            messages: results
        });
    });
};

// Get All Chat Rooms for a User (Formatted for React Native Mainchatpage)
exports.getUserChats = (req, res) => {
    // Expecting userId from auth middleware (e.g., req.user.id) or query params
    const userId = req.user ? req.user.id : req.query.userId;

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "User ID is required"
        });
    }

    // Query fetches chat rooms where the user is either buyer or seller,
    // determines their role ('BUYING' or 'SELLING'), and gets the latest message.
    const sql = `
        SELECT 
            cr.id AS id,
            cr.car_id AS carId,
            IF(cr.buyer_id = ?, 'BUYING', 'SELLING') AS type,
            m.message AS lastMessage,
            DATE_FORMAT(m.created_at, '%h:%i %p') AS time
        FROM chat_rooms cr
        INNER JOIN (
            SELECT chat_room_id, MAX(id) as max_msg_id
            FROM messages
            GROUP BY chat_room_id
        ) latest ON cr.id = latest.chat_room_id
        INNER JOIN messages m ON latest.max_msg_id = m.id
        WHERE cr.buyer_id = ? OR cr.seller_id = ?
        ORDER BY m.created_at DESC
    `;

    db.query(sql, [userId, userId, userId], (err, results) => {
        if (err) {
            console.error("Get User Chats Error:", err);
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        res.status(200).json({
            success: true,
            chats: results
        });
    });
};

// Clear All Chats for a User
exports.clearAllChats = (req, res) => {
    const userId = req.user ? req.user.id : req.body.userId;

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "User ID is required"
        });
    }

    const sql = `
        DELETE FROM messages 
        WHERE chat_room_id IN (
            SELECT id FROM chat_rooms WHERE buyer_id = ? OR seller_id = ?
        )
    `;

    db.query(sql, [userId, userId], (err, result) => {
        if (err) {
            console.error("Clear Chats Error:", err);
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        res.status(200).json({
            success: true,
            message: "All chat history cleared successfully"
        });
    });
};