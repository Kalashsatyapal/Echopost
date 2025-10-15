import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import ManageUsers from "../../components/ManageUsers";
import EditGuidelines from "../../components/EditGuidelines";
import ReportedBlogs from "../../components/ReportedBlogs"; // ✅ added
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaBlog,
  FaCogs,
  FaClipboardList,
  FaHome,
  FaEdit,
  FaFlag,
} from "react-icons/fa";
import logo from "../../assets/logo.webp";

export default function SuperAdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalBlogs: 0 });
  const [tags, setTags] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editTag, setEditTag] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchRequests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching admin requests:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tags");
      setTags(res.data);
    } catch (err) {
      console.error("Error fetching tags:", err);
    }
  };

  const handleUpdate = async (id, status) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/admin-requests/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Request ${status}`);
      setRequests((prev) => prev.map((r) => (r._id === id ? res.data : r)));
    } catch (err) {
      console.error(err);
      toast.error("Failed to update request");
    }
  };

  const handleCreateTag = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/tags",
        { name, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newTag = res.data.tag || res.data;
      if (newTag && newTag._id) {
        setTags((prev) => [...prev, newTag]);
      } else {
        await fetchTags();
      }

      toast.success("Tag created successfully");
      setName("");
      setDescription("");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create tag");
    }
  };

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

  const handleEditTag = (tag) => setEditTag(tag);

  const handleUpdateTag = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `http://localhost:5000/api/tags/${editTag._id}`,
        { name: editTag.name, description: editTag.description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Tag updated successfully");
      setTags((prev) => prev.map((t) => (t._id === editTag._id ? res.data : t)));
      setEditTag(null);
    } catch (err) {
      toast.error("Failed to update tag");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchStats();
      await fetchRequests();
      await fetchTags();
      setLoading(false);
    };
    loadData();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 via-purple-100 to-indigo-200 text-indigo-700 font-semibold text-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500 mr-3"></div>
        Loading SuperAdmin Dashboard...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-100 to-indigo-200 text-gray-800 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-5 bg-white/90 shadow-md backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src={logo} alt="EchoPost Logo" className="h-10 w-10 object-contain" />
          <h1 className="text-3xl font-extrabold text-indigo-700">EchoPost</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-teal-500 text-white font-semibold rounded-lg shadow hover:scale-105 transition-transform"
          >
            <FaHome /> Go to Dashboard
          </button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <nav className="bg-white/70 shadow-sm backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex gap-8 justify-center font-medium">
          {[
            { key: "dashboard", label: "Dashboard", icon: <FaClipboardList /> },
            { key: "users", label: "Manage Users", icon: <FaUsers /> },
            { key: "guidelines", label: "Edit Guidelines", icon: <FaCogs /> },
            { key: "tags", label: "Manage Tags", icon: <FaBlog /> },
            { key: "reported", label: "Reported Blogs", icon: <FaFlag className="text-red-600" /> }, // ✅ added new tab
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 pb-1 relative transition-all duration-200 ${
                activeTab === tab.key
                  ? "text-indigo-600 font-semibold"
                  : "text-gray-600 hover:text-indigo-500"
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded"></span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {activeTab === "dashboard" && (
          <>
            {/* Dashboard Section */}
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div className="bg-white bg-opacity-90 p-8 rounded-2xl shadow-lg flex items-center gap-5 hover:scale-105 transition-transform">
                <div className="p-4 bg-indigo-100 rounded-xl">
                  <FaUsers className="text-indigo-600 text-4xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-indigo-700">Total Users</h3>
                  <p className="text-5xl font-extrabold text-indigo-800">{stats.totalUsers}</p>
                </div>
              </div>

              <div className="bg-white bg-opacity-90 p-8 rounded-2xl shadow-lg flex items-center gap-5 hover:scale-105 transition-transform">
                <div className="p-4 bg-teal-100 rounded-xl">
                  <FaBlog className="text-teal-600 text-4xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-teal-700">Total Blogs</h3>
                  <p className="text-5xl font-extrabold text-teal-800">{stats.totalBlogs}</p>
                </div>
              </div>
            </div>

            {/* Admin Requests */}
            <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              📥 Admin Requests
            </h2>
            {requests.length === 0 ? (
              <p className="text-gray-600 text-center bg-white/70 p-6 rounded-lg shadow">
                No pending requests found.
              </p>
            ) : (
              <div className="space-y-4">
                {requests.map((r) => (
                  <div
                    key={r._id}
                    className="bg-white bg-opacity-90 p-5 rounded-xl shadow flex justify-between items-center hover:shadow-md transition"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{r.name}</p>
                      <p className="text-sm text-gray-600">{r.email}</p>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                          r.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : r.status === "accepted"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    {r.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          className="px-4 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                          onClick={() => handleUpdate(r._id, "accepted")}
                        >
                          Accept
                        </button>
                        <button
                          className="px-4 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                          onClick={() => handleUpdate(r._id, "rejected")}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "users" && (
          <section className="bg-white bg-opacity-90 p-6 rounded-2xl shadow-lg mt-6">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4">👤 Manage Users</h2>
            <ManageUsers />
          </section>
        )}

        {activeTab === "guidelines" && (
          <section className="bg-white bg-opacity-90 p-6 rounded-2xl shadow-lg mt-6">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4">🛠️ Edit Guidelines</h2>
            <EditGuidelines />
          </section>
        )}

        {activeTab === "tags" && (
          <section className="bg-white bg-opacity-90 p-6 rounded-2xl shadow-lg mt-6">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4">🏷️ Manage Tags</h2>

            {/* Add Tag Form */}
            <form onSubmit={handleCreateTag} className="flex flex-col md:flex-row gap-4 mb-6">
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
                  {tags.map((tag) => (
                    <tr key={tag._id} className="border-t hover:bg-gray-50">
                      <td className="p-2">{tag.name}</td>
                      <td className="p-2 text-gray-600">{tag.description || "—"}</td>
                      <td className="p-2 text-gray-500">
                        {new Date(tag.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-2 flex gap-3">
                        <button
                          onClick={() => handleEditTag(tag)}
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag._id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
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
        )}

        {/* ✅ Reported Blogs Section */}
        {activeTab === "reported" && (
          <section className="bg-white bg-opacity-90 p-6 rounded-2xl shadow-lg mt-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">🚨 Reported Blogs</h2>
            <ReportedBlogs />
          </section>
        )}
      </main>

      {/* Edit Tag Modal */}
      {editTag && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-md shadow-lg">
            <h3 className="text-xl font-semibold text-indigo-700 mb-4">Edit Tag</h3>
            <form onSubmit={handleUpdateTag} className="space-y-4">
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={editTag.name}
                onChange={(e) => setEditTag({ ...editTag, name: e.target.value })}
              />
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={editTag.description}
                onChange={(e) => setEditTag({ ...editTag, description: e.target.value })}
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded"
                  onClick={() => setEditTag(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="text-center py-6 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} EchoPost SuperAdmin — Built for creators, by creators.
      </footer>
    </div>
  );
}
