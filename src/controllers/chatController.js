const db = require("../config/database");

// 1. Create or Find Existing Chat Room
const chatstarted = (req, res) => {
  const { buyer_id, seller_id, car_id } = req.body;

  if (String(buyer_id) === String(seller_id)) {
    return res.status(400).json({
      success: false,
      message: "You cannot chat with your own listing.",
    });
  }

  const checkSql = `
    SELECT * FROM chat_rooms
    WHERE buyer_id = ? AND seller_id = ? AND car_id = ?
  `;

  db.query(checkSql, [buyer_id, seller_id, car_id], (err, result) => {
    if (err) {
      console.error("Database error checking chat room:", err);
      return res.status(500).json({ success: false, error: err.message });
    }

    // Existing Chat Room Found
    if (result.length > 0) {
      const room = result[0];
      return res.json({
        success: true,
        chat_room_id: room.chat_room_id || room.id,
        message: "Existing chat",
      });
    }

    // Create New Chat Room
    const insertSql = `
      INSERT INTO chat_rooms (buyer_id, seller_id, car_id)
      VALUES (?, ?, ?)
    `;

    db.query(insertSql, [buyer_id, seller_id, car_id], (err, data) => {
      if (err) {
        console.error("Database error creating chat room:", err);
        return res.status(500).json({ success: false, error: err.message });
      }

      return res.json({
        success: true,
        chat_room_id: data.insertId,
        message: "New chat created",
      });
    });
  });
};



const getUserChatRooms = (req, res) => {
  const { userId } = req.params;

  const querySql = `
    SELECT 
      cr.chat_room_id,
      cr.car_id,
      cr.buyer_id,
      cr.seller_id,
      cr.created_at,
      CONCAT(IFNULL(c.brand, ''), ' ', IFNULL(c.model, '')) AS title,
      c.price,
      c.km_driven AS km,
      img.image_url AS img
    FROM chat_rooms cr
    LEFT JOIN car_listings c ON cr.car_id = c.id
    LEFT JOIN (
      SELECT car_id, image_url 
      FROM car_images 
      WHERE id IN (SELECT MIN(id) FROM car_images GROUP BY car_id)
    ) img ON cr.car_id = img.car_id
    WHERE cr.buyer_id = ? OR cr.seller_id = ?
    ORDER BY cr.chat_room_id DESC
  `;

  db.query(querySql, [userId, userId], (err, rooms) => {
    if (err) {
      console.error("SQL Error in getUserChatRooms:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Database query error", 
        error: err.message 
      });
    }

    const formattedRooms = (rooms || []).map((room) => ({
      id: room.chat_room_id,
      chat_room_id: room.chat_room_id,
      car_id: room.car_id,
      buyer_id: room.buyer_id,
      seller_id: room.seller_id,
      last_message: "Tap to open chat",
      updated_at: room.created_at,
      car: {
        id: room.car_id,
        title: room.title.trim() || `Car #${room.car_id}`,
        price: room.price || 0,
        img: room.img || "",
        km: room.km || 0,
      },
    }));

    return res.status(200).json({
      success: true,
      chat_rooms: formattedRooms,
    });
  });
};



module.exports = {
  chatstarted,
  getUserChatRooms,
};