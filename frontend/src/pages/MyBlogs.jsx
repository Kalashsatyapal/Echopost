import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Sidebar from "../components/Sidebar.jsx";
import ProfileMenu from "../components/ProfileMenu.jsx";
import BlogList from "../components/BlogList.jsx";

export default function MyBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [likedBlogIds, setLikedBlogIds] = useState([]);
  const [activeAnimations, setActiveAnimations] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [commentsData, setCommentsData] = useState({});
  const [newCommentText, setNewCommentText] = useState({});
  const [commentCounts, setCommentCounts] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const currentUserId = user?._id;

  // Fetch current user + blogs
  const fetchUserData = async () => {
    try {
      if (!token) return;

      const res = await axios.get("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
      setBlogs(res.data.blogs || []);

      const liked = (res.data.blogs || [])
        .filter((b) => b.likes.includes(res.data.user._id))
        .map((b) => b._id);
      setLikedBlogIds(liked);

      // Comment counts
      res.data.blogs.forEach(async (b) => {
        try {
          const resC = await axios.get(`http://localhost:5000/api/comments/${b._id}`);
          setCommentCounts((prev) => ({ ...prev, [b._id]: resC.data.length }));
        } catch {}
      });
    } catch (err) {
      console.error("Failed to fetch user blogs:", err);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getProfileImage = () => {
    if (!user?.profileImage) return null;
    if (user.profileImage.startsWith("data:image") || user.profileImage.startsWith("http"))
      return user.profileImage;
    const base64Pattern = /^[A-Za-z0-9+/]+={0,2}$/;
    if (base64Pattern.test(user.profileImage)) return `data:image/png;base64,${user.profileImage}`;
    return `http://localhost:5000${user.profileImage}`;
  };

  // Delete a blog
  const handleDelete = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/blogs/${blogId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs(blogs.filter((b) => b._id !== blogId));
    } catch (err) {
      console.error("Failed to delete blog:", err);
      alert("Failed to delete blog");
    }
  };

  // Toggle like
  const toggleLike = async (blogId) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/blogs/like/${blogId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setActiveAnimations((prev) => ({ ...prev, [blogId]: true }));
      setTimeout(() => setActiveAnimations((prev) => ({ ...prev, [blogId]: false })), 1000);

      if (likedBlogIds.includes(blogId)) {
        setLikedBlogIds(likedBlogIds.filter((id) => id !== blogId));
      } else {
        setLikedBlogIds([...likedBlogIds, blogId]);
      }

      setBlogs((prev) =>
        prev.map((b) => (b._id === blogId ? { ...b, likes: res.data.likes } : b))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Updated toggleComments with fade animation
  const toggleComments = async (blogId) => {
    // Toggle open/close immediately
    setOpenComments((prev) => ({
      ...prev,
      [blogId]: !prev[blogId],
    }));

    // Fetch comments only if not loaded yet
    if (!commentsData[blogId]) {
      try {
        const res = await axios.get(`http://localhost:5000/api/comments/${blogId}`);
        setCommentsData((prev) => ({ ...prev, [blogId]: res.data }));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const addComment = async (blogId) => {
    const text = newCommentText[blogId]?.trim();
    if (!text) return;
    try {
      const res = await axios.post(
        `http://localhost:5000/api/comments/${blogId}`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCommentsData((prev) => ({
        ...prev,
        [blogId]: [res.data, ...(prev[blogId] || [])],
      }));
      setCommentCounts((prev) => ({ ...prev, [blogId]: (prev[blogId] || 0) + 1 }));
      setNewCommentText((prev) => ({ ...prev, [blogId]: "" }));
    } catch (err) {
      console.error(err);
    }
  };

  // Edit comment
  const startEditComment = (commentId, text) => {
    setEditingCommentId(commentId);
    setEditCommentText(text);
  };

  const saveEditComment = async (blogId, commentId) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/comments/${commentId}`,
        { text: editCommentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentsData((prev) => ({
        ...prev,
        [blogId]: prev[blogId].map((c) =>
          c._id === commentId ? { ...c, text: res.data.text } : c
        ),
      }));
      setEditingCommentId(null);
      setEditCommentText("");
    } catch (err) {
      console.error(err);
    }
  };

  // Delete comment
  const deleteComment = async (blogId, commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCommentsData((prev) => ({
        ...prev,
        [blogId]: prev[blogId].filter((c) => c._id !== commentId),
      }));
      setCommentCounts((prev) => ({ ...prev, [blogId]: prev[blogId] - 1 }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-100 to-indigo-200 font-sans text-gray-800 flex">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} handleLogout={handleLogout} />

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 md:ml-64 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between bg-white bg-opacity-90 py-3 px-6 shadow border-b z-10">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 rounded bg-gray-100"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <h1 className="text-2xl font-bold text-indigo-700 tracking-wide">📝 My Blogs</h1>
          </div>

          <ProfileMenu
            user={user}
            handleLogout={handleLogout}
            getProfileImage={getProfileImage}
          />
        </div>

        {/* Blog List Section with separate padding/margin */}
        <div className="px-6 py-6 md:px-10 md:py-8 w-[calc(100%-100px)] mx-[50px] transition-all duration-300">
          <BlogList
            blogs={blogs}
            likedBlogIds={likedBlogIds}
            activeAnimations={activeAnimations}
            openComments={openComments}
            commentsData={commentsData}
            commentCounts={commentCounts}
            currentUserId={currentUserId}
            toggleLike={toggleLike}
            toggleComments={toggleComments}  // Updated function
            handleDelete={handleDelete}
            setNewCommentText={setNewCommentText}
            newCommentText={newCommentText}
            addComment={addComment}
            editingCommentId={editingCommentId}
            startEditComment={startEditComment}
            saveEditComment={saveEditComment}
            editCommentText={editCommentText}
            setEditCommentText={setEditCommentText}
            deleteComment={deleteComment}
          />
        </div>
      </div>

      {/* Like animation styles */}
      <style>
        {`
          @keyframes flyThumbs {0% { transform: translateY(0) scale(1); opacity:1;} 50% { transform: translateY(-20px) scale(1.3); opacity:1;} 100% { transform: translateY(-40px) scale(0); opacity:0; }}
          .animate-fly-thumbs { animation: flyThumbs 1s ease-out forwards; }
          ${[...Array(6)].map((_, i) => `
            @keyframes particle-${i} {0%{transform:translate(0,0);opacity:1;}100%{transform:translate(${Math.random()*40-20}px,${Math.random()*-40}px);opacity:0;} }
            .animate-particle-${i}{animation:particle-${i} 0.8s ease-out forwards;}
          `).join("")}

          /* Fade-in/out for comments */
          .comment-section {
            transition: opacity 0.3s ease;
            opacity: 1;
          }
          .comment-section.hidden {
            opacity: 0;
            height: 0;
            overflow: hidden;
          }
        `}
      </style>
    </div>
  );
}
