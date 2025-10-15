import { FaUsers, FaBlog, FaCogs, FaClipboardList, FaFlag } from "react-icons/fa";

export default function TabsNavigation({ activeTab, setActiveTab }) {
  const tabs = [
    { key: "dashboard", label: "Dashboard", icon: <FaClipboardList /> },
    { key: "users", label: "Manage Users", icon: <FaUsers /> },
    { key: "guidelines", label: "Edit Guidelines", icon: <FaCogs /> },
    { key: "tags", label: "Manage Tags", icon: <FaBlog /> },
    { key: "reported", label: "Reported Blogs", icon: <FaFlag className="text-red-600" /> },
  ];

  return (
    <nav className="bg-white/70 shadow-sm backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-3 flex gap-8 justify-center font-medium">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 pb-1 relative transition-all duration-200 ${
              activeTab === tab.key
                ? "text-indigo-600 font-semibold"
                : "text-gray-600 hover:text-indigo-500"
            }`}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded"></span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
