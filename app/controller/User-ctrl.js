import User from "../model/User-model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../../utils/dataUri.js";
import cloudinary from "cloudinary";
import Post from "../model/Post-model.js";

const userCtrl = {};

userCtrl.register = async (req, res) => {
  const { username, bio, email, password } = req.body;
  const file = req.file;

  try {
    let userAlready = await User.findOne({ email });
    if (userAlready)
      return res.status(400).json({ message: "Email already exist" });
    const fileUri = getDataUri(file);
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
    const userCount = await User.countDocuments();
    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(password, salt);
    const user = new User({
      username,
      bio,
      email,
      password: hash,
      profilePic: {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
      },
    });
    if (userCount === 0) {
      user.role = "admin";
    }
    await user.save();
    const tokenData = {
      userId: user._id,
      role: user.role,
    };
    // console.log(tokenData);
    const token = jwt.sign(tokenData, process.env.SECREAT_KEY, {
      expiresIn: "7d",
    });
    return res.status(201).json({
      message: "Registration successfull " + user.username,
      token, // Send the token to be stored client-side
      user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "something went wrong" });
  }
};

userCtrl.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Invalid email" });
    }
    const isValid = await bcryptjs.compare(password, user.password);
    if (!isValid) {
      return res.status(404).json({ message: "Invalid password" });
    }
    const tokenData = {
      userId: user._id,
      role: user.role,
    };
    const token = jwt.sign(tokenData, process.env.SECREAT_KEY, {
      expiresIn: "7d",
    });
    return res.status(200).json({
      message: "Welcome back " + user.username,
      token, // Send the token to be stored client-side
      user,
    });
  } catch (err) {
    res.status(500).json({ error: "something went wrong" });
  }
};

userCtrl.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "something went wrong" });
  }
};

userCtrl.listAllProfiles = async (req, res) => {
  const keyword = req.query.keyword || "";
  try {
    const profiles = await User.find({
      username: {
        $regex: keyword,
        $options: "i",
      },
    });
    res.json(profiles);
  } catch (err) {}
};

userCtrl.showProfile = async (req, res) => {
  const id = req.params.id;
  try {
    const profile = await User.findById(id);
    if (!profile) {
      return res.status(404).json({ msg: "record not found" });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "something went wrong" });
  }
};

userCtrl.follow = async (req, res) => {
  const profileUserId = req.body.profileId;
  try {
    const updateFollowers = await User.findByIdAndUpdate(
      profileUserId,
      {
        $push: { followers: req.userId },
      },
      { new: true }
    );
    const updateFollowing = await User.findByIdAndUpdate(
      req.userId,
      {
        $push: { following: profileUserId },
      },
      {
        new: true,
      }
    );
    res.json({ updateFollowers, updateFollowing });
  } catch (err) {
    res.status(500).json({ error: "something went wrong" });
  }
};

userCtrl.unfollow = async (req, res) => {
  const profileUserId = req.body.profileId;
  try {
    const updateFollowers = await User.findByIdAndUpdate(
      profileUserId,
      {
        $pull: { followers: req.userId },
      },
      { new: true }
    );
    const updateFollowing = await User.findByIdAndUpdate(
      req.userId,
      {
        $pull: { following: profileUserId },
      },
      {
        new: true,
      }
    );
    res.json({ updateFollowers, updateFollowing });
  } catch (err) {
    res.status(500).json({ error: "something went wrong" });
  }
};

userCtrl.destroy = async (req, res) => {
  try {
    const id = req.params.id;
    if (id == req.userId) {
      return res
        .status(400)
        .json({ error: "you cannot delete your own account" });
    }
    const user = await User.findByIdAndDelete(id);
    await cloudinary.v2.uploader.destroy(user.profilePic.public_id);
    const profileFollow = await User.updateMany(
      { followers: id },
      { $pull: { followers: id } }
    );

    const profileFollowing = await User.updateMany(
      { following: id },
      { $pull: { following: id } }
    );
    const allposts = await Post.find({ user: user._id });
    console.log(allposts);
    for (let i = 0; i < allposts.length; i++) {
      console.log(allposts[i]);
      await cloudinary.v2.uploader.destroy(allposts[i].pic.public_id);
    }
    const posts = await Post.deleteMany({ user: user._id });
    console.log(posts);
    // for (let post of posts) {
    //   await cloudinary.v2.uploader.destroy(post.pic.public_id);
    // }

    const like = await Post.updateMany({ likes: id }, { $pull: { likes: id } });
    const comments = await Post.updateMany(
      { "comments.postedBy": id },
      { $pull: { comments: { postedBy: id } } }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
};



export default userCtrl;
