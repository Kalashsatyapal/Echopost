import Comment from "../models/Comment.js";
import Blog from "../models/Blog.js";

// Add Comment
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const comment = await Comment.create({
      blog: blog._id,
      author: req.user._id,
      text,
    });

    // Return the populated comment
    const populatedComment = await comment.populate("author", "name profileImage");
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get Comments for Blog
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ blog: req.params.blogId })
      .populate("author", "name profileImage")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update Comment
export const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    comment.text = req.body.text;
    await comment.save();

    const populatedComment = await comment.populate("author", "name profileImage");
    res.json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Comment
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
