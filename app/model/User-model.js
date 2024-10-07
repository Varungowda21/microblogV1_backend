import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    email: String,
    password: String,
    role: {
      type: String,
      default: "user",
    },
    username: String,
    bio: String,
    profilePic: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    following: [{ type: Schema.Types.ObjectId }],
    followers: [{ type: Schema.Types.ObjectId }],
  },
  { timestamps: true }
);

const User = model("user", userSchema);
export default User;
