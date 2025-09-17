import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";

import authRoutes from "./routes/auth.js";
import User from "./models/User.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Superadmin Seeder
const seedSuperAdmin = async () => {
  try {
    const existing = await User.findOne({ role: "superadmin" });
    if (existing) {
      console.log("✅ Superadmin already exists");
      return;
    }

    const hashed = await bcrypt.hash(process.env.SUPERADMIN_PASSWORD, 10);
    const superadmin = new User({
      name: "Super Admin",
      email: process.env.SUPERADMIN_EMAIL,
      password: hashed,
      role: "superadmin"
    });

    await superadmin.save();
    console.log("🌟 Superadmin created successfully");
  } catch (err) {
    console.error("Error seeding superadmin:", err.message);
  }
};

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    seedSuperAdmin();
  })
  .catch(err => console.log(err));
