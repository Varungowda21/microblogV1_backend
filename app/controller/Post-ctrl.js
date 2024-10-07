import Post from "../model/Post-model.js";
import cloudinary from "cloudinary";
import getDataUri from "../../utils/dataUri.js";

const postCtrl = {};

postCtrl.create = async (req, res) => {
  const { caption } = req.body;
  const file = req.file;
  try {
    const fileUri = getDataUri(file);
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
    const post = new Post({
      caption,
      pic: {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
      },
    });
    post.user = req.userId;
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.log(err);
  }
};

postCtrl.list = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.userId }).sort("-createdAt");
    res.json(posts);
  } catch (err) {
    console.log(err);
  }
};

postCtrl.delete = async (req, res) => {
  const id = req.params.id;
  let post;
  try {
    if (req.role == "admin") {
      post = await Post.findByIdAndDelete(id);
    } else {
      post = await Post.findOneAndDelete({ _id: id, user: req.userId });
    }
    await cloudinary.v2.uploader.destroy(post.pic.public_id);

    if (!post) {
      return res.status(404).json({ err: "record not found" });
    }
    res.json(post);
  } catch (err) {
    console.log(err);
  }
};
postCtrl.listAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort("-createdAt");
    res.json(posts);
  } catch (err) {
    console.log(err);
  }
};

export default postCtrl;
