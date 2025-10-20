import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ReportBlog() {
  const { id } = useParams(); // Blog ID
  const [blog, setBlog] = useState(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(""); // <-- new state
  const [errorMessage, setErrorMessage] = useState(""); // <-- for inline errors
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/blogs/${id}`);
        setBlog(res.data);
      } catch (err) {
        console.error(err);
        setErrorMessage("Failed to fetch blog");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id, API_URL]);

  const handleReport = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!reason.trim()) {
      setErrorMessage("Please enter a reason");
      return;
    }

    try {
      await axios.put(
        `${API_URL}/api/blogs/report/${id}`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage("✅ Blog reported successfully!");
      setReason(""); // clear textarea
      // Optional: navigate after a delay
      // setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || "Failed to report blog");
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

        {errorMessage && (
          <p className="text-red-600 text-sm">{errorMessage}</p>
        )}
        {successMessage && (
          <p className="text-green-600 text-sm">{successMessage}</p>
        )}

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
