import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function AllBlogList({ blogs, currentUserId, refreshBlogs }) {
  const [likedBlogIds, setLikedBlogIds] = useState([]);
  const [activeAnimations, setActiveAnimations] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [commentsData, setCommentsData] = useState({});
  const [newCommentText, setNewCommentText] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState({});
  const [commentCounts, setCommentCounts] = useState({});
  const [expandedContent, setExpandedContent] = useState({});

  useEffect(() => {
    if (blogs && currentUserId) {
      const liked = blogs
        .filter((b) => b.likes.includes(currentUserId))
        .map((b) => b._id);
      setLikedBlogIds(liked);

      blogs.forEach(async (b) => {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/comments/${b._id}`
          );
          setCommentCounts((prev) => ({ ...prev, [b._id]: res.data.length }));
        } catch (err) {
          console.error("Failed to fetch comment count", err);
        }
      });
    }
  }, [blogs, currentUserId]);

  const toggleLike = async (blogId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/blogs/like/${blogId}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setActiveAnimations((prev) => ({ ...prev, [blogId]: true }));
      setTimeout(
        () => setActiveAnimations((prev) => ({ ...prev, [blogId]: false })),
        1000
      );

      if (likedBlogIds.includes(blogId)) {
        setLikedBlogIds(likedBlogIds.filter((id) => id !== blogId));
      } else {
        setLikedBlogIds([...likedBlogIds, blogId]);
      }

      if (refreshBlogs) refreshBlogs();
    } catch (err) {
      console.error("Failed to like/unlike blog:", err);
    }
  };

  const toggleComments = async (blogId) => {
    if (!openComments[blogId]) {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/comments/${blogId}`
        );
        setCommentsData((prev) => ({ ...prev, [blogId]: res.data }));
      } catch (err) {
        console.error(err);
      }
    }
    setOpenComments((prev) => ({ ...prev, [blogId]: !prev[blogId] }));
  };

  const toggleContent = (blogId) => {
    setExpandedContent((prev) => ({ ...prev, [blogId]: !prev[blogId] }));
  };

  const addComment = async (blogId) => {
    const text = newCommentText[blogId]?.trim();
    if (!text) return;
    try {
      const res = await axios.post(
        `http://localhost:5000/api/comments/${blogId}`,
        { text },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setCommentsData((prev) => ({
        ...prev,
        [blogId]: [res.data, ...(prev[blogId] || [])],
      }));
      setCommentCounts((prev) => ({
        ...prev,
        [blogId]: (prev[blogId] || 0) + 1,
      }));
      setNewCommentText((prev) => ({ ...prev, [blogId]: "" }));
    } catch (err) {
      console.error(err);
    }
  };

  const editComment = (commentId, text) => {
    setEditingCommentId(commentId);
    setEditingText((prev) => ({ ...prev, [commentId]: text }));
  };

  const updateComment = async (commentId, blogId) => {
    const text = editingText[commentId]?.trim();
    if (!text) return;
    try {
      const res = await axios.put(
        `http://localhost:5000/api/comments/${commentId}`,
        { text },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setCommentsData((prev) => ({
        ...prev,
        [blogId]: prev[blogId].map((c) => (c._id === commentId ? res.data : c)),
      }));
      setEditingCommentId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteComment = async (commentId, blogId) => {
    try {
      await axios.delete(`http://localhost:5000/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCommentsData((prev) => ({
        ...prev,
        [blogId]: prev[blogId].filter((c) => c._id !== commentId),
      }));
      setCommentCounts((prev) => ({
        ...prev,
        [blogId]: (prev[blogId] || 1) - 1,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // ===== New: Report Blog =====
  const reportBlog = async (blogId) => {
    const reason = prompt("Enter reason for reporting this blog:");
    if (!reason) return;
    try {
      await axios.put(
        `http://localhost:5000/api/blogs/report/${blogId}`,
        { reason },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("Blog reported successfully.");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to report blog.");
    }
  };

  const getProfileImage = (profileImage) => {
    if (!profileImage) return "/default-avatar.png";
    if (profileImage.startsWith("http")) return profileImage;
    return `http://localhost:5000${profileImage}`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-all">
      {blogs.length > 0 ? (
        blogs.map((b) => {
          const isLiked = likedBlogIds.includes(b._id);
          const isAnimating = activeAnimations[b._id];
          const comments = commentsData[b._id] || [];
          const commentCount = commentCounts[b._id] || 0;
          const isExpanded = expandedContent[b._id] || false;

          return (
            <div
              key={b._id}
              className="p-3 bg-white rounded-lg shadow-md hover:shadow-lg border border-gray-200 flex flex-col"
            >
              {/* Author Info */}
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={getProfileImage(b.author?.profileImage)}
                  alt={b.author?.name || "Author"}
                  className="w-8 h-8 rounded-full object-cover border"
                />
                <div>
                  <p className="font-semibold text-gray-700 text-sm">
                    {b.author?.name || "Unknown Author"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(b.createdAt)}
                  </p>
                </div>
              </div>

              {/* Blog Image */}
              {b.image && (
                <img
                  src={
                    b.image.startsWith("http")
                      ? b.image
                      : `http://localhost:5000${b.image}`
                  }
                  alt={b.title}
                  className="w-full h-32 object-cover rounded mb-2"
                />
              )}

              {/* Blog Title */}
              <h2 className="text-md font-semibold text-gray-800 mb-1 line-clamp-2 hover:text-blue-600 transition">
                <Link to={`/blog/${b._id}`}>{b.title}</Link>
              </h2>

              {/* Category + Subcategory */}
              <div className="flex flex-wrap gap-1 mb-1 text-xs text-gray-500">
                {b.category && (
                  <span className="font-medium">Category: {b.category}</span>
                )}
                {b.subcategory && (
                  <span className="font-medium">
                    Subcategory: {b.subcategory}
                  </span>
                )}
              </div>

              {/* Tags */}
              {b.tags && b.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {b.tags.map((tag) => (
                    <span
                      key={tag._id}
                      className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Blog Content */}
              <div className="text-gray-700 mb-2 flex-1 text-sm">
                <p
                  className={`${!isExpanded ? "line-clamp-2" : ""}`}
                  dangerouslySetInnerHTML={{ __html: b.content }}
                />
                {b.content.length > 120 && (
                  <button
                    onClick={() => toggleContent(b._id)}
                    className="text-blue-500 font-medium mt-1 hover:underline text-sm"
                  >
                    {isExpanded ? "Read Less" : "Read More"}
                  </button>
                )}
              </div>

              {/* Like + Comments + Report */}
              <div className="flex justify-between items-center text-xs text-gray-600 mt-auto gap-2">
                <button
                  onClick={() => toggleLike(b._id)}
                  className={`flex items-center gap-1 font-semibold transition-transform duration-150 ${
                    isLiked ? "text-blue-500 scale-105" : "text-gray-600"
                  }`}
                >
                  👍 {b.likes?.length || 0}
                  {isAnimating && (
                    <span className="animate-fly-thumbs absolute text-blue-500 text-sm">
                      👍
                    </span>
                  )}
                </button>

                <button
                  onClick={() => toggleComments(b._id)}
                  className="hover:text-blue-500"
                >
                  💬 {commentCount} Comments
                </button>

                <Link
                  to={`/report/${b._id}`}
                  className="text-red-500 hover:underline font-medium"
                >
                  🚨 Report
                </Link>
              </div>

              {/* Comments Section */}
              {openComments[b._id] && (
                <div className="mt-2 border-t pt-2 space-y-1 text-xs">
                  <div className="flex gap-1 mb-1">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={newCommentText[b._id] || ""}
                      onChange={(e) =>
                        setNewCommentText((prev) => ({
                          ...prev,
                          [b._id]: e.target.value,
                        }))
                      }
                      className="flex-grow p-1 border rounded focus:ring-1 focus:ring-blue-400 outline-none text-xs"
                    />
                    <button
                      onClick={() => addComment(b._id)}
                      className="px-2 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                    >
                      Comment
                    </button>
                  </div>

                  {comments.map((c) => (
                    <div
                      key={c._id}
                      className="bg-gray-50 p-1 rounded shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-1 items-center">
                          <img
                            src={getProfileImage(c.author?.profileImage)}
                            alt={c.author?.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <p className="font-medium text-gray-700 text-xs">
                            {c.author?.name}
                          </p>
                        </div>
                        {c.author._id === currentUserId && (
                          <div className="flex gap-1 text-xs text-gray-500">
                            {editingCommentId === c._id ? (
                              <>
                                <button
                                  onClick={() => updateComment(c._id, b._id)}
                                  className="hover:text-green-600"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingCommentId(null)}
                                  className="hover:text-red-600"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => editComment(c._id, c.text)}
                                  className="hover:text-blue-600"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => deleteComment(c._id, b._id)}
                                  className="hover:text-red-600"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {editingCommentId === c._id ? (
                        <input
                          value={editingText[c._id] || ""}
                          onChange={(e) =>
                            setEditingText((prev) => ({
                              ...prev,
                              [c._id]: e.target.value,
                            }))
                          }
                          className="w-full mt-1 p-1 border rounded text-xs"
                        />
                      ) : (
                        <p className="mt-1 text-gray-700 text-xs">{c.text}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="col-span-full text-center text-gray-500 py-10 bg-gray-50 rounded-lg shadow-inner text-sm">
          No blogs found. Start by creating one!
        </div>
      )}
    </div>
  );
}
