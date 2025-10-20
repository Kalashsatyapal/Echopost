import { useEffect, useState, Fragment } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Ban } from "lucide-react";
import toast from "react-hot-toast";

export default function ReportedComments() {
  const [reportedComments, setReportedComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedComment, setExpandedComment] = useState(null);
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

  const toggleExpand = (id) => {
    setExpandedComment(expandedComment === id ? null : id);
  };

  // ✅ Block Comment Handler
  const handleBlock = async (id) => {
    if (!window.confirm("Are you sure you want to block this comment?")) return;
    try {
      await axios.put(
        `http://localhost:5000/api/comments/block/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Comment blocked successfully");
      setReportedComments((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Error blocking comment:", err);
      toast.error("Failed to block comment");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-10 text-gray-600">
        <div className="animate-spin h-6 w-6 border-t-2 border-red-500 rounded-full mr-3" />
        Loading reported comments...
      </div>
    );

  if (reportedComments.length === 0)
    return (
      <p className="text-gray-500 text-center py-4">
        🎉 No reported comments found.
      </p>
    );

  return (
    <div className="overflow-x-auto">
      <table className="w-full border text-sm">
        <thead className="bg-red-100 text-red-700">
          <tr>
            <th className="p-2 text-left">Blog Title</th>
            <th className="p-2 text-left">Author</th>
            <th className="p-2 text-left">Reports</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reportedComments.map((comment) => (
            <Fragment key={comment._id}>
              <tr
                className={`border-t hover:bg-gray-50 transition ${
                  expandedComment === comment._id ? "bg-gray-100" : ""
                }`}
              >
                <td
                  className="p-2 font-medium text-gray-800 cursor-pointer"
                  onClick={() => toggleExpand(comment._id)}
                >
                  {comment.blog?.title?.length > 50
                    ? comment.blog.title.slice(0, 50) + "..."
                    : comment.blog?.title || "Untitled Blog"}
                </td>
                <td className="p-2 text-gray-600 flex items-center gap-2">
                  {comment.author?.profileImage ? (
                    <img
                      src={comment.author.profileImage}
                      alt={comment.author.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-300" />
                  )}
                  {comment.author?.name || "Unknown"}
                </td>
                <td className="p-2 text-gray-700 font-semibold">
                  {comment.reports?.length || 0}
                </td>
                <td className="p-2">
                  <span className="text-red-600 font-semibold">Reported</span>
                </td>
                <td className="p-2 flex items-center gap-2">
                  <button
                    onClick={() => toggleExpand(comment._id)}
                    className="p-2 rounded-lg hover:bg-gray-200 transition"
                    title={
                      expandedComment === comment._id
                        ? "Hide details"
                        : "View details"
                    }
                  >
                    {expandedComment === comment._id ? (
                      <EyeOff className="w-5 h-5 text-gray-700" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-700" />
                    )}
                  </button>

                  <button
                    onClick={() => handleBlock(comment._id)}
                    className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                    title="Block comment"
                  >
                    <Ban className="w-5 h-5" />
                  </button>
                </td>
              </tr>

              {/* Expanded Inline Details */}
              <AnimatePresence>
                {expandedComment === comment._id && (
                  <tr className="border-t bg-white">
                    <td colSpan="5" className="p-0">
                      <motion.div
                        key={comment._id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 space-y-3">
                          <p className="text-gray-800">{comment.text}</p>
                          {comment.reports?.length > 0 && (
                            <div className="border-t pt-2">
                              <h4 className="text-red-600 font-semibold mb-2">
                                🧾 Reports ({comment.reports.length})
                              </h4>
                              <ul className="space-y-2">
                                {comment.reports.map((r, i) => (
                                  <li
                                    key={i}
                                    className="bg-gray-50 border rounded p-2 text-gray-700"
                                  >
                                    <p>
                                      <span className="font-semibold">
                                        {r.user?.name || "Unknown"}:
                                      </span>{" "}
                                      {r.reason}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {new Date(r.createdAt).toLocaleString()}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
