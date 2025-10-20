import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import ProfileMenu from "../components/ProfileMenu.jsx";

export default function Profile() {
  const token = useSelector((state) => state.auth.token);
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [name, setName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState(""); // inline message
  const [error, setError] = useState(""); // inline error

  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  // Fetch profile and blogs
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user || {});
        setBlogs(res.data.blogs || []);
        setName(res.data.user?.name || "");
        setPreview(res.data.user?.profileImage || "/default-avatar.png");
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token, API_URL]);

  // Preview new image immediately
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // Update profile
  const handleUpdate = async () => {
    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }
    setUpdating(true);
    setMessage("");
    setError("");

    try {
      let res;
      if (image) {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("profileImage", image);

        res = await axios.put(`${API_URL}/api/users/update`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        res = await axios.put(
          `${API_URL}/api/users/update`,
          { name },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setUser(res.data);
      setPreview(res.data.profileImage || "/default-avatar.png");
      setImage(null);
      setMessage("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  // Change password
  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword) {
      setError("Please fill both password fields");
      setMessage("");
      return;
    }
    setMessage("");
    setError("");

    try {
      await axios.put(
        `${API_URL}/api/users/change-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOldPassword("");
      setNewPassword("");
      setMessage("Password updated successfully!");
    } catch (err) {
      console.error("Error changing password:", err);
      setError(err.response?.data?.message || "Failed to update password");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getProfileImage = () => user?.profileImage || "/default-avatar.png";

  if (loading) return <p className="text-center mt-10">Loading profile...</p>;
  if (!user) return <p className="text-center mt-10">Unable to load profile.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-100 to-indigo-200 flex font-sans text-gray-800">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} handleLogout={handleLogout} />
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-col flex-1 md:ml-64 transition-all duration-300">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white bg-opacity-90 shadow border-b flex items-center justify-between py-3 px-6">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 rounded bg-gray-100 hover:bg-gray-200"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <h1 className="text-2xl font-bold text-indigo-700 tracking-wide">Profile</h1>
          </div>
          <ProfileMenu user={user} handleLogout={handleLogout} getProfileImage={getProfileImage} />
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto mt-6 p-6 bg-white rounded shadow flex-grow">
          {/* Inline Messages */}
          {message && (
            <div className="mb-4 p-2 text-green-800 bg-green-100 border border-green-300 rounded">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 p-2 text-red-800 bg-red-100 border border-red-300 rounded">
              {error}
            </div>
          )}

          {/* Profile Image */}
          <div className="flex flex-col items-center mb-4">
            <img
              src={preview}
              alt="profile"
              className="w-24 h-24 rounded-full mb-2 object-cover"
            />
            <input
              type="file"
              className="w-full p-2"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          {/* Name */}
          <input
            type="text"
            className="w-full p-2 mb-4 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={updating}
          />
          <button
            onClick={handleUpdate}
            className={`w-full py-2 rounded mb-6 text-white ${
              updating
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            disabled={updating}
          >
            {updating ? "Updating..." : "Update Profile"}
          </button>

          {/* Password */}
          <h2 className="text-xl font-semibold mb-2">Change Password</h2>
          <input
            type="password"
            placeholder="Old Password"
            className="w-full p-2 mb-2 border rounded"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="New Password"
            className="w-full p-2 mb-4 border rounded"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button
            onClick={handlePasswordChange}
            className="w-full bg-red-500 text-white py-2 rounded mb-6"
          >
            Change Password
          </button>

          {/* Blogs */}
          <h2 className="text-xl font-semibold mb-2">My Blogs</h2>
          {blogs.length > 0 ? (
            <ul className="space-y-2">
              {blogs.map((b) => (
                <li key={b._id} className="p-2 border rounded">
                  {b.title}
                </li>
              ))}
            </ul>
          ) : (
            <p>No blogs yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
