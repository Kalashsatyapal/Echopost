import { useEffect, useState } from "react";
import axios from "axios";

export default function Guidelines() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch guidelines from backend
  const fetchGuidelines = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/guidelines");
      setSections(res.data.sections);
    } catch (err) {
      console.error("Failed to fetch guidelines:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuidelines();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading guidelines...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        Community Guidelines
      </h1>
      {sections.map((section, idx) => (
        <div
          key={idx}
          className="mb-8 p-6 bg-white rounded-xl shadow-md border border-gray-200"
        >
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            {section.title}
          </h2>
          {section.rules.length === 0 ? (
            <p className="text-gray-500 italic">No rules defined yet.</p>
          ) : (
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              {section.rules.map((rule, rIdx) => (
                <li key={rIdx}>{rule}</li>
              ))}
            </ol>
          )}
        </div>
      ))}
    </div>
  );
}
