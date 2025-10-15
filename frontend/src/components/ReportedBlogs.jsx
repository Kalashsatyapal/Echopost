import { useEffect, useState } from "react";
import axios from "axios";

export default function ReportedBlogs() {
  const [reportedBlogs, setReportedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchReportedBlogs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/superadmin/reported", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReportedBlogs(res.data);
      } catch (err) {
        console.error("Failed to fetch reported blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportedBlogs();
  }, []);

  if (loading) return <p>Loading reported blogs...</p>;

  if (reportedBlogs.length === 0)
    return <p className="text-gray-500">No reported blogs found.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border text-sm">
        <thead className="bg-red-100 text-red-700">
          <tr>
            <th className="p-2 text-left">Title</th>
            <th className="p-2 text-left">Author</th>
            <th className="p-2 text-left">Reports</th>
            <th className="p-2 text-left">Reasons</th>
          </tr>
        </thead>
        <tbody>
          {reportedBlogs.map((blog) => (
            <tr key={blog._id} className="border-t hover:bg-gray-50">
              <td className="p-2 font-medium text-gray-800">{blog.title}</td>
              <td className="p-2 text-gray-600">{blog.author?.name || "Unknown"}</td>
              <td className="p-2 text-gray-700 font-semibold">
                {blog.reports.length}
              </td>
              <td className="p-2 text-gray-600">
                {blog.reports.map((r, i) => (
                  <div key={i}>
                    <span className="font-medium">{r.user?.name}:</span> {r.reason}
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
