import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function ReportComment() {
  const { id } = useParams(); // comment ID
  const [comment, setComment] = useState(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchComment = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/comments/comment/${id}`);
        setComment(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch comment");
      } finally {
        setLoading(false);
      }
    };
    fetchComment();
  }, [id]);

  const handleReport = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return toast.error("Please enter a reason");

    try {
      await axios.put(
        `http://localhost:5000/api/comments/report/${id}`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Comment reported successfully");
      navigate(-1);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to report comment");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mr-3"></div>
        Loading comment details...
      </div>
    );

  if (!comment)
    return (
      <div className="text-center text-gray-500 py-10">
        Comment not found or removed.
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto bg-white mt-10 p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">🚨 Report Comment</h2>

      <div className="mb-4 border-b pb-2">
        <p className="text-gray-700 text-sm italic">
          "{comment.text}"
        </p>
        <div className="mt-2 flex items-center gap-2">
          {comment.author?.profileImage && (
            <img
              src={comment.author.profileImage}
              alt={comment.author.name}
              className="w-6 h-6 rounded-full"
            />
          )}
          <p className="text-gray-600 text-sm">{comment.author?.name}</p>
        </div>
      </div>

      <form onSubmit={handleReport} className="space-y-4">
        <textarea
          className="w-full border rounded p-2 text-sm focus:ring-1 focus:ring-red-400"
          placeholder="Explain why you're reporting this comment..."
          rows="4"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        ></textarea>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Submit Report
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
