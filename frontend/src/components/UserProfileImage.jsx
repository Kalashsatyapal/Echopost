export default function UserProfileImage({ user, size = 32 }) {
  if (!user) return null;

  const getProfileImage = () => {
    if (!user.profileImage) return null;
    if (user.profileImage.startsWith("data:image") || user.profileImage.startsWith("http")) return user.profileImage;
    const base64Pattern = /^[A-Za-z0-9+/]+={0,2}$/;
    if (base64Pattern.test(user.profileImage)) return `data:image/png;base64,${user.profileImage}`;
    return `http://localhost:5000${user.profileImage}`;
  };

  const imageUrl = getProfileImage();

  return (
    <img
      src={imageUrl || "/default-profile.png"} // fallback image if any
      alt={`${user.name}'s profile`}
      className="rounded-full object-cover"
      style={{ width: size, height: size }}
      title={user.name}
    />
  );
}