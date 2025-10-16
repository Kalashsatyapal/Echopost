import { useEffect, useState, Fragment } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react"; // 👁️ icons for toggle

export default function ReportedBlogs() {
  const [reportedBlogs, setReportedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBlog, setExpandedBlog] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchReportedBlogs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/superadmin/reported", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReportedBlogs(res.data);
      } catch (err) {
        console.error("Failed to fetch reported blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportedBlogs();
  }, []);

  const toggleExpand = (id) => {
    setExpandedBlog(expandedBlog === id ? null : id);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-10 text-gray-600">
        <div className="animate-spin h-6 w-6 border-t-2 border-red-500 rounded-full mr-3" />
        Loading reported blogs...
      </div>
    );

  if (reportedBlogs.length === 0)
    return <p className="text-gray-500 text-center py-4">No reported blogs found.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border text-sm">
        <thead className="bg-red-100 text-red-700">
          <tr>
            <th className="p-2 text-left">Title</th>
            <th className="p-2 text-left">Author</th>
            <th className="p-2 text-left">Reports</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reportedBlogs.map((blog) => (
            <Fragment key={blog._id}>
              {/* Summary row */}
              <tr
                className={`border-t hover:bg-gray-50 transition ${
                  expandedBlog === blog._id ? "bg-gray-100" : ""
                }`}
              >
                <td
                  className="p-2 font-medium text-gray-800 cursor-pointer"
                  onClick={() => toggleExpand(blog._id)}
                >
                  {blog.title}
                </td>
                <td className="p-2 text-gray-600 flex items-center gap-2">
                  {blog.author?.profileImage ? (
                    <img
                      src={blog.author.profileImage}
                      alt={blog.author.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-300" />
                  )}
                  {blog.author?.name || "Unknown"}
                </td>
                <td className="p-2 text-gray-700 font-semibold">
                  {blog.reports.length}
                </td>

                {/* Icon button instead of text */}
                <td className="p-2">
                  <button
                    onClick={() => toggleExpand(blog._id)}
                    className="p-2 rounded-lg hover:bg-gray-200 transition flex items-center justify-center"
                    title={expandedBlog === blog._id ? "Hide details" : "View details"}
                  >
                    {expandedBlog === blog._id ? (
                      <EyeOff className="w-5 h-5 text-gray-700" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-700" />
                    )}
                  </button>
                </td>
              </tr>

              {/* Expanded section */}
              <AnimatePresence>
                {expandedBlog === blog._id && (
                  <tr className="border-t bg-white">
                    <td colSpan="4" className="p-0">
                      <motion.div
                        key={blog._id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 space-y-4">
                          {/* Blog Image */}
                          {blog.image && (
                            <img
                              src={blog.image}
                              alt={blog.title}
                              className="w-full max-h-60 object-cover rounded-lg border"
                            />
                          )}

                          {/* Blog Content */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">
                              {blog.title}
                            </h3>
                            <div
                              className="text-gray-700 leading-relaxed prose max-w-none"
                              dangerouslySetInnerHTML={{ __html: blog.content }}
                            />
                          </div>

                          {/* Tags */}
                          {blog.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {blog.tags.map((tag) => (
                                <span
                                  key={tag._id}
                                  className="px-2 py-1 text-xs bg-gray-200 rounded-full text-gray-700"
                                >
                                  #{tag.name}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Reports */}
                          <div className="border-t pt-3">
                            <h4 className="text-md font-semibold text-red-600 mb-2">
                              🧾 Reports ({blog.reports.length})
                            </h4>
                            <ul className="space-y-2">
                              {blog.reports.map((r, i) => (
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
