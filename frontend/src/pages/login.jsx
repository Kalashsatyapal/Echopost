import { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../redux/authSlice.js";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(login({ email, password }));

      if (result.meta.requestStatus === "fulfilled") {
        setIsError(false);
        setMessage("✅ Login successful! Redirecting to dashboard...");
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setIsError(true);
        setMessage("❌ Login failed. Please check your credentials.");
      }
    } catch (error) {
      setIsError(true);
      setMessage("❌ Something went wrong during login.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-100 to-indigo-200 flex flex-col items-center justify-center font-sans text-gray-800 px-4">
      {/* Header */}
      <header className="flex items-center gap-3 mb-6">
        <img
          src={logo}
          alt="EchoPost Logo"
          className="h-10 w-10 object-contain"
        />
        <h1 className="text-3xl font-extrabold text-indigo-700 tracking-wide">
          EchoPost
        </h1>
      </header>

      {/* Login Form */}
      <form
        className="bg-white bg-opacity-90 rounded-xl shadow-lg p-6 w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold text-indigo-700 mb-4 text-center">
          Login to Your Account
        </h2>

        {message && (
          <div
            className={`mb-4 text-center text-sm font-medium ${
              isError ? "text-red-600" : "text-green-600"
            }`}
          >
            {message}
          </div>
        )}

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
          className="w-full p-3 mb-6 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-teal-500 text-white rounded-lg shadow hover:scale-105 transition font-semibold text-lg focus:outline focus:ring-2 focus:ring-indigo-400"
        >
          Login
        </button>
      </form>

      <p className="mt-6 text-teal-700 font-medium text-sm">
        New to EchoPost?{" "}
        <a href="/register" className="underline text-indigo-600">
          Create an account
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
