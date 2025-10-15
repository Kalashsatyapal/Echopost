import CommentItem from "./CommentItem.jsx";

export default function CommentsSection({
  blogId,
  comments,
  currentUserId,
  newCommentText,
  setNewCommentText,
  addComment,
  editingCommentId,
  startEditComment,
  saveEditComment,
  editCommentText,
  setEditCommentText,
  deleteComment,
}) {
  return (
    <div className="mt-3 border-t pt-3">
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Write a comment..."
          value={newCommentText[blogId] || ""}
          onChange={(e) => setNewCommentText((prev) => ({ ...prev, [blogId]: e.target.value }))}
          className="flex-grow p-2 border rounded shadow-sm"
        />
        <button
          onClick={() => addComment(blogId)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Comment
        </button>
      </div>

      {comments.map((c) => (
        <CommentItem
          key={c._id}
          comment={c}
          blogId={blogId}
          currentUserId={currentUserId}
          editingCommentId={editingCommentId}
          startEditComment={startEditComment}
          saveEditComment={saveEditComment}
          editCommentText={editCommentText}
          setEditCommentText={setEditCommentText}
          deleteComment={deleteComment}
        />
      ))}
    </div>
  );
}