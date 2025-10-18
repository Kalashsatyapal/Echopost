import { useEffect, useState, Fragment } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function BlockedComments() {
  const [blockedComments, setBlockedComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedComment, setExpandedComment] = useState(null);
  const [notAuthorized, setNotAuthorized] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchBlockedComments = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/comments/superadmin/blocked-comments",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setBlockedComments(res.data);
      } catch (err) {
        if (err.response && err.response.status === 403) {
          setNotAuthorized(true); // Backend denied access
        } else {
          console.error("Failed to fetch blocked comments:", err);
          toast.error("Could not load blocked comments");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBlockedComments();
  }, [token]);

  const toggleExpand = (id) =>
    setExpandedComment(expandedComment === id ? null : id);

  const handleUnblock = async (id) => {
    if (!window.confirm("Unblock this comment?")) return;
    try {
      await axios.put(
        `http://localhost:5000/api/comments/superadmin/unblock-comment/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Comment unblocked successfully");
      setBlockedComments((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to unblock comment");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-10 text-gray-600">
        <div className="animate-spin h-6 w-6 border-t-2 border-red-500 rounded-full mr-3" />
        Loading blocked comments...
      </div>
    );

  if (notAuthorized)
    return (
      <p className="text-red-500 text-center py-10 font-semibold">
        🚫 You are not authorized to view blocked comments.
      </p>
    );

  if (blockedComments.length === 0)
    return (
      <p className="text-gray-500 text-center py-4">
        🎉 No blocked comments found.
      </p>
    );

  return (
    <div className="overflow-x-auto">
      <table className="w-full border text-sm">
        <thead className="bg-red-100 text-red-700">
          <tr>
            <th className="p-2 text-left">Blog Title</th>
            <th className="p-2 text-left">Author</th>
            <th className="p-2 text-left">Blocked On</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {blockedComments.map((comment) => (
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
                  {comment.blog?.title || "Untitled Blog"}
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
                <td className="p-2 text-gray-500">
                  {new Date(comment.blockedAt).toLocaleDateString()}
                </td>
                <td className="p-2 flex gap-2">
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
                    onClick={() => handleUnblock(comment._id)}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                  >
                    Unblock
                  </button>
                </td>
              </tr>

              {expandedComment === comment._id && (
                <tr className="border-t bg-white">
                  <td colSpan="4" className="p-4">
                    <div className="space-y-3">
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
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
