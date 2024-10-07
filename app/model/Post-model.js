import { Schema, model } from "mongoose";

const postSchema = new Schema(
  {
    user: Schema.Types.ObjectId,
    pic: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    caption: String,
    likes: [{ type: Schema.Types.ObjectId }],
    comments: [
      {
        commentBody: String,
        postedBy: { type: Schema.Types.ObjectId },
        createdAt: {
          type: Date,
          default: Date.now, // Sets default value to the current date
        },
      },
    ],
  },
  { timestamps: true }
);

const Post = model("post", postSchema);
export default Post;
