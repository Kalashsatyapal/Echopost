import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

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

  // Fetch profile and blogs
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user || {});
        setBlogs(res.data.blogs || []);
        setName(res.data.user?.name || "");
        setPreview(res.data.user?.profileImage || "/default-avatar.png");
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  // Preview new image immediately
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // Update profile reactively
  const handleUpdate = async () => {
    if (!name.trim()) return alert("Name cannot be empty");
    setUpdating(true);

    try {
      let res;
      if (image) {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("profileImage", image);

        res = await axios.put("http://localhost:5000/api/users/update", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        res = await axios.put(
          "http://localhost:5000/api/users/update",
          { name },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Update state reactively
      setUser(res.data);
      setPreview(res.data.profileImage || "/default-avatar.png");
      setImage(null);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  // Change password
  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword) return alert("Please fill both password fields");

    try {
      await axios.put(
        "http://localhost:5000/api/users/change-password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOldPassword("");
      setNewPassword("");
      alert("Password updated successfully!");
    } catch (err) {
      console.error("Error changing password:", err);
      alert(err.response?.data?.message || "Failed to update password");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading profile...</p>;
  if (!user) return <p className="text-center mt-10">Unable to load profile.</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>

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
        className={`w-full py-2 rounded mb-6 text-white ${updating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
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
            <li key={b._id} className="p-2 border rounded">{b.title}</li>
          ))}
        </ul>
      ) : (
        <p>No blogs yet</p>
      )}
    </div>
  );
}
