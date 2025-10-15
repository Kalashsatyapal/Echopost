import { useState } from "react";
import { useDispatch } from "react-redux";
import { register } from "../redux/authSlice.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import logo from "../assets/logo.png";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [successMessage, setSuccessMessage] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (role === "admin") {
        await axios.post("http://localhost:5000/api/admin-requests", {
          name,
          email,
          password,
        });
        setSuccessMessage("✅ Admin request submitted successfully!");
        toast.success("Admin request sent!");
      } else {
        const result = await dispatch(register({ name, email, password }));
        if (result.meta.requestStatus === "fulfilled") {
          setSuccessMessage("✅ Registered successfully! Redirecting to login...");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          setSuccessMessage("❌ Registration failed. Please try again.");
        }
      }
    } catch (err) {
      console.error(err);
      setSuccessMessage("❌ Something went wrong.");
      toast.error("Error submitting request.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-100 to-indigo-200 flex flex-col items-center justify-center font-sans text-gray-800 px-4">
      {/* Header */}
      <header className="flex items-center gap-3 mb-6">
        <img src={logo} alt="EchoPost Logo" className="h-10 w-10 object-contain" />
        <h1 className="text-3xl font-extrabold text-indigo-700 tracking-wide">EchoPost</h1>
      </header>

      {/* Register Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white bg-opacity-90 rounded-xl shadow-lg p-6 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-indigo-700 mb-4 text-center">
          Create Your Account
        </h2>

        {successMessage && (
          <div className="mb-4 text-center text-sm font-medium text-green-600">
            {successMessage}
          </div>
        )}

        <input
          type="text"
          placeholder="Name"
          className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          className="w-full p-3 mb-6 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-teal-500 text-white rounded-lg shadow hover:scale-105 transition font-semibold text-lg focus:outline focus:ring-2 focus:ring-indigo-400"
        >
          Register
        </button>
      </form>

      {/* Navigation Links */}
      <p className="mt-6 text-teal-700 font-medium text-sm">
        Already have an account?{" "}
        <a href="/login" className="underline text-indigo-600">
          Login here
        </a>
      </p>
      <p className="mt-2 text-indigo-700 font-medium text-sm">
        <a href="/" className="underline hover:text-indigo-500">
          ← Back to Home
        </a>
      </p>
    </div>
  );
}