import UserProfileImage from "./UserProfileImage";

export default function CommentItem({
  comment,
  blogId,
  currentUserId,
  editingCommentId,
  startEditComment,
  saveEditComment,
  editCommentText,
  setEditCommentText,
  deleteComment,
}) {
  const isAuthor = comment.author._id === currentUserId;
  const isEditing = editingCommentId === comment._id;

  return (
    <div className="mb-2 p-2 bg-gray-50 rounded shadow-sm flex justify-between items-start gap-2">
      <div className="flex-1">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <UserProfileImage user={comment.author} size={28} />
            <span className="font-semibold text-gray-700">{comment.author.name}</span>
          </div>
        </div>
        {isEditing ? (
          <div className="mt-1">
            <input
              type="text"
              value={editCommentText}
              onChange={(e) => setEditCommentText(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => saveEditComment(blogId, comment._id)}
                className="px-2 py-1 bg-green-500 text-white rounded"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditCommentText("");
                  startEditComment(null, "");
                }}
                className="px-2 py-1 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-gray-700">{comment.text}</p>
        )}
      </div>
      {isAuthor && !isEditing && (
        <div className="flex gap-2">
          <button
            onClick={() => startEditComment(comment._id, comment.text)}
            className="text-sm text-yellow-600 hover:underline"
          >
            Edit
          </button>
          <button
            onClick={() => deleteComment(blogId, comment._id)}
            className="text-sm text-red-600 hover:underline"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}