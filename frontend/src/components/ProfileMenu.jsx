import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ProfileMenu({ user, getProfileImage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const profileImageSrc = user?.profileImage
    ? `${getProfileImage()}?w_100,h_100,c_fill,q_auto,f_auto`
    : null;

  const handleLogout = () => {
    localStorage.removeItem("token"); // clear JWT or auth token
    setMenuOpen(false);
    setConfirmOpen(false);
    navigate("/"); // redirect to home
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        aria-haspopup="true"
        aria-expanded={menuOpen}
        className="w-10 h-10 rounded-full border flex items-center justify-center overflow-hidden focus:outline-none shadow"
      >
        {profileImageSrc ? (
          <img
            src={profileImageSrc}
            alt="profile"
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://via.placeholder.com/150?text=Avatar";
            }}
          />
        ) : (
          <span className="text-lg font-bold">👤</span>
        )}
      </button>

      {/* Dropdown menu */}
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border z-10">
          <Link
            to="/profile"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-lg"
          >
            Profile
          </Link>
          <button
            onClick={() => setConfirmOpen(true)}
            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-b-lg"
          >
            Logout
          </button>
        </div>
      )}

      {/* Logout confirmation modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Confirm Logout</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to logout? You will be redirected to the homepage.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
