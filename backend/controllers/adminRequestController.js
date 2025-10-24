import nodemailer from "nodemailer";
import User from "../models/User.js";
import AdminRequest from "../models/AdminRequest.js";
import bcrypt from "bcryptjs";

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Email sending utility function
const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: `"EchoPost" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email sending failed:', {
      error: error.message,
      errorCode: error.code,
      errorCommand: error.command
    });
    return false;
  }
};

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

    // Notify SuperAdmin
    const emailSent = await sendEmail(
      process.env.SUPERADMIN_EMAIL,
      "New Admin Request Received",
      `Hello SuperAdmin,\n\nA new admin request has been submitted:\n\nName: ${name}\nEmail: ${email}\n\nCheck the dashboard to accept/reject this request.`
    );

    res.status(201).json({
      message: "Admin request created successfully",
      request: newRequest,
      emailStatus: emailSent ? "Email sent successfully" : "Email sending failed"
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

    // Send notification email to requester
    const emailText = status === "accepted"
      ? `Hello ${request.name},\n\nYour admin request has been accepted. You can now login to EchoPost as an admin using your email and password.`
      : `Hello ${request.name},\n\nYour admin request has been rejected. If you have any questions, please contact the support team.`;

    const emailSent = await sendEmail(
      request.email,
      `Your Admin Request has been ${status}`,
      emailText
    );

    res.json({
      message: `Request ${status} successfully`,
      request,
      emailStatus: emailSent ? "Email sent successfully" : "Email sending failed"
    });

  } catch (error) {
    console.error("Update admin request error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};