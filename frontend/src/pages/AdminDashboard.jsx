import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ReportedBlogs from "../components/ReportedBlogs";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalBlogs: 0 });
  const [tags, setTags] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tags
  const fetchTags = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tags");
      setTags(res.data);
    } catch (err) {
      console.error("Error fetching tags:", err);
    }
  };

  // Create tag
  const handleCreateTag = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/tags",
        { name, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Ensure new tag is added instantly without blank row
      const newTag = res.data.tag || res.data;
      if (newTag && newTag._id) {
        setTags((prev) => [...prev, newTag]);
      } else {
        await fetchTags(); // fallback
      }

      toast.success("Tag created successfully");
      setName("");
      setDescription("");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create tag");
    }
  };

  // Delete tag
  const handleDeleteTag = async (id) => {
    if (!window.confirm("Delete this tag?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/tags/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Tag deleted");
      setTags((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      toast.error("Failed to delete tag");
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTags();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500 mr-3"></div>
        Loading admin data...
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Section */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold text-purple-700 tracking-tight">
              EchoPost
            </h1>
            <p className="text-lg text-gray-600 mt-1 font-medium">
              Admin Dashboard
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            🏠 Go to Dashboard
          </button>
        </div>
      </header>

      {/* Dashboard Stats Section */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Overview</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition">
            <div className="bg-purple-100 text-purple-600 p-4 rounded-full text-3xl">
              📝
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700">
                Total Blogs
              </h3>
              <p className="text-3xl font-bold text-purple-700">
                {stats.totalBlogs}
              </p>
            </div>
          </div>

          <div className="bg-white border rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition">
            <div className="bg-blue-100 text-blue-600 p-4 rounded-full text-3xl">
              👥
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700">
                Total Users
              </h3>
              <p className="text-3xl font-bold text-blue-700">
                {stats.totalUsers}
              </p>
            </div>
          </div>
        </div>
        {/* Reported Blogs Section */}
        <section className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="text-2xl font-bold text-red-600">🚨 Reported Blogs</h2>

          <ReportedBlogs />
        </section>

        {/* Tags Management Section */}
        <section className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="text-2xl font-bold text-indigo-700">🏷️ Manage Tags</h2>

          {/* Add Tag Form */}
          <form
            onSubmit={handleCreateTag}
            className="flex flex-col md:flex-row gap-4"
          >
            <input
              type="text"
              placeholder="Tag Name"
              className="p-2 border rounded w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Description (optional)"
              className="p-2 border rounded w-full"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
            >
              Add Tag
            </button>
          </form>

          {/* Tag List */}
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead className="bg-indigo-100 text-indigo-700">
                <tr>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-left">Created</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tags.map(
                  (tag) =>
                    tag &&
                    tag._id && (
                      <tr key={tag._id} className="border-t hover:bg-gray-50">
                        <td className="p-2">{tag.name}</td>
                        <td className="p-2 text-gray-600">
                          {tag.description || "—"}
                        </td>
                        <td className="p-2 text-gray-500">
                          {new Date(tag.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-2">
                          <button
                            onClick={() => handleDeleteTag(tag._id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                )}
                {tags.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-gray-500">
                      No tags found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
