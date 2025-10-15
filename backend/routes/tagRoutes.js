import express from "express";
import { createTag, getTags, deleteTag, updateTag } from "../controllers/tagController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Tag (Admin or SuperAdmin)
router.post("/", protect, createTag);

// Get All Tags (Public)
router.get("/", getTags);

// Delete Tag (Admin or SuperAdmin)
router.delete("/:id", protect, deleteTag);

// ✅ Update Tag (SuperAdmin only)
router.put("/:id", protect, updateTag);

export default router;
