import BlogItem from "./BlogItem.jsx";

export default function BlogList({
  blogs,
  likedBlogIds,
  activeAnimations,
  openComments,
  commentsData,
  commentCounts,
  currentUserId,
  toggleLike,
  toggleComments,
  handleDelete,
  setNewCommentText,
  newCommentText,
  addComment,
  editingCommentId,
  startEditComment,
  saveEditComment,
  editCommentText,
  setEditCommentText,
  deleteComment,
}) {
  if (blogs.length === 0) {
    return (
      <div className="col-span-full text-center text-gray-500 py-10 bg-gray-50 rounded-lg shadow-inner">
        You haven’t written any blogs yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {blogs.map((b) => (
        <BlogItem
          key={b._id}
          blog={b}
          isLiked={likedBlogIds.includes(b._id)}
          isAnimating={activeAnimations[b._id]}
          comments={commentsData[b._id] || []}
          commentCount={commentCounts[b._id] || 0}
          currentUserId={currentUserId}
          toggleLike={toggleLike}
          toggleComments={toggleComments}
          handleDelete={handleDelete}
          setNewCommentText={setNewCommentText}
          newCommentText={newCommentText}
          addComment={addComment}
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
