// components/EditGuidelines.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function EditGuidelines() {
  const [sections, setSections] = useState([]);

  // Fetch guidelines
  const fetchGuidelines = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/guidelines");
      setSections(res.data.sections);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load guidelines");
    }
  };

  useEffect(() => {
    fetchGuidelines();
  }, []);

  const handleRuleChange = (sectionIdx, ruleIdx, value) => {
    const updated = [...sections];
    updated[sectionIdx].rules[ruleIdx] = value;
    setSections(updated);
  };

  const handleAddRule = (sectionIdx) => {
    const updated = [...sections];
    updated[sectionIdx].rules.push("");
    setSections(updated);
  };

  const handleRemoveRule = (sectionIdx, ruleIdx) => {
    const updated = [...sections];
    updated[sectionIdx].rules.splice(ruleIdx, 1);
    setSections(updated);
  };

  const handleSave = async () => {
    try {
      await axios.put(
        "http://localhost:5000/api/guidelines",
        { sections },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success("Guidelines updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update guidelines");
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-3xl font-bold mb-6">Edit Community Guidelines</h1>
      {sections.map((section, sIdx) => (
        <div key={sIdx} className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
          <ul className="space-y-2">
            {section.rules.map((rule, rIdx) => (
              <li key={rIdx} className="flex gap-2 items-center">
                <span>{rIdx + 1}.</span>
                <input
                  type="text"
                  value={rule}
                  onChange={(e) => handleRuleChange(sIdx, rIdx, e.target.value)}
                  className="flex-grow p-2 border rounded"
                />
                <button
                  onClick={() => handleRemoveRule(sIdx, rIdx)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleAddRule(sIdx)}
            className="mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add Rule
          </button>
        </div>
      ))}
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Save Guidelines
      </button>
    </div>
  );
}
