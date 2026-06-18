const express = require("express");
console.log("USER ROUTES LOADED");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
    getProfile,
    followUser,
    uploadProfilePic,
    searchUsers,
} = require("../controllers/userController");

router.put("/follow/:id", protect, followUser);

router.get(
  "/search/users",
  protect,
  searchUsers
);

router.get("/:id", protect, getProfile);

router.put(
  "/profile-picture",
  protect,
  upload.single("image"),
  uploadProfilePic
);

module.exports = router;