const express = require("express");
const router = express.Router();
// This must match the filename and location of the code above
const { checkUser, registerUser, loginSuccess, updateProfileImage, getLoggedInUserProfile} = require("../controllers/authController");

router.post("/check-user", checkUser);
router.post("/register", registerUser);
router.post("/login-success", loginSuccess);
// router.post('/get-profile', getUserProfile);
router.post("/update-profile", updateProfileImage);
router.post("/get-profile", getLoggedInUserProfile);
// router.post('/upgrade-premium', upgradeToPremium);


module.exports = router;