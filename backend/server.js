// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

// Load environment variables at the very top
dotenv.config();

// Import routes
import authRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRequestRoutes from "./routes/adminRequestRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import superadminRoutes from "./routes/superadminRoutes.js";
import guidelinesRoutes from "./routes/guidelinesRoutes.js";
// Import Cloudinary config (make sure config/cloudinary.js uses process.env)
import cloudinary from "./config/cloudinary.js";

const app = express();

const createSuperAdmin = async () => {
  const superAdminEmail = process.env.SUPERADMIN_EMAIL;
  const superAdminPassword = process.env.SUPERADMIN_PASSWORD;

  if (!superAdminEmail || !superAdminPassword) return;

  const existing = await User.findOne({ email: superAdminEmail });
  if (!existing) {
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
    await User.create({
      name: "SuperAdmin",
      email: superAdminEmail,
      password: hashedPassword,
      role: "superadmin",
    });
    console.log("✅ SuperAdmin created");
  }
};

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("API is running");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin-requests", adminRequestRoutes);
// after app.use("/api/blogs", blogRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/superadmin", superadminRoutes);
app.use("/api/guidelines", guidelinesRoutes);
import tagRoutes from "./routes/tagRoutes.js";
app.use("/api/tags", tagRoutes);
// Connect MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(async() => {
    console.log("MongoDB connected");
    await createSuperAdmin(); // 🔥 ensures superadmin exists
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));


