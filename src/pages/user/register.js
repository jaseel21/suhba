// import { useState } from "react";
// import axios from "axios";
// import { useRouter } from "next/router";

// export default function Register() {
//     const [formData, setFormData] = useState({ username: "", email: "", password: "", category: "" });
//     const [error, setError] = useState("");
//     const [success, setSuccess] = useState("");
//     const router = useRouter();

//     const handleRegister = async (e) => {
//         e.preventDefault();
//         setError("");
//         setSuccess("");

//         try {
//             const res = await axios.post("/api/user/auth/register", formData);
//             if (res.status === 201) {
//                 setSuccess("Registration successful! Redirecting to login...");
//                 setTimeout(() => router.push("/user/login"), 2000);
//             }
//         } catch (err) {
//             setError(err.response?.data?.error || "Something went wrong");
//         }
//     };

//     return (
//         <div>
//             <h1>User Registration</h1>
//             <form onSubmit={handleRegister}>
//                 <input
//                     type="text"
//                     placeholder="User Name"
//                     value={formData.username}
//                     onChange={(e) => setFormData({ ...formData, username: e.target.value })}
//                     required
//                 />
//                 <input
//                     type="email"
//                     placeholder="Email"
//                     value={formData.email}
//                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                     required
//                 />
//                 <input
//                     type="password"
//                     placeholder="Password"
//                     value={formData.password}
//                     onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                     required
//                 />
//                 {/* Category Select */}
//                 <select
//                     className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     value={formData.category}
//                     onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//                     required
//                 >
//                     <option value="" disabled>Select Category</option>
//                     <option value="below-20">Below 20</option>
//                     <option value="below-50">Below 50</option>
//                     <option value="above-50">Above 50</option>
//                 </select>


//                 <button type="submit">Register</button>
//             </form>
//             {error && <p style={{ color: "red" }}>{error}</p>}
//             {success && <p style={{ color: "green" }}>{success}</p>}
//         </div>
//     );
// }

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function DeprecatedRegister() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to login page with a small delay
        const timer = setTimeout(() => {
            router.push("/user/login");
        }, 1500);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Registration Page Moved</h2>
                <p className="text-gray-600 mb-4">Please contact an administrator to create a new account.</p>
                <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-gray-500 mt-4">Redirecting to login page...</p>
            </div>
        </div>
    );
}
