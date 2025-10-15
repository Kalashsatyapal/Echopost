import ManageUsers from "../../components/ManageUsers";
import EditGuidelines from "../../components/EditGuidelines";

export default function UsersAndGuidelines({ section }) {
  return (
    <section className="bg-white bg-opacity-90 p-6 rounded-2xl shadow-lg mt-6">
      {section === "users" && (
        <>
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">👤 Manage Users</h2>
          <ManageUsers />
        </>
      )}
      {section === "guidelines" && (
        <>
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">🛠️ Edit Guidelines</h2>
          <EditGuidelines />
        </>
      )}
    </section>
  );
}
