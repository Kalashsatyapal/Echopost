import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import { Extension } from "@tiptap/core";
import TextAlign from "@tiptap/extension-text-align";
import Sidebar from "../components/Sidebar.jsx";
import ProfileMenu from "../components/ProfileMenu.jsx";
import EditorToolbar from "../components/EditorToolbar";
import { categories } from "../data/categories";

// FontSize extension
const FontSize = Extension.create({
  name: "fontSize",
  addOptions() { return { types: ["textStyle"] }; },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: {
          default: null,
          renderHTML: (attrs) => attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
          parseHTML: (el) => ({ fontSize: el.style.fontSize.replace(/['"]+/g, "") }),
        },
      },
    }];
  },
  addCommands() {
    return {
      setFontSize: (size) => ({ chain }) => chain().setMark("textStyle", { fontSize: size }).run(),
      unsetFontSize: () => ({ chain }) => chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

export default function EditBlog() {
  const { id } = useParams();
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [title, setTitle] = useState("");
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [content, setContent] = useState("");
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [image, setImage] = useState(null); // only full image
  const [existingImage, setExistingImage] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  const editor = useEditor({
    extensions: [StarterKit, TextStyle, Color, FontFamily, FontSize, TextAlign.configure({ types: ["heading", "paragraph"] })],
    content,
    onUpdate: ({ editor }) => setContent(editor.getHTML()),
    editorProps: { attributes: { className: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[200px] p-3 border rounded bg-gray-50" } },
  });

  // Fetch user info
  useEffect(() => {
    axios.get(`${API_URL}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setUser(res.data.user))
      .catch(console.error);
  }, [token]);

  // Fetch tags
  useEffect(() => {
    axios.get(`${API_URL}/api/tags`).then((res) => setAllTags(res.data)).catch(console.error);
  }, []);

  // Fetch blog data
  useEffect(() => {
    axios.get(`${API_URL}/api/blogs/${id}`)
      .then((res) => {
        const data = res.data;
        setTitle(data.title);
        setMainCategory(data.category || "");
        setSubCategory(data.subcategory || "");
        setContent(data.content);
        setExistingImage(data.image || null);
        setSelectedTags(data.tags?.map((t) => t._id) || []);
        if (editor) editor.commands.setContent(data.content);
      })
      .catch((err) => { console.error(err); alert("Failed to load blog."); });
  }, [id, editor]);

  const handleTagToggle = (tagId) =>
    setSelectedTags((prev) => prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!title || !mainCategory || !content) { alert("Fill all required fields"); return; }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", mainCategory);
    if (subCategory) formData.append("subcategory", subCategory);
    formData.append("content", content);
    selectedTags.forEach((t) => formData.append("tags[]", t));
    if (image) formData.append("image", image);

    try {
      await axios.put(`${API_URL}/api/blogs/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      alert("Blog updated successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to update blog.");
    }
  };

  const handleLogout = () => { localStorage.removeItem("token"); navigate("/"); };
  const getProfileImage = () => user?.profileImage || "/default-avatar.png";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-100 to-indigo-200 flex font-sans text-gray-800">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} handleLogout={handleLogout} />
      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-30 z-10 md:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className="flex flex-col flex-1 md:ml-64 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between bg-white bg-opacity-90 py-3 px-6 shadow border-b z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 rounded bg-gray-100 hover:bg-gray-200" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <h1 className="text-xl md:text-2xl font-bold text-indigo-700 tracking-wide">Edit Blog</h1>
          </div>
          <ProfileMenu user={user} handleLogout={handleLogout} getProfileImage={getProfileImage} />
        </div>

        <div className="px-6 py-6 w-full max-w-4xl mx-auto">
          <form onSubmit={handleUpdate} className="flex flex-col gap-4 bg-white p-6 rounded shadow">
            <input type="text" placeholder="Title" className="w-full p-3 border rounded" value={title} onChange={(e) => setTitle(e.target.value)} />

            {/* Categories */}
            <select value={mainCategory} onChange={(e) => { setMainCategory(e.target.value); setSubCategory(""); }} className="w-full p-3 border rounded">
              <option value="">Select Category</option>
              {categories.map((c) => (<option key={c.name} value={c.name}>{c.icon} {c.name}</option>))}
            </select>

            {mainCategory && categories.find((c) => c.name === mainCategory)?.subcategories.length > 0 && (
              <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="w-full p-3 border rounded">
                <option value="">Select Subcategory</option>
                {categories.find((c) => c.name === mainCategory).subcategories.map((sc) => (<option key={sc} value={sc}>{sc}</option>))}
              </select>
            )}

            {/* Tags */}
            <div className="border p-3 rounded">
              <h2 className="font-semibold mb-2">Select Tags</h2>
              <div className="flex flex-wrap gap-3">
                {allTags.map((tag) => (
                  <label key={tag._id} className={`flex items-center gap-2 border px-3 py-1 rounded cursor-pointer ${selectedTags.includes(tag._id) ? "bg-blue-100 border-blue-400 text-blue-600" : "hover:bg-gray-50"}`}>
                    <input type="checkbox" checked={selectedTags.includes(tag._id)} onChange={() => handleTagToggle(tag._id)} />
                    {tag.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Image */}
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {(image ? <img src={URL.createObjectURL(image)} alt="Selected" className="w-64 h-64 object-cover rounded" /> : existingImage) && (
              <img src={image ? URL.createObjectURL(image) : existingImage} alt="Blog" className="w-64 h-64 object-cover rounded" />
            )}

            <EditorToolbar editor={editor} />
            <EditorContent editor={editor} />

            <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 transition">Update Blog</button>
          </form>
        </div>
      </div>
    </div>
  );
}
