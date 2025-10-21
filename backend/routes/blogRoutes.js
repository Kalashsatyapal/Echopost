import express from "express";
import upload from "../Middleware/upload.js";
import {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
  toggleLike,
  reportBlog,
} from "../controllers/blogController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Report a blog (must come first)
router.put("/report/:id", protect, reportBlog);

// Like a blog
router.put("/like/:id", protect, toggleLike);

// Get all blogs / Create blog
router.route("/")
  .get(getBlogs)
  .post(protect, upload.single("image"), createBlog);

// Get / Update / Delete specific blog
router.route("/:id")
  .get(getBlog)
  .put(protect, upload.single("image"), updateBlog)
  .delete(protect, deleteBlog);

export default router;
