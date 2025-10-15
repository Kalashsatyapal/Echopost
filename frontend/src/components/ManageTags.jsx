import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function ManageTags() {
  const [tags, setTags] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const token = localStorage.getItem("token");

  const fetchTags = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tags");
      setTags(res.data);
    } catch (err) {
      console.error("Error fetching tags:", err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/api/tags",
        { name, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Tag created successfully");
      setName("");
      setDescription("");
      fetchTags();
    } catch (err) {
      console.error("Error creating tag:", err);
      toast.error(err.response?.data?.message || "Failed to create tag");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this tag?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/tags/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Tag deleted");
      fetchTags();
    } catch (err) {
      toast.error("Failed to delete tag");
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">🏷️ Manage Tags</h2>

      {/* Add Tag Form */}
      <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Tag Name"
          className="p-2 border rounded w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description (optional)"
          className="p-2 border rounded w-full"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          Add Tag
        </button>
      </form>

      {/* Tag List */}
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-indigo-100 text-indigo-700">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-left">Created</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => (
              <tr key={tag._id} className="border-t hover:bg-gray-50">
                <td className="p-2">{tag.name}</td>
                <td className="p-2 text-gray-600">{tag.description || "—"}</td>
                <td className="p-2 text-gray-500">
                  {new Date(tag.createdAt).toLocaleDateString()}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => handleDelete(tag._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {tags.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No tags found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
