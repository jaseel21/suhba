import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Connection state check
let isConnected = false;

const connectDB = async () => {
    // Return early if already connected
    if (isConnected && mongoose.connection.readyState === 1) {
        return;
    }

    try {
        const mongoUri = process.env.MONGO_URI;
        
        if (!mongoUri) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }

        const options = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        await mongoose.connect(mongoUri, options);
        
        isConnected = true;
        console.log("✅ MongoDB Connected Successfully");
        
        mongoose.connection.on('error', (err) => {
            console.error("❌ MongoDB Connection Error:", err);
            isConnected = false;
        });

        mongoose.connection.on('disconnected', () => {
            console.log("⚠️ MongoDB Disconnected");
            isConnected = false;
        });

    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);
        isConnected = false;
        
        // Don't exit in development - allow retries
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
        throw err;
    }
};

module.exports = connectDB;