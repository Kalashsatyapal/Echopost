import express from "express";
import { getAdminStats } from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Only logged-in users can access (admin or superadmin)
router.get("/stats", protect, getAdminStats);

export default router;
