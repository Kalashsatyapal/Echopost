import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import logo from "../assets/logo.png";

export default function Sidebar({ sidebarOpen, setSidebarOpen, handleLogout }) {
  const user = useSelector((state) => state.auth.user);

  return (
    <div
      className={`fixed inset-y-0 left-0 w-64 bg-white bg-opacity-95 border-r shadow-xl transform ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform md:translate-x-0 z-20 font-sans text-gray-800`}
    >
      {/* Logo + Title */}
      <div className="flex items-center gap-3 p-4 border-b">
        <img src={logo} alt="EchoPost Logo" className="h-8 w-8 object-contain" />
        <span className="text-xl font-extrabold text-indigo-700 tracking-wide">EchoPost</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col p-4 space-y-2 text-sm">
        <Link to="/dashboard" className="px-3 py-2 rounded-lg hover:bg-indigo-50 transition">
          🏠 Home
        </Link>
        <Link to="/create" className="px-3 py-2 rounded-lg hover:bg-indigo-50 transition">
          ✍️ Create Blog
        </Link>
        <Link to="/my-blogs" className="px-3 py-2 rounded-lg hover:bg-indigo-50 transition">
          📑 My Blogs
        </Link>
        <Link to="/profile" className="px-3 py-2 rounded-lg hover:bg-indigo-50 transition">
          🙍 Profile
        </Link>
        <Link to="/guidelines" className="px-3 py-2 rounded-lg hover:bg-indigo-50 text-gray-700 transition">
          📘 Guidelines
        </Link>

        {(user?.role === "admin" || user?.role === "superadmin") && (
          <Link
            to="/admin-dashboard"
            className="px-3 py-2 rounded-lg hover:bg-purple-50 text-purple-600 font-semibold transition"
          >
            🛠 Admin Dashboard
          </Link>
        )}
        {user?.role === "superadmin" && (
          <Link
            to="/superadmin-dashboard"
            className="px-3 py-2 rounded-lg hover:bg-blue-50 text-blue-500 font-semibold transition"
          >
            🧭 SuperAdmin Dashboard
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="px-3 py-2 rounded-lg hover:bg-red-50 text-left text-red-500 transition"
        >
          🚪 Logout
        </button>
      </nav>
    </div>
  );
}