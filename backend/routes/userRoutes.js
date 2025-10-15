import express from "express";
import { getProfile, updateProfile, changePassword } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js"; // make sure the path is correct

const router = express.Router();

// Get user profile + authored blogs
router.get("/me", protect, getProfile);

// Update profile (name + optional profile image)
router.put("/update", protect, upload.single("profileImage"), updateProfile);

// Change password
router.put("/change-password", protect, changePassword);

export default router;
