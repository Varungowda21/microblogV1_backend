import Post from "../model/Post-model.js";
import User from "../model/User-model.js";

const homeCtrl = {};

homeCtrl.listFollowingPosts = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const posts = await Post.find({
      user: { $in: user.following },
    }).sort("-createdAt");

    if (!posts) {
      return res.status(404).json({ error: "No posts found" });
    }
    res.json(posts);
  } catch (err) {
    console.log(err);
  }
};

homeCtrl.like = async (req, res) => {
  try {
    const postlikeupdate = await Post.findByIdAndUpdate(
      req.body.postId,
      { $push: { likes: req.userId } },
      { new: true }
    );
    res.json(postlikeupdate);
  } catch (err) {
    res.status(500).json("something went wrong");
  }
};

homeCtrl.unlike = async (req, res) => {
  try {
    const postlikeupdate = await Post.findByIdAndUpdate(
      req.body.postId,
      { $pull: { likes: req.userId } },
      { new: true }
    );
    res.json(postlikeupdate);
  } catch (err) {
    res.status(500).json("something went wrong");
  }
};

homeCtrl.comment = async (req, res) => {
  const comment = {
    commentBody: req.body.commentBody,
    postedBy: req.userId,
  };
  try {
    const postCommentUpdate = await Post.findByIdAndUpdate(
      req.body.postId,
      {
        $push: {
          comments: {
            $each: [comment],
            $position: 0, // This will insert the comment at the beginning of the array
          },
        },
      },
      { new: true }
    );
    res.json(postCommentUpdate);
  } catch (err) {
    res.status(500).json({ error: "something went wrong" });
  }
};

export default homeCtrl;
