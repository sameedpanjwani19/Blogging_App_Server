import mongoose from "mongoose";
import User from "../models/users.models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Blog from "../models/blog.models.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const generateAccessToken = (user) => {
  return jwt.sign({ email: user.email }, process.env.ACCESS_JWT_SECRET, {
    expiresIn: "6h",
  });
};
const generateRefreshToken = (user) => {
  return jwt.sign({ email: user.email }, process.env.REFRESH_JWT_SECRET, {
    expiresIn: "7d",
  });
};

// register user

const registerUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email) return res.status(400).json({ message: "email required" });
  if (!password) return res.status(400).json({ message: "password required" });

  const user = await User.findOne({ email: email });
  if (user) return res.status(401).json({ message: "user already exist" });

  const createUser = await User.create({
    email,
    password,
  });
  res.json({ message: "user registered successfully", data: createUser });
};

// login user

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email) return res.status(400).json({ message: "email required" });
  if (!password) return res.status(400).json({ message: "password required" });
  // email mujood ha bhi ya nahi ha
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "no user found" });
  // password compare krwayenga bcrypt
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid)
    return res.status(400).json({ message: "incorrect password" });

  // token generate
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // cookies
  res.cookie("refreshToken", refreshToken, { http: true, secure: false });

  res.json({
    message: "user loggedIn successfully",
    accessToken,
    refreshToken,
    data: user,
  });
};

// logout user
const logoutUser = async (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "user logout successfully" });
};

// refreshtoken
const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ message: "no refresh token found!" });

  const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);

  const user = await User.findOne({ email: decodedToken.email });

  if (!user) return res.status(404).json({ message: "invalid token" });

  const generateToken = generateAccessToken(user);
  res.json({ message: "access token generated", accesstoken: generateToken });

  res.json({ decodedToken });
};

// cloudinary config
cloudinary.config({
  cloud_name: "dgjrov7uk",
  api_key: "263427177379142",
  api_secret: "vq-cmRiLYsvH7HJQQmSdW2Gl9sg",
});

// upload image function
const uploadImageToCloudinary = async (localpath) => {
  try {
    const uploadResult = await cloudinary.uploader.upload(localpath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localpath);
    return uploadResult.url;
  } catch (error) {
    fs.unlinkSync(localpath);
    return null;
  }
};

// add Blogs

const addBlog = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No image file uploaded",
      });
    }

    try {
      const uploadResult = await uploadImageToCloudinary(req.file.path);
      if (!uploadResult) {
        return res.status(500).json({ message: "Error uploading image" });
      }

      const blog = await Blog.create({
        title,
        description,
        postedBy: req.user.id,
        blogImage: uploadResult.url,
      });

      res.status(201).json({
        message: "Blog added to database successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error adding blog" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding blog" });
  }
};

// get Blogs

const getBlogs = async (req, res) => {
  const blogs = await Blog.find({});
  res.json(blogs);
};

// get Blog by id
const getBlogById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.json({ error: "Not find this todo" });
  }
  const singleBlog = await Blog.findById(id);
  res.json(singleBlog);
};

// Update Blog
const updateBlog = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({
      message: "Not Valid ID",
    });
    return;
  }
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({
      success: false,
      message: "Title and description are required",
    });
  }
  if (!req.file) {
    return res.status(400).json({
      message: "No image file uploaded",
    });
  }

  try {
    const uploadResult = await uploadImageToCloudinary(req.file.path);
    if (!uploadResult) {
      return res.status(500).json({ message: "Error uploading image" });
    }

    const blog = await Blog.findOneAndUpdate(
      { _id: id },
      {
        title,
        description,
        blogImage: uploadResult.url,
      }
    );
    if (!blog) {
      res.status(404).json({
        message: `No blog with id : ${id}`,
      });
      return;
    }
    res.status(200).json({
      message: "Blog Updated Successfully",
      blog: blog,
    });
  } catch (error) {
    console.log(error);
  }
};

// Delete Blog
const deleteBlog = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({
      message: "Not Valid ID",
    });
    return;
  }

  const blog = await Blog.findByIdAndDelete({ _id: id });
  if (!blog) {
    res.status(404).json({
      message: `No blog with id : ${id}`,
    });
    return;
  }

  res.status(200).json({
    message: "Blog deleted successfully",
    blog: blog,
  });
};

export {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  addBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
};
