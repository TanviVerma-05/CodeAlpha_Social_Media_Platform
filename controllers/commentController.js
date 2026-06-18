const Comment = require("../models/Comment");

const Post = require("../models/Post");



// ADD COMMENT
exports.addComment = async (req, res) => {

    try {

        const { text } = req.body;

        const post = await Post.findById(req.params.postId);

        if (!post) {

            return res.status(404).json({
                message: "Post not found"
            });
        }

        const comment = await Comment.create({

            user: req.user,

            post: req.params.postId,

            text

        });

        post.comments.push(comment._id);

        await post.save();

        res.status(201).json({
            message: "Comment added",
            comment
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};



// GET COMMENTS
exports.getComments = async (req, res) => {

    try {

        const comments = await Comment.find({
            post: req.params.postId
        })
        .populate("user", "username profilePic")
        .sort({ createdAt: -1 });

        res.status(200).json(comments);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};