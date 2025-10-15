import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function BlogEditor({ content, setContent }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content || "",
    onUpdate: ({ editor }) => setContent(editor.getHTML()),
  });

  return (
    <div className="border rounded p-2 min-h-[200px]">
      <EditorContent editor={editor} />
    </div>
  );
}
