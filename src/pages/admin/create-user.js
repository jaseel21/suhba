import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import AdminSidebar from "@/components/AdminSidebar";

export default function CreateUser() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        category: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();

    // Check if admin is logged in
    useEffect(() => {
        const checkAuth = async () => {
            try {
                await axios.get("/api/admin/auth/me");
            } catch (error) {
                router.push("/admin/login");
            }
        };
        checkAuth();
    }, []);

    const [fieldErrors, setFieldErrors] = useState({});

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setFieldErrors({});

        try {
            const res = await axios.post("/api/user/auth/register", formData);
            if (res.status === 201) {
                setSuccess("User created successfully!");
                setFormData({ username: "", email: "", password: "", category: "" }); // Reset form
            }
        } catch (err) {
            const responseData = err.response?.data;
            
            if (responseData?.field) {
                // Handle field-specific errors
                setFieldErrors({
                    [responseData.field]: responseData.message || responseData.error
                });
            } else if (responseData?.details) {
                // Handle missing fields validation
                setFieldErrors(
                    Object.fromEntries(
                        Object.entries(responseData.details)
                            .filter(([_, value]) => value !== null)
                    )
                );
            } else {
                // Handle general errors
                setError(responseData?.message || responseData?.error || "Failed to create user. Please try again.");
            }
        }
    };

    return (
        <div className="min-h-screen w-full bg-white text-gray-900 flex flex-col md:flex-row">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 bg-gray-50">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8">Create New User</h1>

                    <div className="bg-white shadow-lg rounded-xl p-8">
                        <form onSubmit={handleRegister} className="space-y-6">
                            {/* Username Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                <input
                                    type="text"
                                    placeholder="Enter username"
                                    value={formData.username}
                                    onChange={(e) => {
                                        setFormData({ ...formData, username: e.target.value });
                                        setFieldErrors({ ...fieldErrors, username: null });
                                    }}
                                    required
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                        fieldErrors.username ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {fieldErrors.username && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.username}</p>
                                )}
                            </div>

                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    placeholder="Enter email"
                                    value={formData.email}
                                    onChange={(e) => {
                                        setFormData({ ...formData, email: e.target.value });
                                        setFieldErrors({ ...fieldErrors, email: null });
                                    }}
                                    required
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                        fieldErrors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {fieldErrors.email && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                                )}
                            </div>

                            {/* Password Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <input
                                    type="password"
                                    placeholder="Enter password"
                                    value={formData.password}
                                    onChange={(e) => {
                                        setFormData({ ...formData, password: e.target.value });
                                        setFieldErrors({ ...fieldErrors, password: null });
                                    }}
                                    required
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                        fieldErrors.password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {fieldErrors.password && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
                                )}
                            </div>

                            {/* Category Select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => {
                                        setFormData({ ...formData, category: e.target.value });
                                        setFieldErrors({ ...fieldErrors, category: null });
                                    }}
                                    required
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white ${
                                        fieldErrors.category ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="" disabled>Select Category</option>
                                    <option value="below-20">Below 20</option>
                                    <option value="below-50">Below 50</option>
                                    <option value="above-50">Above 50</option>
                                </select>
                                {fieldErrors.category && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.category}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-semibold"
                            >
                                Create User
                            </button>
                        </form>

                        {/* Feedback Messages */}
                        {error && (
                            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg">
                                {success}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}