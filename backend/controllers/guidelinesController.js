// controllers/guidelinesController.js
import Guidelines from "../models/Guidelines.js";

// Get guidelines
export const getGuidelines = async (req, res) => {
  try {
    let guidelines = await Guidelines.findOne();
    if (!guidelines) {
      // Create default guidelines if none exist
      guidelines = await Guidelines.create({
        sections: [
          { title: "Writing a Blog", rules: [] },
          { title: "Reporting a Blog", rules: [] },
          { title: "Commenting", rules: [] },
          { title: "Reporting a Comment", rules: [] },
        ],
      });
    }
    res.json(guidelines);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update guidelines (SuperAdmin only)
export const updateGuidelines = async (req, res) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Not authorized" });
  }

  try {
    const { sections } = req.body;
    if (!sections || !Array.isArray(sections)) {
      return res.status(400).json({ message: "Invalid sections data" });
    }

    let guidelines = await Guidelines.findOne();
    if (!guidelines) {
      guidelines = await Guidelines.create({ sections });
    } else {
      guidelines.sections = sections;
      await guidelines.save();
    }

    res.json(guidelines);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
