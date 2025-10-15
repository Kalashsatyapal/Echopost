import { Link } from "react-router-dom";
import CommentsSection from "./CommentsSection.jsx";
import LikeButton from "./LikeButton.jsx";
import { useState } from "react";

export default function BlogItem({
  blog,
  isLiked,
  isAnimating,
  comments,
  commentCount,
  currentUserId,
  toggleLike,
  toggleComments,
  handleDelete,
  setNewCommentText,
  newCommentText,
  addComment,
  editingCommentId,
  startEditComment,
  saveEditComment,
  editCommentText,
  setEditCommentText,
  deleteComment,
}) {
  const [expanded, setExpanded] = useState(false);

  // Utility to get image URL
  const getBlogImage = () => {
    if (!blog.image) return null;
    if (blog.image.startsWith("data:image") || blog.image.startsWith("http")) return blog.image;
    return `http://localhost:5000${blog.image}`;
  };

  const blogImage = getBlogImage();

  // Truncated content
  const contentText = blog.content.replace(/<[^>]+>/g, ""); // strip HTML
  const isLongContent = contentText.length > 200; // threshold
  const displayedContent = expanded || !isLongContent
    ? blog.content
    : contentText.slice(0, 200) + "...";

  return (
    <div className="flex flex-col bg-white rounded-lg shadow hover:shadow-xl border overflow-hidden">
      {/* Blog Image */}
      {blogImage && (
        <div className="w-full h-48 md:h-64 overflow-hidden">
          <img
            src={blogImage}
            alt={blog.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}

      {/* Blog Content */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            <Link to={`/blog/${blog._id}`} className="hover:text-blue-600">
              {blog.title}
            </Link>
          </h2>
          <p className="text-sm text-blue-600 font-medium mb-2">
            {blog.category || "Uncategorized"}
          </p>

          <p
            className="text-gray-700 mb-3"
            dangerouslySetInnerHTML={{ __html: displayedContent }}
          />

          {/* Read More / Read Less */}
          {isLongContent && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-blue-500 font-medium text-sm hover:underline mb-3"
            >
              {expanded ? "Read Less" : "Read More"}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-2">
            <LikeButton blog={blog} isLiked={isLiked} isAnimating={isAnimating} toggleLike={toggleLike} />
            <button onClick={() => toggleComments(blog._id)} className="text-gray-600 font-semibold">
              💬 {commentCount} Comments
            </button>
          </div>

          <div className="flex gap-2">
            <Link
              to={`/edit-blog/${blog._id}`}
              className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
            >
              Edit
            </Link>
            <button
              onClick={() => handleDelete(blog._id)}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Inline comments */}
        {comments && (
          <CommentsSection
            blogId={blog._id}
            comments={comments}
            open={comments.length > 0}
            isOpen={true}
            currentUserId={currentUserId}
            newCommentText={newCommentText}
            setNewCommentText={setNewCommentText}
            addComment={addComment}
            editingCommentId={editingCommentId}
            startEditComment={startEditComment}
            saveEditComment={saveEditComment}
            editCommentText={editCommentText}
            setEditCommentText={setEditCommentText}
            deleteComment={deleteComment}
            isVisible={true}
          />
        )}
      </div>
    </div>
  );
}
