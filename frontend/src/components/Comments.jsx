import { useEffect, useState } from "react";
import axios from "axios";

export default function Comments({ blogId, currentUserId, onCommentChange }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const fetchComments = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/comments/${blogId}`);
      setComments(res.data);
      if (onCommentChange) onCommentChange(res.data.length);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(
        `http://localhost:5000/api/comments/${blogId}`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setComments([res.data, ...comments]);
      setNewComment("");
      if (onCommentChange) onCommentChange(comments.length + 1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditComment = (id, text) => {
    setEditingId(id);
    setEditingText(text);
  };

  const handleUpdateComment = async (id) => {
    if (!editingText.trim()) return;
    try {
      const res = await axios.put(
        `http://localhost:5000/api/comments/${id}`,
        { text: editingText },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setComments(comments.map(c => c._id === id ? res.data : c));
      setEditingId(null);
      setEditingText("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/comments/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setComments(comments.filter(c => c._id !== id));
      if (onCommentChange) onCommentChange(comments.length - 1);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mt-3 border-t pt-3">
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-grow p-2 border rounded shadow-sm"
        />
        <button
          onClick={handleAddComment}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Comment
        </button>
      </div>

      {comments.map((c) => (
        <div key={c._id} className="mb-2 p-2 bg-gray-50 rounded shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {c.author.profileImage && (
                <img
                  src={
                    c.author.profileImage.startsWith("data:image") ||
                    c.author.profileImage.startsWith("http")
                      ? c.author.profileImage
                      : `data:image/png;base64,${c.author.profileImage}`
                  }
                  alt="avatar"
                  className="w-6 h-6 rounded-full"
                />
              )}
              <span className="font-semibold">{c.author.name}</span>
            </div>

            {c.author._id === currentUserId && (
              <div className="flex gap-2 text-xs text-gray-500">
                {editingId === c._id ? (
                  <>
                    <button
                      onClick={() => handleUpdateComment(c._id)}
                      className="hover:text-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="hover:text-red-600"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEditComment(c._id, c.text)}
                      className="hover:text-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteComment(c._id)}
                      className="hover:text-red-600"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {editingId === c._id ? (
            <input
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              className="w-full mt-1 p-1 border rounded"
            />
          ) : (
            <p className="mt-1 text-gray-700">{c.text}</p>
          )}
        </div>
      ))}
    </div>
  );
}
