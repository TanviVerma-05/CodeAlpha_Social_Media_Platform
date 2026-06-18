const Post = require("../models/Post");

// CREATE POST
exports.createPost = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { caption } = req.body;

    const image = req.file ? req.file.filename : "";

    const newPost = await Post.create({
      user: req.user,

      caption,

      image,
    });
    
    console.log(newPost);

    res.status(201).json({
      message: "Post created",

      newPost,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL POSTS
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username")
      .sort({ createdAt: -1 });
    const validPosts = posts.filter(post => post.user);

    console.log(validPosts);
    res.status(200).json(validPosts);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// LIKE / UNLIKE POST
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const alreadyLiked = post.likes.includes(req.user);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.user);
    } else {
      post.likes.push(req.user);
    }

    await post.save();

    res.status(200).json({
      message: alreadyLiked ? "Post unliked" : "Post liked",
      likes: post.likes.length,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


exports.deletePost = async (req, res) => {

    try {

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        if (post.user.toString() !== req.user) {
            return res.status(401).json({
                message: "Not authorized"
            });
        }

        await post.deleteOne();

        res.status(200).json({
            message: "Post deleted"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};

exports.editPost = async (req, res) => {
  try {
    const { caption } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    if (post.user.toString() !== req.user) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    post.caption = caption;

    await post.save();

    res.status(200).json({
      message: "Post updated",
      post,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};