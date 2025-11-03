import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { ArrowRight, Trash2 } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/admin/users/get-users");
      setUsers(res.data.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      if (error.response?.status === 401) {
        router.push("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const goToUserPage = (id) => router.push(`/admin/users/${id}`);

  const confirmDelete = (userId) => {
    setSelectedUserId(userId);
    setShowModal(true);
  };

  const deleteUser = async () => {
    try {
      const res = await axios.post("/api/admin/users/delete-user", {
        userId: selectedUserId,
      });

      if (res.data.success) {
        alert("User deleted.");
        fetchUsers(); // Refresh
        setShowModal(false);
      } else {
        alert(res.data.message || "Failed to delete.");
      }
    } catch (err) {
      alert("Error deleting user.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-gray-900 flex flex-col md:flex-row">
      <AdminSidebar />
      <div className="flex-1 p-6 py-24 bg-white">
        <h1 className="text-4xl font-bold mb-10">All Users</h1>

        {loading ? (
          <p className="text-gray-600">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-600">No users found.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <div
                key={user._id}
                className="relative p-6 bg-white rounded-xl shadow hover:shadow-xl transition"
              >
                <h2 className="text-xl font-semibold text-green-800">{user.username}</h2>
                <p className="text-gray-600 mt-1">Email: {user.email}</p>
                <p className="text-gray-700">Category: {user.category || "N/A"}</p>

                <button
                  onClick={() => goToUserPage(user._id)}
                  className="absolute top-4 right-4 text-blue-600 hover:text-blue-800"
                  title="View Details"
                >
                  <ArrowRight />
                </button>

                <button
                  onClick={() => confirmDelete(user._id)}
                  className="mt-4 text-red-500 hover:text-red-700 text-sm"
                >
                  <Trash2 className="inline w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
              <h2 className="text-lg font-bold mb-4 text-gray-900">Confirm Delete</h2>
              <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete this user? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={deleteUser}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
