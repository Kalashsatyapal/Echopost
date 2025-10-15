import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import BlogDetail from "./pages/BlogDetail.jsx";
import CreateBlog from "./pages/CreateBlog.jsx";
import EditBlog from "./pages/EditBlog.jsx";
import Profile from "./pages/Profile.jsx";
import MyBlogs from "./pages/MyBlogs.jsx"; // ✅ new page
import AdminDashboard from "./pages/AdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard/SuperAdminDashboard.jsx";
import Guidelines from "./pages/Guidelines";
import ReportBlog from "./pages/ReportBlog.jsx";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/blog/:id"
        element={
          <ProtectedRoute>
            <BlogDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <CreateBlog />
          </ProtectedRoute>
        }
      />
      <Route path="/edit-blog/:id" element={<EditBlog />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="/my-blogs" element={<MyBlogs />} />
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/superadmin-dashboard"
        element={
          <ProtectedRoute allowedRoles={["superadmin"]}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/guidelines" element={<Guidelines />} />
      <Route path="/report/:id" element={<ReportBlog />} />
    </Routes>
  );
}

export default App;
