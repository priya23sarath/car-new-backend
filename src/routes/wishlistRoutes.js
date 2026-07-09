const express = require("express");
const router = express.Router();

const wishlistController = require("../controllers/wishlistControllers");

router.post("/wishlist", wishlistController.addToWishlist);

router.delete("/wishlist", wishlistController.removeFromWishlist);

router.get("/wishlist/:userId", wishlistController.getWishlist);

router.get("/wishlist/check/:userId/:carId", wishlistController.checkWishlist);

module.exports = router;
