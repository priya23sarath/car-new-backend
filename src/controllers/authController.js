const db = require('../config/database'); 

// ==========================================
// 1. CHECK IF USER EXISTS
// ==========================================
const checkUser = (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: "Phone number is required" });
  }

  const sql = "SELECT * FROM users_login WHERE phone = ?";
  db.query(sql, [phone], (err, result) => {
    if (err) {
      console.error("Error in checkUser:", err);
      return res.status(500).json({ success: false, error: "Database Error" });
    }
    res.json({ exists: result.length > 0 });
  });
};

// ==========================================
// 2. REGISTER NEW USER
// ==========================================
const registerUser = (req, res) => {
  const { phone, name, email } = req.body;
  if (!phone || !name || !email) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  const sql = "INSERT INTO users_login (phone, name, email) VALUES (?, ?, ?)";
  db.query(sql, [phone, name, email], (err, result) => {
    if (err) {
      console.error("Error in registerUser:", err);
      return res.status(500).json({ success: false, error: err.code });
    }
    res.json({ success: true, userId: result.insertId });
  });
};


// ==========================================
// 3. LOGIN SUCCESS
// ==========================================
// ==========================================
// 3. LOGIN SUCCESS (UPDATED TO RETURN USER ID)
// ==========================================
const loginSuccess = (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: "Phone number is required" });
  }

  // Phone number vachi user details fetch panrom
  const sql = "SELECT id, name, email FROM users_login WHERE phone = ?";
  
  db.query(sql, [phone], (err, result) => {
    if (err) {
      console.error("Error in loginSuccess:", err);
      return res.status(500).json({ success: false, error: "Database error during login" });
    }

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Response la user ID serthu anuprom
    res.json({ 
      success: true, 
      message: "Welcome back!", 
      userId: result[0].id, // <--- Inga user ID kedaichuruchi
      user: result[0]
    });
  });
};
// ==========================================
// 4. GET LOGGED IN USER PROFILE
// ==========================================
const getLoggedInUserProfile = (req, res) => {
  // Fixed avatarUrl to avatar_Url to match your MySQL schema structural name
  const sql = "SELECT id, name, email, phone, avatar_Url AS avatarUrl, is_premium FROM users_login ORDER BY id DESC LIMIT 1";

  db.query(sql, [], (err, result) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ success: false, error: "Database reading error" });
    }
    if (result.length === 0) {
      return res.status(404).json({ success: false, message: "No active user records found" });
    }
    return res.json({ success: true, user: result[0] });
  });
};

// ==========================================
// 5. UPDATE USER PROFILE IMAGE
// ==========================================
const updateProfileImage = (req, res) => {
  const { phone, avatarUrl } = req.body;

  if (!phone || !avatarUrl) {
    return res.status(400).json({ 
      success: false, 
      message: "Phone number and image string are required." 
    });
  }

  const sql = "UPDATE users_login SET avatar_Url = ? WHERE phone = ?";

  db.query(sql, [avatarUrl, phone], (err, result) => {
    if (err) {
      console.error("Database Error in updateProfileImage:", err);
      return res.status(500).json({ success: false, error: "Failed to update profile image." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No user found with this phone number." 
      });
    }

    return res.json({ 
      success: true, 
      message: "Profile image saved successfully! Proceed to car sell page." 
    });
  });
};

// ==========================================
// 6. UPGRADE USER TO PREMIUM PLAN
// ==========================================
const upgradeToPremium = (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ success: false, message: "User ID parameter missing." });
  }

  const sql = "UPDATE users_login SET is_premium = 1 WHERE id = ?";

  db.query(sql, [user_id], (err, result) => {
    if (err) {
      console.error("Database upgrade error in upgradeToPremium:", err);
      return res.status(500).json({ success: false, error: "Database transaction execution fault." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User profile record not found." });
    }

    return res.json({ 
      success: true, 
      message: "Account status upgraded to premium tier successfully! 🎉" 
    });
  });
};

module.exports = {
  checkUser,
  registerUser,
  loginSuccess,
  getLoggedInUserProfile,
  updateProfileImage,
  // upgradeToPremium // Un-commented and ready
};