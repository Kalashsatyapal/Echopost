import Blog from "../models/Blog.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

// Create Blog
export const createBlog = async (req, res) => {
  try {
    const { title, content, category, subcategory, tags } = req.body;
    let imageUrl = "";

    if (req.file) {
      const buffer = req.file.buffer;
      imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "blogs" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        stream.end(buffer);
      });
    }

    let parsedTags = [];
    if (tags) {
      parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags);
      if (parsedTags.length < 1 || parsedTags.length > 5) {
        return res
          .status(400)
          .json({ message: "Please select between 1 and 5 tags" });
      }
    }

    const blog = await Blog.create({
      title,
      content,
      category,      // stored separately
      subcategory,   // stored separately
      author: req.user._id,
      image: imageUrl,
      tags: parsedTags,
    });

    const populatedBlog = await blog.populate("tags", "name");
    res.status(201).json(populatedBlog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Blogs with search & filters
export const getBlogs = async (req, res) => {
  try {
    const { search, category, subcategory } = req.query;
    let query = {};

    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;

    if (search) {
      const authors = await User.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");
      const authorIds = authors.map((a) => a._id);

      const Tag = (await import("../models/Tag.js")).default;
      const matchingTags = await Tag.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");
      const tagIds = matchingTags.map((t) => t._id);

      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $in: authorIds } },
        { tags: { $in: tagIds } },
      ];
    }

    const blogs = await Blog.find(query)
      .populate("author", "name profileImage")
      .populate("tags", "name")
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Single Blog
export const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("author", "name profileImage")
      .populate("tags", "name");
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update Blog
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const { title, content, category, subcategory, tags } = req.body;

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.category = category || blog.category;
    blog.subcategory = subcategory || blog.subcategory;

    if (tags) {
      const parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags);
      blog.tags = parsedTags;
    }

    if (req.file) {
      const buffer = req.file.buffer;
      const imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "blogs" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        stream.end(buffer);
      });
      blog.image = imageUrl;
    }

    await blog.save();
    const populatedBlog = await blog.populate("tags", "name");
    res.json(populatedBlog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Blog
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    await blog.deleteOne();
    res.json({ message: "Blog deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Toggle Like
export const toggleLike = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const userId = req.user._id.toString();
    if (blog.likes.includes(userId)) {
      blog.likes = blog.likes.filter((id) => id.toString() !== userId);
    } else {
      blog.likes.push(userId);
    }

    await blog.save();
    res.json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Report a blog
export const reportBlog = async (req, res) => {
  try {
    const { reason } = req.body;
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Check if user already reported
    const alreadyReported = blog.reports.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReported) return res.status(400).json({ message: "You already reported this blog" });

    blog.reports.push({ user: req.user._id, reason });
    await blog.save();

    res.json({ message: "Blog reported successfully", reportsCount: blog.reports.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};