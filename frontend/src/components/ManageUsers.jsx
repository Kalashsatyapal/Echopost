import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/superadmin/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/superadmin/users/${id}/role`,
        { role },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success(`${res.data.name} is now ${res.data.role}`);
      setUsers((prev) => prev.map((u) => (u._id === id ? res.data : u)));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update role");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading)
    return <p className="p-4 text-gray-500 text-center">Loading users...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Users</h2>
      <div className="overflow-x-auto bg-white rounded-lg shadow border">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wide">
                Name
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wide">
                Email
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wide">
                Role
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-gray-700 font-medium">{user.name}</td>
                <td className="px-6 py-4 text-gray-500">{user.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                      user.role === "user"
                        ? "bg-gray-200 text-gray-800"
                        : user.role === "admin"
                        ? "bg-purple-200 text-purple-800"
                        : "bg-blue-200 text-blue-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  {user.role === "user" && (
                    <button
                      className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                      onClick={() => handleRoleChange(user._id, "admin")}
                    >
                      Promote to Admin
                    </button>
                  )}
                  {user.role === "admin" && (
                    <button
                      className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                      onClick={() => handleRoleChange(user._id, "user")}
                    >
                      Demote to User
                    </button>
                  )}
                  {user.role === "superadmin" && (
                    <span className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm">
                      Superadmin
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
