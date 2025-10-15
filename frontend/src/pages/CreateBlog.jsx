import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import { Extension } from "@tiptap/core";
import TextAlign from "@tiptap/extension-text-align";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";
import Modal from "react-modal";
import { categories } from "../data/categories";
import EditorToolbar from "../components/EditorToolbar";
import Sidebar from "../components/Sidebar.jsx";
import ProfileMenu from "../components/ProfileMenu.jsx";

// ✅ Custom FontSize Extension
const FontSize = Extension.create({
  name: "fontSize",
  addOptions() { return { types: ["textStyle"] }; },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            renderHTML: (attrs) => attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
            parseHTML: (el) => ({ fontSize: el.style.fontSize.replace(/['"]+/g, "") }),
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: (size) => ({ chain }) => chain().setMark("textStyle", { fontSize: size }).run(),
      unsetFontSize: () => ({ chain }) => chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

export default function CreateBlog() {
  const [title, setTitle] = useState("");
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [image, setImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();

  const editor = useEditor({
    extensions: [StarterKit, TextStyle, Color, FontFamily, FontSize, TextAlign.configure({ types: ["heading", "paragraph"] })],
    content,
    onUpdate: ({ editor }) => setContent(editor.getHTML()),
    editorProps: { attributes: { class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[200px] p-3 border rounded bg-gray-50" } },
  });

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [token]);

  // Fetch tags
  useEffect(() => {
    axios.get("http://localhost:5000/api/tags")
      .then(res => setTags(res.data))
      .catch(console.error);
  }, []);

  // Handle tags
  const handleTagChange = (tagId) => {
    setSelectedTags(prev => prev.includes(tagId)
      ? prev.filter(id => id !== tagId)
      : prev.length < 5 ? [...prev, tagId] : alert("Max 5 tags"));
  };

  // Crop callbacks
  const onCropComplete = useCallback((_, pixels) => setCroppedAreaPixels(pixels), []);
  const showCroppedImage = useCallback(async () => {
    try {
      const blob = await getCroppedImg(image, croppedAreaPixels);
      setCroppedImage(blob);
      setCropModalOpen(false);
    } catch (e) { console.error(e); }
  }, [image, croppedAreaPixels]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImage(URL.createObjectURL(file)); setCropModalOpen(true); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !mainCategory || !content || selectedTags.length === 0) { alert("Fill all required fields"); return; }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", mainCategory);
    if (subCategory) formData.append("subcategory", subCategory);
    formData.append("content", content);
    if (croppedImage) formData.append("image", croppedImage, "cropped.jpg");
    selectedTags.forEach(tagId => formData.append("tags[]", tagId));

    try {
      await axios.post("http://localhost:5000/api/blogs", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });
      setMessage("✅ Blog published successfully!");
      setTimeout(() => {
        setTitle(""); setMainCategory(""); setSubCategory(""); setContent("");
        editor.commands.setContent(""); setImage(null); setSelectedTags([]); setMessage("");
        navigate("/dashboard");
      }, 2000);
    } catch (err) { console.error(err); alert("Error creating blog"); }
  };

  const handleLogout = () => { localStorage.removeItem("token"); navigate("/"); };
  const getProfileImage = () => user?.profileImage || "/default-avatar.png";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-100 to-indigo-200 flex font-sans text-gray-800">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} handleLogout={handleLogout} />
      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-30 z-10 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex flex-col flex-1 md:ml-64 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between bg-white bg-opacity-90 py-3 px-6 shadow border-b z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 rounded bg-gray-100 hover:bg-gray-200" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <h1 className="text-xl md:text-2xl font-bold text-indigo-700 tracking-wide">Create Blog</h1>
          </div>
          <ProfileMenu user={user} handleLogout={handleLogout} getProfileImage={getProfileImage} />
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow-sm flex-grow">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input type="text" placeholder="Enter blog title..." className="w-full p-2 border rounded" value={title} onChange={(e) => setTitle(e.target.value)} />

            {/* Category */}
            <select value={mainCategory} onChange={e => { setMainCategory(e.target.value); setSubCategory(""); }} className="w-full p-2 border rounded">
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
            </select>
            {mainCategory && categories.find(c => c.name === mainCategory)?.subcategories.length > 0 && (
              <select value={subCategory} onChange={e => setSubCategory(e.target.value)} className="w-full p-2 border rounded">
                <option value="">Select Subcategory</option>
                {categories.find(c => c.name === mainCategory).subcategories.map(sc => <option key={sc} value={sc}>{sc}</option>)}
              </select>
            )}

            {/* Image Upload */}
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {croppedImage && <img src={URL.createObjectURL(croppedImage)} alt="Preview" className="w-full h-64 object-cover rounded border mt-2" />}

            <Modal isOpen={cropModalOpen} onRequestClose={() => setCropModalOpen(false)} ariaHideApp={false} className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
              <div className="bg-white p-4 rounded-lg shadow-lg w-[90%] max-w-lg">
                <h2 className="text-lg font-semibold mb-3">Crop your image</h2>
                <div className="relative w-full h-64 bg-gray-200">
                  <Cropper image={image} crop={crop} zoom={zoom} aspect={16/9} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
                </div>
                <div className="flex justify-between items-center mt-3">
                  <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={e => setZoom(e.target.value)} />
                  <button type="button" onClick={showCroppedImage} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Crop & Save</button>
                </div>
              </div>
            </Modal>

            {/* Tags */}
            <div className="border p-3 rounded">
              <h2 className="font-semibold mb-2">Select Tags (1–5 allowed)</h2>
              <div className="flex flex-wrap gap-3">
                {tags.map(tag => (
                  <label key={tag._id} className={`flex items-center gap-2 border px-3 py-1 rounded cursor-pointer ${selectedTags.includes(tag._id) ? "bg-blue-100 border-blue-400 text-blue-600" : "hover:bg-gray-50"}`}>
                    <input type="checkbox" checked={selectedTags.includes(tag._id)} onChange={() => handleTagChange(tag._id)} />
                    {tag.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Toolbar */}
            <EditorToolbar editor={editor} />
            <EditorContent editor={editor} />

            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">Publish</button>
          </form>
          {message && <div className="mt-4 text-green-600 font-semibold">{message}</div>}
        </div>
      </div>
    </div>
  );
}
