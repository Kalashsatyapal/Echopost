import AdminRequest from "../models/AdminRequest.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

// ✅ Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Create admin request
export const createAdminRequest = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newRequest = await AdminRequest.create({ name, email, password: hashedPassword });

    // ✅ Notify SuperAdmin by email
    transporter.sendMail({
      from: `"EchoPost Admin Requests" <${process.env.EMAIL_USER}>`,
      to: process.env.SUPERADMIN_EMAIL,
      subject: "New Admin Request Received",
      text: `Hello SuperAdmin,\n\nA new admin request has been submitted:\n\nName: ${name}\nEmail: ${email}\n\nCheck the dashboard to accept/reject this request.`,
    }).catch(err => console.error("SuperAdmin email failed:", err));

    res.status(201).json({ message: "Admin request created", request: newRequest });
  } catch (err) {
    console.error("Admin request error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all requests (superadmin only)
export const getAdminRequests = async (req, res) => {
  if (!req.user || req.user.role !== "superadmin")
    return res.status(403).json({ message: "Not authorized" });

  const requests = await AdminRequest.find().sort({ createdAt: -1 });
  res.json(requests);
};

// Accept/reject request
export const updateAdminRequest = async (req, res) => {
  if (!req.user || req.user.role !== "superadmin")
    return res.status(403).json({ message: "Not authorized" });

  const { status } = req.body;
  const request = await AdminRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: "Request not found" });

  request.status = status;
  await request.save();

  // ✅ If accepted, create user
  if (status === "accepted") {
    await User.create({
      name: request.name,
      email: request.email,
      password: request.password,
      role: "admin",
    });
  }

  // ✅ Notify requester by email
  transporter.sendMail({
    from: `"EchoPost Admin Requests" <${process.env.EMAIL_USER}>`,
    to: request.email,
    subject: `Your Admin Request is ${status}`,
    text: `Hello ${request.name},\n\nYour admin request has been ${status}.\n\n${
      status === "accepted" ? "You can now login as an admin." : ""
    }`,
  }).catch(err => console.error("Requester email failed:", err));

  res.json(request);
};
