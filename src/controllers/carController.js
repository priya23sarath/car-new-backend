const db = require('../config/database');

// --- NEW GET API: Fetch All Car Listings ---
const getCar = (req, res) => {
  const sql = `
   SELECT
    c.*,
    GROUP_CONCAT(i.image_url SEPARATOR ',') AS images
FROM car_listings c
LEFT JOIN car_images i ON c.id = i.car_id
WHERE c.status = 'active'
GROUP BY c.id
ORDER BY c.id DESC`;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err });

    const cars = result.map(car => ({
      ...car,
      images: car.images ? car.images.split(",") : []
    }));

    res.json(cars);
  });
};

// --- OPTIONAL GET API: Get Car Count for a Specific User ---
// Useful for checking the limit on the frontend before showing pages
const getCarCount = (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required." });
  }

  const countSql = `SELECT COUNT(*) AS count FROM car_listings WHERE user_id = ?`;
  
  db.query(countSql, [userId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    
    const count = result[0]?.count || 0;
    res.json({ success: true, count });
  });
};

// --- POST API: Save Car Listing (With Limit Check) ---
const addCar = (req, res) => {
  const { user_id, brand, model, variant, mfg_year, fuel_type, transmission, 
    km_driven, no_of_owners, description, price, location, imageUrls } = req.body;

  if (!user_id) {
    return res.status(400).json({ success: false, message: "User ID is required to list this car." });
  }

  // 1. First, check how many cars this user has already listed
  const countSql = `SELECT COUNT(*) AS count FROM car_listings WHERE user_id = ?`;
  
  db.query(countSql, [user_id], (err, countResult) => {
    if (err) return res.status(500).json({ message: "Database error checking car limit", error: err });

    const currentCarCount = countResult[0]?.count || 0;

    // 2. Reject if they have hit their limit of 10 cars
    if (currentCarCount >= 10) {
      return res.status(403).json({ 
        success: false, 
        limitReached: true, 
        message: "You have reached the maximum limit of 10 car listings. Please upgrade to premium." 
      });
    }

    // 3. Proceed with original transaction if limit is fine
    db.beginTransaction((err) => {
      if (err) return res.status(500).json({ message: "Transaction Error" });

      const carSql = `INSERT INTO car_listings (user_id, brand, model, variant, mfg_year, fuel_type, transmission, km_driven, no_of_owners, description, price, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const carValues = [user_id, brand, model, variant, mfg_year, fuel_type, transmission, km_driven, no_of_owners, description, price, location];

      db.query(carSql, carValues, (err, result) => {
        if (err) {
          return db.rollback(() => res.status(500).json({ message: "Car insert failed", error: err }));
        }

        const carId = result.insertId;

        if (imageUrls && imageUrls.length > 0) {
          const imgSql = "INSERT INTO car_images (car_id, image_url) VALUES ?";
          const imgValues = imageUrls.map(url => [carId, url]);

          db.query(imgSql, [imgValues], (err) => {
            if (err) {
              return db.rollback(() => res.status(500).json({ message: "Image insert failed" }));
            }
            db.commit((err) => {
              if (err) return db.rollback(() => res.status(500).json({ message: "Commit failed" }));
              res.status(201).json({ success: true, message: "Car listed successfully!", carId });
            });
          });
        } else {
          db.commit(() => res.status(201).json({ success: true, message: "Car listed successfully without images!", carId }));
        }
      });
    });
  });
};


const deleteCar = (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ success: false, message: "Car ID is required." });
  }

  // Because of ON DELETE CASCADE, this automatically deletes related rows in car_images
  const sql = `DELETE FROM car_listings WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Car listing not found." });
    }

    res.json({ success: true, message: "Car listing and associated images deleted successfully." });
  });
};

module.exports = {
  getCar, 
  getCarCount,
  addCar,
  deleteCar
};