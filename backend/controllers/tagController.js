import Tag from "../models/Tag.js";
import User from "../models/User.js";

// ✅ Create a new tag (Admin or SuperAdmin only)
export const createTag = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      return res.status(403).json({ message: "Not authorized to create tags" });
    }

    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Tag name is required" });

    const existingTag = await Tag.findOne({ name });
    if (existingTag) return res.status(400).json({ message: "Tag already exists" });

    const tag = await Tag.create({
      name,
      description,
      createdBy: user._id,
    });

    res.status(201).json({ message: "Tag created successfully", tag });
  } catch (error) {
    console.error("Error creating tag:", error);
    res.status(500).json({ message: "Server error while creating tag" });
  }
};

// ✅ Fetch all tags (public)
export const getTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ createdAt: -1 });
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tags" });
  }
};

// ✅ Delete tag (Admin or SuperAdmin only)
export const deleteTag = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      return res.status(403).json({ message: "Not authorized to delete tags" });
    }

    await Tag.findByIdAndDelete(req.params.id);
    res.json({ message: "Tag deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting tag" });
  }
};
// ✅ Update Tag (SuperAdmin Only)
export const updateTag = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "superadmin") {
      return res.status(403).json({ message: "Only SuperAdmin can edit tags" });
    }

    const { name, description } = req.body;
    const updated = await Tag.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Tag not found" });
    res.json(updated);
  } catch (error) {
    console.error("Error updating tag:", error);
    res.status(500).json({ message: "Server error while updating tag" });
  }
};