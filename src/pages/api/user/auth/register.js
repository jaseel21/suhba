import db from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        await db();

        const { username, email, password, category } = req.body;

        // Validation
        if (!username || !email || !password || !category) {
            return res.status(400).json({
                error: "Missing required fields",
                details: {
                    username: !username ? "Username is required" : null,
                    email: !email ? "Email is required" : null,
                    password: !password ? "Password is required" : null,
                    category: !category ? "Category is required" : null
                }
            });
        }

        // Check email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: "Invalid email format",
                field: "email"
            });
        }

        // Check if email exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                error: "Account already exists",
                field: "email",
                message: "This email address is already registered. Please use a different email or try logging in."
            });
        }

        // Check if username exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({
                error: "Username already taken",
                field: "username",
                message: "This username is already taken. Please choose a different username."
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            category,
            role: "user" // default role
        });

        // Return success but don't send password
        const { password: _, ...userWithoutPassword } = newUser.toObject();
        
        return res.status(201).json({
            message: "User registered successfully",
            user: userWithoutPassword
        });

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({
            error: "Registration failed",
            message: "An error occurred while creating your account. Please try again later."
        });
    }
}
