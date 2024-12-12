import express from "express";
import {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  addBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from "../controllers/blogs.controllers.js";
const router = express.Router();

// register user route
router.post("/register", registerUser);

// login user route
router.post("/login", loginUser);

// refresh token route
router.post("/refreshtoken", refreshToken);

// logout user route
router.post("/logout", logoutUser);

// add blog route
router.post("/blog", addBlog);

// get blog route
router.get("/blog", getBlogs);

// get single Blog route
router.get("/:id", getBlogById);

// update Blog route
router.put("/:id", updateBlog);

// delete Blog route
router.delete("/:id", deleteBlog);

export default router;
