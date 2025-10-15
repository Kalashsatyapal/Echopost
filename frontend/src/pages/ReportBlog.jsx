import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function ReportBlog() {
  const { id } = useParams(); // Blog ID
  const [blog, setBlog] = useState(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/blogs/${id}`);
        setBlog(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch blog");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const handleReport = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return toast.error("Please enter a reason");

    try {
      await axios.put(
        `http://localhost:5000/api/blogs/report/${id}`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Blog reported successfully");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to report blog");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mr-3"></div>
        Loading blog details...
      </div>
    );

  if (!blog)
    return (
      <div className="text-center text-gray-500 py-10">
        Blog not found or removed.
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto bg-white mt-10 p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">🚨 Report Blog</h2>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-indigo-700">{blog.title}</h3>
        <p
          className="text-sm text-gray-600 mt-1"
          dangerouslySetInnerHTML={{ __html: blog.content.slice(0, 200) + "..." }}
        />
      </div>

      <form onSubmit={handleReport} className="space-y-4">
        <textarea
          className="w-full border rounded p-2 text-sm focus:ring-1 focus:ring-red-400"
          placeholder="Explain why you're reporting this blog..."
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
