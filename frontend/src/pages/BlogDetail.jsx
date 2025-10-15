import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { FaArrowLeft, FaThumbsUp, FaCommentDots } from "react-icons/fa";
import logo from "../assets/logo.png";

export default function BlogDetail() {
  const { id } = useParams();
  const token = useSelector((state) => state.auth.token);
  const authUser = useSelector((state) => state.auth.user);

  const currentUserId =
    authUser?.id ||
    authUser?._id ||
    (authUser?._id?.toString && authUser._id.toString()) ||
    null;

  const [blog, setBlog] = useState(null);
  const [blogAuthor, setBlogAuthor] = useState(null);
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState({});
  const [isLiked, setIsLiked] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);

  const getImageSrc = (img) => {
    if (!img) return "/default-avatar.png";
    if (typeof img !== "string") return "/default-avatar.png";
    if (img.startsWith("data:") || img.startsWith("http")) return img;
    const base64Pattern = /^[A-Za-z0-9+/]+={0,2}$/;
    if (base64Pattern.test(img)) return `data:image/png;base64,${img}`;
    if (img.startsWith("/")) return `http://localhost:5000${img}`;
    return img;
  };

  const getAuthorId = (author) => {
    if (!author) return null;
    if (typeof author === "string") return author;
    return (
      (author._id && author._id.toString()) ||
      (author.id && author.id.toString()) ||
      null
    );
  };

  // Fetch blog + author + comments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const blogRes = await axios.get(`http://localhost:5000/api/blogs/${id}`);
        const blogData = blogRes.data;
        setBlog(blogData);
        setIsLiked(Boolean(blogData?.likes?.includes(currentUserId)));

        // ✅ Handle author data properly
        if (blogData?.author) {
          if (typeof blogData.author === "string") {
            // Fetch full author details if it's just an ID
            const authorRes = await axios.get(
              `http://localhost:5000/api/users/${blogData.author}`
            );
            setBlogAuthor(authorRes.data);
          } else {
            setBlogAuthor(blogData.author);
          }
        }

        // Fetch comments
        const commentsRes = await axios.get(
          `http://localhost:5000/api/comments/${id}`
        );
        setComments(Array.isArray(commentsRes.data) ? commentsRes.data : []);
      } catch (err) {
        console.error("Failed to fetch blog/comments:", err);
      }
    };

    fetchData();
  }, [id, currentUserId]);

  const toggleLike = async () => {
    if (!blog) return;
    try {
      const res = await axios.put(
        `http://localhost:5000/api/blogs/like/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBlog(res.data);
      setIsLiked(Boolean(res.data?.likes?.includes(currentUserId)));
      setLikeAnimating(true);
      setTimeout(() => setLikeAnimating(false), 1000);
    } catch (err) {
      console.error("Failed to like/unlike blog:", err);
    }
  };

  const addComment = async () => {
    const text = newCommentText.trim();
    if (!text) return;
    try {
      const res = await axios.post(
        `http://localhost:5000/api/comments/${id}`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => [res.data, ...prev]);
      setNewCommentText("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const editComment = (commentId, text) => {
    setEditingCommentId(commentId);
    setEditingText((prev) => ({ ...prev, [commentId]: text }));
  };

  const updateComment = async (commentId) => {
    const text = editingText[commentId]?.trim();
    if (!text) return;
    try {
      const res = await axios.put(
        `http://localhost:5000/api/comments/${commentId}`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => prev.map((c) => (c._id === commentId ? res.data : c)));
      setEditingCommentId(null);
      setEditingText((prev) => ({ ...prev, [commentId]: "" }));
    } catch (err) {
      console.error("Failed to update comment:", err);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await axios.delete(`http://localhost:5000/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  if (!blog)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 via-purple-100 to-indigo-200 text-indigo-700 font-semibold text-xl">
        Loading Blog...
      </div>
    );

  const author = blogAuthor || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-100 to-indigo-200 text-gray-800 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <img src={logo} alt="EchoPost Logo" className="h-10 w-10 object-contain" />
          <h1 className="text-2xl font-extrabold text-indigo-700">EchoPost</h1>
        </div>
        <Link
          to="/dashboard"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-500 transition"
        >
          <FaArrowLeft /> Back
        </Link>
      </header>

      {/* Blog Card */}
      <div className="max-w-4xl mx-auto bg-white bg-opacity-90 shadow-xl rounded-2xl p-8 my-10 backdrop-blur-sm">
        {/* Author */}
        <div className="flex items-center gap-4 mb-6">
          <img
            src={getImageSrc(author.profileImage)}
            alt={author.name || "Author"}
            className="w-14 h-14 rounded-full object-cover border-2 border-indigo-300"
          />
          <div>
            <div className="text-lg font-semibold text-gray-800">
              {author.name || "Unknown Author"}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(blog.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Blog Image */}
        {blog.image && (
          <img
            src={getImageSrc(blog.image)}
            alt={blog.title}
            className="w-full max-h-96 object-cover rounded-2xl shadow-md mb-6"
          />
        )}

        <h1 className="text-4xl font-extrabold text-indigo-700 mb-3">{blog.title}</h1>
        <p className="text-sm text-teal-600 mb-5 font-medium">{blog.category}</p>

        <div
          className="prose max-w-full text-gray-700 mb-8"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Likes and Comments */}
        <div className="flex items-center gap-6 mb-8">
          <button
            onClick={toggleLike}
            className={`relative flex items-center gap-2 font-semibold transition-transform duration-150 hover:scale-110 ${
              isLiked ? "text-indigo-600" : "text-gray-600"
            }`}
          >
            <FaThumbsUp /> {Array.isArray(blog.likes) ? blog.likes.length : 0}
            {likeAnimating && (
              <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 animate-fly-thumbs text-indigo-600 text-lg">
                👍
              </span>
            )}
          </button>

          <button
            onClick={() => document.getElementById("commentInput")?.focus()}
            className="flex items-center gap-2 text-gray-600 font-semibold hover:text-teal-600 transition"
          >
            <FaCommentDots /> {comments.length} Comments
          </button>
        </div>

        {/* Comment Input */}
        <div className="flex mb-6 gap-2">
          <input
            id="commentInput"
            type="text"
            placeholder="Add a comment..."
            className="flex-grow p-3 border rounded-l-lg focus:ring-2 focus:ring-teal-400 outline-none bg-white bg-opacity-70"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
          />
          <button
            onClick={addComment}
            className="px-5 bg-gradient-to-r from-indigo-600 to-teal-500 text-white font-semibold rounded-r-lg transition hover:scale-105"
          >
            Post
          </button>
        </div>

        {/* Comments List */}
        <ul className="space-y-4">
          {comments.map((c) => {
            const authorId = getAuthorId(c.author);
            const isAuthor =
              Boolean(authorId && currentUserId && authorId === currentUserId);
            const commentAuthor =
              typeof c.author === "object" ? c.author : { name: "User" };
            return (
              <li
                key={c._id}
                className={`p-4 border rounded-xl bg-white bg-opacity-80 shadow-sm ${
                  editingCommentId === c._id
                    ? "border-teal-400 bg-teal-50"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={getImageSrc(commentAuthor.profileImage)}
                      alt={commentAuthor.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-indigo-200"
                    />
                    <div>
                      <div className="font-semibold text-gray-800">
                        {commentAuthor.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(c.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {isAuthor && (
                    <div className="flex gap-3 text-sm text-gray-500">
                      {editingCommentId === c._id ? (
                        <>
                          <button
                            onClick={() => updateComment(c._id)}
                            className="hover:text-teal-600 font-semibold"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCommentId(null)}
                            className="hover:text-red-600 font-semibold"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => editComment(c._id, c.text)}
                            className="hover:text-indigo-600 font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteComment(c._id)}
                            className="hover:text-red-600 font-semibold"
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
                    value={editingText[c._id] ?? ""}
                    onChange={(e) =>
                      setEditingText((prev) => ({
                        ...prev,
                        [c._id]: e.target.value,
                      }))
                    }
                    className="w-full mt-3 p-2 border rounded focus:ring-2 focus:ring-teal-400 outline-none bg-white bg-opacity-70"
                  />
                ) : (
                  <p className="text-gray-700 mt-3">{c.text}</p>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <footer className="text-center py-6 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} EchoPost. Built for creators, by creators.
      </footer>

      <style>
        {`
          @keyframes flyThumbs {
            0% { transform: translateY(0) scale(1); opacity:1; }
            50% { transform: translateY(-20px) scale(1.3); opacity:1; }
            100% { transform: translateY(-40px) scale(0); opacity:0; }
          }
          .animate-fly-thumbs { animation: flyThumbs 1s ease-out forwards; }
        `}
      </style>
    </div>
  );
}
