const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
    createPost,
    getPosts,
    likePost,
    deletePost,
    editPost,
} = require("../controllers/postController");


// CREATE POST
// router.post("/", protect, createPost);
router.post(
  "/",
  (req, res, next) => {
    console.log("POST REQUEST RECEIVED");
    next();
  },
  protect,
  upload.single("image"),
  createPost
);

// GET POSTS
router.get("/", protect, getPosts);


// LIKE POST
router.put("/like/:id", protect, likePost);

// DELETE POST
router.delete("/:id", protect, deletePost);

//EDIT POST
router.put("/:id", protect, editPost);

module.exports = router;