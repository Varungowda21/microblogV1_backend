import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import ConfigureDB from "./config/db.js";
import userCtrl from "./app/controller/User-ctrl.js";
import cloudinary from "cloudinary";
import singleUpload from "./app/middlewares/multer.js";
import authenticateUser from "./app/middlewares/authenticateUser.js";
import postCtrl from "./app/controller/Post-ctrl.js";
import homeCtrl from "./app/controller/Home-ctrl.js";
import authorizeUser from "./app/middlewares/AuthorizeUser.js";

dotenv.config();
ConfigureDB();
const port = process.env.PORT || 3072;

const app = express();
app.use(express.json());
app.use(cors());

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLODINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECREAT,
});
app.post("/api/user/register", singleUpload, userCtrl.register);
app.post("/api/user/login", userCtrl.login);
app.get("/api/user/profile", authenticateUser, userCtrl.getMyProfile);
app.get("/api/user/allprofiles", authenticateUser, userCtrl.listAllProfiles);
app.get("/api/user/showprofile/:id", authenticateUser, userCtrl.showProfile);
app.post(
  "/api/user/createpost",
  authenticateUser,
  singleUpload,
  postCtrl.create
);
app.delete("/api/user/deletepost/:id", authenticateUser, postCtrl.delete);
app.get("/api/user/posts", authenticateUser, postCtrl.list);

app.put("/api/user/profile/follow", authenticateUser, userCtrl.follow);
app.put("/api/user/profile/unfollow", authenticateUser, userCtrl.unfollow);

app.get("/api/user/home", authenticateUser, homeCtrl.listFollowingPosts);
app.put("/api/user/home/like", authenticateUser, homeCtrl.like);
app.put("/api/user/home/unlike", authenticateUser, homeCtrl.unlike);
app.put("/api/user/home/comment", authenticateUser, homeCtrl.comment);

app.get(
  "/api/admin/allpost",
  authenticateUser,
  authorizeUser(["admin"]),
  postCtrl.listAllPosts
);
app.delete(
  "/api/admin/deleteUser/:id",
  authenticateUser,
  authorizeUser(["admin"]),
  userCtrl.destroy
);

app.listen(port, () => {
  console.log("server is running on port", port);
});
