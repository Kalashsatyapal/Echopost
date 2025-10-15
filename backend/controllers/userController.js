import User from "../models/User.js";
import Blog from "../models/Blog.js";
import bcrypt from "bcryptjs";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

// Get profile + blogs
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    const blogs = await Blog.find({ author: req.user._id }).sort({ createdAt: -1 });
    res.json({ user, blogs });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.body.name) user.name = req.body.name;

    // Handle optional image upload
    if (req.file && req.file.buffer) {
      const uploadFromBuffer = (buffer) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "profiles" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          streamifier.createReadStream(buffer).pipe(stream);
        });

      try {
        const result = await uploadFromBuffer(req.file.buffer);
        user.profileImage = result.secure_url;
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        return res.status(500).json({ message: "Image upload failed" });
      }
    }

    await user.save();
    const { password, ...userData } = user.toObject();
    res.json(userData);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error during profile update" });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Server error" });
  }
};
