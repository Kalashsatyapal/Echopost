import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Server + DB init
const startServer = async () => {
  const PORT = process.env.PORT || 5000;
  try {
   await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ Connected to MongoDB");

    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    process.exit(1); // Exit with failure
  }
};

startServer();
