import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import ManageUsers from "./ManageUsers";
import EditGuidelines from "./EditGuidelines";
import ReportedBlogs from "./ReportedBlogs";
import TagManagement from "./TagManagement"; // ✅ imported new component
import BlockedBlogs from "./BlockedBlogs";
import ReportedComments from "./ReportedComments"; // 💬 imported ReportedComments component
import BlockedComments from "./BlockedComments"; // 🚫 imported BlockedComments component
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaBlog,
  FaCogs,
  FaClipboardList,
  FaHome,
  FaFlag,
  FaCommentDots,
} from "react-icons/fa";
import logo from "../../assets/logo.webp";

export default function SuperAdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBlogs: 0,
    reportedBlogs: 0,
    blockedBlogs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;

    // Add this function
  const handleUpdate = async (id, status) => {
    if (!token) {
      toast.error("Not authenticated");
      return;
    }
    try {
      await axios.put(
        `${API_URL}/api/admin-requests/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Request ${status}`);
      // refresh list (fetchRequests is defined in this component)
      await fetchRequests();
    } catch (err) {
      console.error("Error updating request:", err);
      const msg = err?.response?.data?.message || "Update failed";
      toast.error(msg);
    }
  };
  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching admin requests:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchStats();
      await fetchRequests();
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
          <img
            src={logo}
            alt="EchoPost Logo"
            className="h-10 w-10 object-contain"
          />
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
            {
              key: "reported",
              label: "Reported Blogs",
              icon: <FaFlag className="text-red-600" />,
            },
            {
              key: "blocked",
              label: "Blocked Blogs",
              icon: <FaFlag className="text-red-500" />,
            },
            {
              key: "reportedComments",
              label: "Reported Comments",
              icon: <FaCommentDots className="text-red-500" />,
            },
            {
              key: "blockedComments",
              label: "Blocked Comments",
              icon: <FaCommentDots className="text-gray-600" />,
            },
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
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
              {/* Total Users */}
              <div className="bg-white bg-opacity-90 p-8 rounded-2xl shadow-lg flex items-center gap-5 hover:scale-105 transition-transform">
                <div className="p-4 bg-indigo-100 rounded-xl">
                  <FaUsers className="text-indigo-600 text-4xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-indigo-700">
                    Total Users
                  </h3>
                  <p className="text-5xl font-extrabold text-indigo-800">
                    {stats.totalUsers}
                  </p>
                </div>
              </div>

              {/* Total Blogs */}
              <div className="bg-white bg-opacity-90 p-8 rounded-2xl shadow-lg flex items-center gap-5 hover:scale-105 transition-transform">
                <div className="p-4 bg-teal-100 rounded-xl">
                  <FaBlog className="text-teal-600 text-4xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-teal-700">
                    Total Blogs
                  </h3>
                  <p className="text-5xl font-extrabold text-teal-800">
                    {stats.totalBlogs}
                  </p>
                </div>
              </div>

              {/* Reported Blogs */}
              <div className="bg-white bg-opacity-90 p-8 rounded-2xl shadow-lg flex items-center gap-5 hover:scale-105 transition-transform">
                <div className="p-4 bg-red-100 rounded-xl">
                  <FaFlag className="text-red-600 text-4xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-600">
                    Reported Blogs
                  </h3>
                  <p className="text-5xl font-extrabold text-red-700">
                    {stats.reportedBlogs}
                  </p>
                </div>
              </div>

              {/* Blocked Blogs */}
              <div className="bg-white bg-opacity-90 p-8 rounded-2xl shadow-lg flex items-center gap-5 hover:scale-105 transition-transform">
                <div className="p-4 bg-gray-100 rounded-xl">
                  <FaFlag className="text-gray-600 text-4xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">
                    Blocked Blogs
                  </h3>
                  <p className="text-5xl font-extrabold text-gray-800">
                    {stats.blockedBlogs}
                  </p>
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
            <h2 className="text-2xl font-bold text-indigo-700 mb-4">
              👤 Manage Users
            </h2>
            <ManageUsers />
          </section>
        )}
        {activeTab === "guidelines" && (
          <section className="bg-white bg-opacity-90 p-6 rounded-2xl shadow-lg mt-6">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4">
              🛠️ Edit Guidelines
            </h2>
            <EditGuidelines />
          </section>
        )}
        {activeTab === "tags" && <TagManagement token={token} />}{" "}
        {/* ✅ Replaced tags section */}
        {activeTab === "reported" && (
          <section className="bg-white bg-opacity-90 p-6 rounded-2xl shadow-lg mt-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              🚨 Reported Blogs
            </h2>
            <ReportedBlogs />
          </section>
        )}
        {activeTab === "blocked" && (
          <section className="bg-white bg-opacity-90 p-6 rounded-2xl shadow-lg mt-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              🚫 Blocked Blogs
            </h2>
            <BlockedBlogs token={token} />
          </section>
        )}
        {activeTab === "reportedComments" && (
          <section className="bg-white bg-opacity-90 p-6 rounded-2xl shadow-lg mt-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              💬 Reported Comments
            </h2>
            <ReportedComments />
          </section>
        )}
        {activeTab === "blockedComments" && (
          <section className="bg-white bg-opacity-90 p-6 rounded-2xl shadow-lg mt-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              🚫 Blocked Comments
            </h2>
            <BlockedComments token={token} />
          </section>
        )}
      </main>

      <footer className="text-center py-6 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} EchoPost SuperAdmin — Built for
        creators, by creators.
      </footer>
    </div>
  );
}
