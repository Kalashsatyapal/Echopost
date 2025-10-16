import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaEdit } from "react-icons/fa";

export default function TagManagement({ token }) {
  const [tags, setTags] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editTag, setEditTag] = useState(null);

  const fetchTags = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tags");
      setTags(res.data);
    } catch (err) {
      console.error("Error fetching tags:", err);
    }
  };

  const handleCreateTag = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/tags",
        { name, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newTag = res.data.tag || res.data;
      if (newTag && newTag._id) {
        setTags((prev) => [...prev, newTag]);
      } else {
        await fetchTags();
      }

      toast.success("Tag created successfully");
      setName("");
      setDescription("");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create tag");
    }
  };

  const handleDeleteTag = async (id) => {
    if (!window.confirm("Delete this tag?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/tags/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Tag deleted");
      setTags((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      toast.error("Failed to delete tag");
    }
  };

  const handleUpdateTag = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `http://localhost:5000/api/tags/${editTag._id}`,
        { name: editTag.name, description: editTag.description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Tag updated successfully");
      setTags((prev) =>
        prev.map((t) => (t._id === editTag._id ? res.data : t))
      );
      setEditTag(null);
    } catch (err) {
      toast.error("Failed to update tag");
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return (
    <section className="bg-white bg-opacity-90 p-6 rounded-2xl shadow-lg mt-6">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">🏷️ Manage Tags</h2>

      {/* Add Tag Form */}
      <form
        onSubmit={handleCreateTag}
        className="flex flex-col md:flex-row gap-4 mb-6"
      >
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
                <td className="p-2 text-gray-600">
                  {tag.description || "—"}
                </td>
                <td className="p-2 text-gray-500">
                  {new Date(tag.createdAt).toLocaleDateString()}
                </td>
                <td className="p-2 flex gap-3">
                  <button
                    onClick={() => setEditTag(tag)}
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTag(tag._id)}
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

      {/* Edit Tag Modal */}
      {editTag && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-md shadow-lg">
            <h3 className="text-xl font-semibold text-indigo-700 mb-4">
              Edit Tag
            </h3>
            <form onSubmit={handleUpdateTag} className="space-y-4">
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={editTag.name}
                onChange={(e) =>
                  setEditTag({ ...editTag, name: e.target.value })
                }
              />
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={editTag.description}
                onChange={(e) =>
                  setEditTag({ ...editTag, description: e.target.value })
                }
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded"
                  onClick={() => setEditTag(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
