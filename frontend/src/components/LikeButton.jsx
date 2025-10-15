export default function LikeButton({ blog, isLiked, isAnimating, toggleLike }) {
  return (
    <button
      onClick={() => toggleLike(blog._id)}
      className={`relative flex items-center gap-1 font-semibold transition-transform duration-150 ${
        isLiked ? "text-blue-500 scale-110" : "text-gray-600"
      }`}
    >
      👍 {blog.likes.length}
      {isAnimating && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
          <span className="animate-fly-thumbs text-blue-500 text-lg">👍</span>
          {[...Array(6)].map((_, i) => (
            <span key={i} className={`absolute w-1 h-1 bg-blue-400 rounded-full animate-particle-${i}`} />
          ))}
        </div>
      )}
    </button>
  );
}