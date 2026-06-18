const User = require("../models/User");
const Post = require("../models/Post");

//UPLOAD PROFILE PICTURE
exports.uploadProfilePic = async (req, res) => {
  try {

    const user = await User.findById(req.user);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    user.profilePic = req.file.filename;

    await user.save();

    res.status(200).json({
      message: "Profile picture updated",
      profilePic: user.profilePic
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};


// GET PROFILE
exports.getProfile = async (req, res) => {

    try {

        const user = await User.findById(req.params.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const posts = await Post.find({
            user: req.params.id
        }).sort({ createdAt: -1 });

        res.status(200).json({
            user,
            posts
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


// FOLLOW USER
exports.followUser = async (req, res) => {

    try {

        const targetUser = await User.findById(req.params.id);

        const currentUser = await User.findById(req.user);

        if (!targetUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (req.user === req.params.id) {
            return res.status(400).json({
                message: "Cannot follow yourself"
            });
        }

        const alreadyFollowing =
            currentUser.following.includes(req.params.id);

        if (alreadyFollowing) {

            currentUser.following =
                currentUser.following.filter(
                    id => id.toString() !== req.params.id
                );

            targetUser.followers =
                targetUser.followers.filter(
                    id => id.toString() !== req.user
                );

            await currentUser.save();
            await targetUser.save();

            return res.status(200).json({
                message: "User unfollowed"
            });
        }

        currentUser.following.push(req.params.id);
        targetUser.followers.push(req.user);

        await currentUser.save();
        await targetUser.save();

        res.status(200).json({
            message: "User followed"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};

//SEARCH USERS
exports.searchUsers = async (req, res) => {
  try {

    const keyword =
      req.query.username ||
      req.query.search ||
      "";

    const users = await User.find({
        _id: { $ne: req.user }, // current user ko exclude karo
      username: {
        $regex: keyword,
        $options: "i"
      }
    }).select(
      "_id username profilePic"
    );

    res.status(200).json(users);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};