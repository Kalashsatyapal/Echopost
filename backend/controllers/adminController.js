import User from "../models/User.js";
import Blog from "../models/Blog.js";

// ✅ Get total users and blogs count
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBlogs = await Blog.countDocuments();

    res.json({
      totalUsers,
      totalBlogs,
      message: "Admin stats fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Server error while fetching stats" });
  }
};
