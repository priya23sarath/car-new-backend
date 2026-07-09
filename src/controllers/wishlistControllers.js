const db = require("../config/database");

// ===============================
// Add to Wishlist
// ===============================
exports.addToWishlist = (req, res) => {
    const { user_id, car_id } = req.body;

    if (!user_id || !car_id) {
        return res.status(400).json({
            success: false,
            message: "user_id and car_id are required",
        });
    }

    // Check if already exists
    const checkQuery =
        "SELECT * FROM wishlist WHERE user_id = ? AND car_id = ?";

    db.query(checkQuery, [user_id, car_id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Database error",
            });
        }

        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                message: "Car already in wishlist",
            });
        }

        const insertQuery =
            "INSERT INTO wishlist (user_id, car_id) VALUES (?, ?)";

        db.query(insertQuery, [user_id, car_id], (err, insertResult) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to add wishlist",
                });
            }

            res.status(201).json({
                success: true,
                message: "Added to wishlist",
                wishlist_id: insertResult.insertId,
            });
        });
    });
};

// ===============================
// Remove from Wishlist
// ===============================
exports.removeFromWishlist = (req, res) => {
    const { user_id, car_id } = req.body;

    const query =
        "DELETE FROM wishlist WHERE user_id = ? AND car_id = ?";

    db.query(query, [user_id, car_id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Database error",
            });
        }

        res.json({
            success: true,
            message: "Removed from wishlist",
        });
    });
};

// ===============================
// Get Wishlist
// ===============================
exports.getWishlist = (req, res) => {
    const userId = req.params.userId;

    const query = `
        SELECT
            c.*,
            GROUP_CONCAT(i.image_url) AS images
        FROM wishlist w
        JOIN car_listings c ON w.car_id = c.id
        LEFT JOIN car_images i ON c.id = i.car_id
        WHERE w.user_id = ?
        GROUP BY c.id
        ORDER BY w.created_at DESC
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Database error",
            });
        }

        const cars = results.map((car) => ({
            ...car,
            images: car.images ? car.images.split(",") : [],
        }));

        res.json({
            success: true,
            data: cars,
        });
    });
};

// ===============================
// Check Wishlist
// ===============================
exports.checkWishlist = (req, res) => {
    const { userId, carId } = req.params;

    const query =
        "SELECT * FROM wishlist WHERE user_id = ? AND car_id = ?";

    db.query(query, [userId, carId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Database error",
            });
        }

        res.json({
            success: true,
            isWishlisted: result.length > 0,
        });
    });
};

