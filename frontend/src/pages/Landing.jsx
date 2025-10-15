import { Link } from "react-router-dom";
import { FaPenFancy, FaImage, FaUsers } from "react-icons/fa";
import logo from "../assets/logo.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-100 to-indigo-200 text-gray-800 flex flex-col font-sans">
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="EchoPost Logo"
            className="h-10 w-10 object-contain"
          />
          <h1 className="text-3xl font-extrabold text-indigo-700 tracking-wide">
            EchoPost
          </h1>
        </div>
        <nav className="flex gap-4">
          <Link
            to="/login"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-500 transition focus:outline focus:ring-2 focus:ring-indigo-400"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-teal-500 text-white rounded-lg shadow hover:bg-teal-400 transition focus:outline focus:ring-2 focus:ring-teal-400"
          >
            Register
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center flex-grow px-4 text-center">
        <h2 className="text-5xl font-extrabold mb-4 text-indigo-700">
          Welcome to EchoPost 📝
        </h2>
        <p className="text-lg text-gray-700 mb-6 max-w-xl">
          A modern blogging platform powered by <strong>TipTap</strong> for rich
          text editing and <strong>Cloudinary</strong> for seamless image
          management. Share your voice, showcase your visuals, and connect with
          a vibrant community.
        </p>

        {/* Feature Highlights */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white bg-opacity-80 rounded-xl p-6 shadow hover:scale-105 transition">
            <FaPenFancy className="text-3xl text-indigo-500 mb-2 mx-auto" />
            <h3 className="font-semibold text-gray-800 mb-1">
              Rich Text Editing
            </h3>
            <p className="text-sm text-gray-600">
              Create beautiful posts with TipTap’s intuitive editor—headings,
              lists, embeds, and more.
            </p>
          </div>
          <div className="bg-white bg-opacity-80 rounded-xl p-6 shadow hover:scale-105 transition">
            <FaImage className="text-3xl text-teal-500 mb-2 mx-auto" />
            <h3 className="font-semibold text-gray-800 mb-1">
              Cloud-Based Media
            </h3>
            <p className="text-sm text-gray-600">
              Upload, transform, and deliver images instantly with Cloudinary’s
              powerful CDN.
            </p>
          </div>
          <div className="bg-white bg-opacity-80 rounded-xl p-6 shadow hover:scale-105 transition">
            <FaUsers className="text-3xl text-pink-500 mb-2 mx-auto" />
            <h3 className="font-semibold text-gray-800 mb-1">
              Community Driven
            </h3>
            <p className="text-sm text-gray-600">
              Discover blogs, follow creators, and build your audience with
              EchoPost’s social features.
            </p>
          </div>
        </section>

        {/* CTA */}
        <Link
          to="/register"
          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-teal-500 text-white rounded-lg shadow-lg hover:scale-105 transition font-semibold text-lg focus:outline focus:ring-2 focus:ring-indigo-400"
        >
          Start Blogging Now
        </Link>
        <p className="mt-4 text-teal-700 font-medium">
          Your story deserves a platform.
        </p>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} EchoPost. Built for creators, by
        creators.
      </footer>
    </div>
  );
}
