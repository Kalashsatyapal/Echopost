import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import debounce from "lodash.debounce";

import Sidebar from "../components/Sidebar.jsx";
import ProfileMenu from "../components/ProfileMenu.jsx";
import AllBlogList from "../components/AllBlogList.jsx";
import logo from "../assets/logo.png";

// Categories and subcategories
const categoryData = [
  {
    icon: "📝",
    name: "General & Lifestyle",
    subcategories: [
      "Personal Development",
      "Productivity & Time Management",
      "Minimalism",
      "Life Hacks",
      "Wellness & Mental Health",
    ],
  },
  {
    icon: "🌍",
    name: "Travel & Culture",
    subcategories: [
      "Travel Guides",
      "Backpacking & Budget Travel",
      "Cultural Experiences",
      "Local Cuisine",
      "Travel Photography",
    ],
  },
  {
    icon: "🍳",
    name: "Food & Drink",
    subcategories: [
      "Recipes",
      "Restaurant Reviews",
      "Vegan & Vegetarian Living",
      "Baking & Desserts",
      "Wine & Spirits",
    ],
  },
  {
    icon: "💼",
    name: "Business & Finance",
    subcategories: [
      "Entrepreneurship",
      "Freelancing & Side Hustles",
      "Marketing & Branding",
      "Investing & Personal Finance",
      "E-commerce & Dropshipping",
    ],
  },
  {
    icon: "🧠",
    name: "Education & Learning",
    subcategories: [
      "Study Tips",
      "Language Learning",
      "Online Courses & MOOCs",
      "Academic Research",
      "Homeschooling",
    ],
  },
  {
    icon: "💻",
    name: "Tech & Digital Life",
    subcategories: [
      "Software Reviews",
      "Coding & Programming",
      "AI & Machine Learning",
      "Cybersecurity",
      "Gadgets & Gear",
    ],
  },
  {
    icon: "🎨",
    name: "Creative Arts",
    subcategories: [
      "Writing & Storytelling",
      "Photography",
      "Graphic Design",
      "DIY & Crafts",
      "Music & Performance",
    ],
  },
  {
    icon: "🧘",
    name: "Health & Fitness",
    subcategories: [
      "Workout Routines",
      "Nutrition & Diets",
      "Yoga & Meditation",
      "Health Conditions & Recovery",
      "Sports & Athletics",
    ],
  },
  {
    icon: "🏡",
    name: "Home & Living",
    subcategories: [
      "Interior Design",
      "Gardening",
      "Home Improvement",
      "Sustainable Living",
      "Parenting & Family Life",
    ],
  },
  {
    icon: "🎮",
    name: "Entertainment & Media",
    subcategories: [
      "Movie & TV Reviews",
      "Book Recommendations",
      "Celebrity News",
      "Gaming",
      "Pop Culture Commentary",
    ],
  },
  {
    icon: "🗳️",
    name: "Society & Opinion",
    subcategories: [
      "Politics & Current Events",
      "Environmental Issues",
      "Human Rights",
      "Philosophy & Ethics",
      "Social Commentary",
    ],
  },
];

export default function Dashboard() {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  // ✅ Fetch logged-in user
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };

  // ✅ Fetch blogs with optional filters
  const fetchBlogs = async (
    searchTerm = search,
    mainCat = mainCategory,
    subCat = subCategory
  ) => {
    try {
      const res = await axios.get("http://localhost:5000/api/blogs", {
        params: {
          search: searchTerm,
          category: mainCat,
          subcategory: subCat,
        },
      });

      // Convert ObjectIds to strings for consistent comparison
      const blogsWithStringLikes = res.data.map((b) => ({
        ...b,
        likes: b.likes.map((id) => id.toString()),
      }));

      setBlogs(blogsWithStringLikes);
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
    }
  };

  // ✅ Debounced search to prevent multiple API calls per keystroke
  const debouncedFetchBlogs = useCallback(
    debounce(fetchBlogs, 500),
    [mainCategory, subCategory]
  );

  // ✅ Initial user fetch
  useEffect(() => {
    fetchUser();
  }, []);

  // ✅ Fetch blogs when user, search, or categories change
  useEffect(() => {
    if (user) {
      debouncedFetchBlogs(search, mainCategory, subCategory);
    }
    return debouncedFetchBlogs.cancel;
  }, [search, mainCategory, subCategory, user, debouncedFetchBlogs]);

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // ✅ Return user's profile image or default avatar
  const getProfileImage = () => {
    return user?.profileImage || "/default-avatar.png";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-100 to-indigo-200 font-sans text-gray-800 flex">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleLogout={handleLogout}
      />

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 md:ml-64 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between bg-white bg-opacity-90 py-3 px-6 shadow border-b z-10">
          {/* Left side (Logo + Title) */}
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 rounded bg-gray-100 hover:bg-gray-200"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="EchoPost Logo"
                className="h-8 w-8 object-contain"
              />
              <h1 className="text-xl md:text-2xl font-bold text-indigo-700 tracking-wide">
                EchoPost Dashboard
              </h1>
            </div>
          </div>

          {/* Profile Menu Dropdown */}
          <ProfileMenu
            user={user}
            handleLogout={handleLogout}
            getProfileImage={getProfileImage}
          />
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white bg-opacity-90 px-6 py-4 shadow border-b z-10 flex flex-col md:flex-row items-center gap-3">
          <input
            type="text"
            placeholder="🔍 Search blogs by title or author..."
            className="flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Main Category Filter */}
          <select
            className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            value={mainCategory}
            onChange={(e) => {
              setMainCategory(e.target.value);
              setSubCategory(""); // reset subcategory when main changes
            }}
          >
            <option value="">All Categories</option>
            {categoryData.map((c) => (
              <option key={c.name} value={c.name}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>

          {/* Subcategory Filter */}
          {mainCategory && (
            <select
              className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
            >
              <option value="">All Subcategories</option>
              {categoryData
                .find((c) => c.name === mainCategory)
                ?.subcategories.map((sc) => (
                  <option key={sc} value={sc}>
                    {sc}
                  </option>
                ))}
            </select>
          )}
        </div>

        {/* Blog List Content */}
        <div className="px-4 py-6 md:px-8 w-[calc(100%-100px)] mx-[50px] transition-all duration-300">
          <AllBlogList
            blogs={blogs}
            currentUserId={user?._id}
            refreshBlogs={() => fetchBlogs(search, mainCategory, subCategory)}
          />
        </div>
      </div>
    </div>
  );
}
