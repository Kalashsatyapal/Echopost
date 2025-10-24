import User from "../models/User.js";
import AdminRequest from "../models/AdminRequest.js";
import bcrypt from "bcryptjs";

// Create admin request
export const createAdminRequest = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password and create request
    const hashedPassword = await bcrypt.hash(password, 10);
    const newRequest = await AdminRequest.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "Admin request created successfully",
      request: newRequest
    });

  } catch (error) {
    console.error("Create admin request error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all admin requests
export const getAdminRequests = async (req, res) => {
  try {
    // Check if user is superadmin
    if (!req.user || req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const requests = await AdminRequest.find().sort({ createdAt: -1 });
    res.json(requests);

  } catch (error) {
    console.error("Get admin requests error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update admin request status
export const updateAdminRequest = async (req, res) => {
  try {
    // Check if user is superadmin
    if (!req.user || req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { status } = req.body;
    const request = await AdminRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Update request status
    request.status = status;
    await request.save();

    // If accepted, create new admin user
    if (status === "accepted") {
      try {
        await User.create({
          name: request.name,
          email: request.email,
          password: request.password,
          role: "admin"
        });
      } catch (error) {
        console.error("Error creating admin user:", error);
        return res.status(500).json({ 
          message: "Error creating admin user", 
          error: error.message 
        });
      }
    }

    res.json({
      message: `Request ${status} successfully`,
      request
    });

  } catch (error) {
    console.error("Update admin request error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};