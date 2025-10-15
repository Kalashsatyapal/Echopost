import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getAllUsers,
  updateUserRole
} from "../controllers/superadminController.js";
import { getReportedBlogs } from "../controllers/superadminController.js";

const router = express.Router();

// ✅ Protect routes with superadmin only
router.use(protect);

// Get all users
router.get("/users", getAllUsers);

// Update user role
router.put("/users/:id/role", updateUserRole);

// Get all reported blogs (admin + superadmin)
router.get("/reported", protect, getReportedBlogs);

export default router;
