import React from "react";

export default function EditorToolbar({ editor }) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center bg-gray-100 border rounded-md p-2 mb-2 shadow-sm">
      {/* Bold */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-3 py-1 rounded ${
          editor.isActive("bold") ? "bg-blue-500 text-white" : "bg-white text-gray-800 border"
        }`}
      >
        <b>B</b>
      </button>

      {/* Italic */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-3 py-1 rounded ${
          editor.isActive("italic") ? "bg-blue-500 text-white" : "bg-white text-gray-800 border"
        }`}
      >
        <i>I</i>
      </button>

      {/* Underline */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className="px-3 py-1 bg-white border rounded text-gray-800"
      >
        U
      </button>

      {/* Text Alignment */}
      {["left", "center", "right", "justify"].map((align) => (
        <button
          key={align}
          type="button"
          onClick={() => editor.chain().focus().setTextAlign(align).run()}
          className="px-3 py-1 bg-white border rounded text-gray-800"
        >
          {align[0].toUpperCase()}
        </button>
      ))}

      {/* Font Family */}
      <select
        onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
        className="border rounded px-2 py-1 bg-white"
      >
        <option value="">Font</option>
        <option value="Arial">Arial</option>
        <option value="Georgia">Georgia</option>
        <option value="Courier New">Courier</option>
        <option value="Times New Roman">Times</option>
        <option value="Verdana">Verdana</option>
      </select>

      {/* Font Color */}
      <input
        type="color"
        onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
        className="w-8 h-8 p-0 border rounded bg-white"
      />

      {/* Font Size */}
      <select
        onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
        className="border rounded px-2 py-1 bg-white"
      >
        <option value="">Size</option>
        <option value="12px">12</option>
        <option value="14px">14</option>
        <option value="16px">16</option>
        <option value="18px">18</option>
        <option value="20px">20</option>
        <option value="24px">24</option>
        <option value="30px">30</option>
      </select>
    </div>
  );
}
