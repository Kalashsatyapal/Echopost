import { useEffect, useState, Fragment } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react"; // for expand/collapse

export default function BlockedBlogs({ token }) {
  const [blockedBlogs, setBlockedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBlog, setExpandedBlog] = useState(null);

  useEffect(() => {
    const fetchBlockedBlogs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/superadmin/blocked-blogs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBlockedBlogs(res.data);
      } catch (err) {
        console.error("Failed to fetch blocked blogs:", err);
        toast.error("Could not load blocked blogs");
      } finally {
        setLoading(false);
      }
    };
    fetchBlockedBlogs();
  }, [token]);

  const toggleExpand = (id) => setExpandedBlog(expandedBlog === id ? null : id);

  const handleUnblock = async (id) => {
    if (!window.confirm("Unblock this blog?")) return;
    try {
      await axios.put(
        `http://localhost:5000/api/superadmin/unblock/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Blog unblocked successfully");
      setBlockedBlogs((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to unblock blog");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-10 text-gray-600">
        <div className="animate-spin h-6 w-6 border-t-2 border-red-500 rounded-full mr-3" />
        Loading blocked blogs...
      </div>
    );

  if (blockedBlogs.length === 0)
    return <p className="text-gray-500 text-center py-4">No blocked blogs found.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border text-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-2 text-left">Title</th>
            <th className="p-2 text-left">Author</th>
            <th className="p-2 text-left">Blocked On</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {blockedBlogs.map((blog) => (
            <Fragment key={blog._id}>
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
                <td className="p-2 text-gray-600">{blog.author?.name || "Unknown"}</td>
                <td className="p-2 text-gray-500">
                  {new Date(blog.blockedAt).toLocaleDateString()}
                </td>
                <td className="p-2 flex gap-2">
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
                  <button
                    onClick={() => handleUnblock(blog._id)}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                  >
                    Unblock
                  </button>
                </td>
              </tr>

              {expandedBlog === blog._id && (
                <tr className="border-t bg-white">
                  <td colSpan="4" className="p-4">
                    <div className="space-y-3">
                      {blog.image && (
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="w-full max-h-60 object-cover rounded-lg border"
                        />
                      )}
                      <div
                        className="text-gray-700 prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                      />
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
