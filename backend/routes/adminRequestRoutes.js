import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createAdminRequest, getAdminRequests, updateAdminRequest } from "../controllers/adminRequestController.js";

const router = express.Router();

router.post("/", createAdminRequest); // anyone can submit
router.get("/", protect, getAdminRequests); // superadmin only
router.put("/:id", protect, updateAdminRequest); // superadmin only

export default router;
