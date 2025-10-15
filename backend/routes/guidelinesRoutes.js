// routes/guidelinesRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getGuidelines, updateGuidelines } from "../controllers/guidelinesController.js";

const router = express.Router();

router.get("/", getGuidelines);
router.put("/", protect, updateGuidelines); // only superadmin can update

export default router;
