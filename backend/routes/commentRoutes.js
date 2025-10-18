import express from "express";
import {
  addComment,
  getComments,
  updateComment,
  deleteComment,
  reportComment,
  getCommentById,
  getReportedComments,
  blockComment,
  getBlockedComments,
  unblockComment,
} from "../controllers/commentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ⚠️ Always put static routes before dynamic ones
router.get("/reported", protect, getReportedComments);
router.put("/report/:id", protect, reportComment);
router.get("/comment/:id", getCommentById);

// Add / Get Comments for Blog
router.route("/:blogId").get(getComments).post(protect, addComment);

// Update / Delete Comment by commentId
router
  .route("/:commentId")
  .put(protect, updateComment)
  .delete(protect, deleteComment);

// Block Comment by commentId
router.put("/block/:commentId", protect, blockComment);

// SuperAdmin only
router.get("/superadmin/blocked-comments", protect, getBlockedComments);
// SuperAdmin only: unblock comment
router.put(
  "/superadmin/unblock-comment/:commentId",
  protect,
  unblockComment
);
export default router;
