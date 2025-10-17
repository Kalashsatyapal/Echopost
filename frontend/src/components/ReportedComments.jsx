// frontend/src/components/ReportedComments.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function ReportedComments() {
  const [reportedComments, setReportedComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchReportedComments = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/comments/reported", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReportedComments(res.data);
      } catch (err) {
        console.error("Error fetching reported comments:", err);
        toast.error("Failed to fetch reported comments");
      } finally {
        setLoading(false);
      }
    };
    fetchReportedComments();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/comments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Comment deleted");
      setReportedComments((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      toast.error("Failed to delete comment");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-10 text-gray-600">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500 mr-3"></div>
        Loading reported comments...
      </div>
    );

  if (reportedComments.length === 0)
    return (
      <p className="text-center text-gray-500 py-6">
        🎉 No reported comments found.
      </p>
    );

  return (
    <div className="overflow-x-auto">
      <table className="w-full border">
        <thead className="bg-red-100 text-red-700">
          <tr>
            <th className="p-2 text-left">Comment</th>
            <th className="p-2 text-left">Author</th>
            <th className="p-2 text-left">Blog</th>
            <th className="p-2 text-left">Reports</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reportedComments.map((comment) => (
            <tr key={comment._id} className="border-t hover:bg-gray-50">
              <td className="p-2 text-gray-800">{comment.text}</td>
              <td className="p-2 text-gray-600">{comment.author?.name || "Unknown"}</td>
              <td className="p-2 text-gray-600">{comment.blog?.title || "N/A"}</td>
              <td className="p-2 text-gray-600">
                {comment.reports?.length || 0}
              </td>
              <td className="p-2">
                <button
                  onClick={() => handleDelete(comment._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
