import express from "express";
import { addComment, getComments, updateComment, deleteComment } from "../controllers/commentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// /api/comments/:blogId
router.route("/:blogId")
  .get(getComments)
  .post(protect, addComment);

// Update & Delete comment by commentId
router.route("/:commentId")
  .put(protect, updateComment)
  .delete(protect, deleteComment);

export default router;
