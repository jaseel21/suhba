import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import db from "@/lib/db";
import Admin from "@/models/Admin";
import Section from "@/models/Section";
import Table from "@/models/Table"; // Assuming you have a Table model
import UserTableData from "@/models/UserTableData";
import User from "@/models/User";
import mongoose from "mongoose";
import { stringify } from "postcss";


// Admin Login
export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Compare with environment variables
        if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ error: "Invalid Email or Password" });
        }

        // Generate JWT token
        const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: "1d" });

        // Set token in HTTP-only cookie
        res.setHeader(
            "Set-Cookie",
            cookie.serialize("authToken", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
            })
        );

        res.status(200).json({ message: "Login Successful", admin: { email } });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

// Admin Logout
export const logoutAdmin = (req, res) => {
    res.setHeader(
        "Set-Cookie",
        cookie.serialize("authToken", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            expires: new Date(0),
        })
    );

    res.status(200).json({ message: "Logout Successful" });
};


export const listSection = async (req, res) => {
    try {
        await db(); // Ensure database connection

        const sections = await Section.find();
        if (!sections.length) return res.status(404).json({ error: "No Sections Found" });

        res.status(200).json({ sections });
    } catch (error) {
        console.error("Error fetching sections:", error);
        res.status(500).json({ error: "Failed to fetch sections" });
    }
};

// Create Section
export const createSection = async (req, res) => {
    try {
        await db();
        const { number, name, sectionCategory } = req.body;
        const newSection = new Section({ number, name, sectionCategory });
        await newSection.save();
        res.status(201).json({ message: "Section Created Successfully", section: newSection });
    } catch (error) {
        res.status(500).json({ error: "Failed to create section" });
    }
};

// Delete Section
export const deleteSection = async (req, res) => {
    try {
        await db();
        await Section.findByIdAndDelete(req.query.id);
        res.status(200).json({ message: "Section Deleted Successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete section" });
    }
};

// View Section (Fetch by ID)
export const viewSection = async (req, res) => {
    try {
        await db();
        const section = await Section.findById(req.query.id);
        if (!section) return res.status(404).json({ error: "Section Not Found" });

        const tables = await Table.find({ section: section._id }).populate("section");
        res.status(200).json({ section, tables });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch section" });
    }
};

//create table

// export const createTable = async (req, res) => {
//     try {
//         console.log("Incoming Request Body:", req.body); // Debugging Log
//         const { sectionId, tableName, columnsCount, rowsCount, columnData } = req.body;

//         if (!sectionId || sectionId.trim() === "") {
//             return res.status(400).json({ message: "Section ID is required" });
//         }

//         const section = await Section.findById(sectionId);
//         if (!section) {
//             return res.status(404).send('Section Not Found');
//         }

//         // Create columns array
//         let columns = [];
//         for (let i = 0; i < columnsCount; i++) {
//             columns.push({
//                 name: req.body[`columnName${i}`],
//                 type: req.body[`columnType${i}`],
//                 isEditable: req.body[`isEditable${i}`] === 'on' ? true : false
//             });
//         }

//         // Create table
//         const table = new Table({
//             section: sectionId,
//             tableName,
//             columns,
//             rowsCount,
//             columnData: [] // Initialize the data array
//         });

//         // Populate data array with rows and columns
//         for (let i = 1; i <= rowsCount; i++) {
//             const row = {
//                 rowNumber: i,
//                 columns: columns.map((col) => ({
//                     columnName: col.name,
//                     value: "", // Initialize with empty value
//                     type: col.type, // Add the column type to each column
//                     isEditable: col.isEditable
//                 }))
//             };
//             table.data.push(row); // Add the row to the data array
//         }

//         await table.save();
//         res.status(201).json({ message: "Table Created Successfully", table });
//     } catch (error) {
//         console.error("Error creating table:", error);
//         res.status(500).json({ error: "Failed to create table" });
//     }
// };

export const createTable = async (req, res) => {
    try {
        console.log("Request Body:", req.body);

        const { sectionId, tableName, columns, rowsCount } = req.body;

        if (!sectionId || sectionId.trim() === "") {
            return res.status(400).json({ message: "Section ID is required" });
        }

        const section = await Section.findById(sectionId);
        if (!section) {
            return res.status(404).json({ message: "Section Not Found" });
        }

        if (!columns || !Array.isArray(columns) || columns.length === 0) {
            return res.status(400).json({ message: "Columns data is required" });
        }
        // Create table
        const table = new Table({
            section: sectionId,
            tableName,
            columns,
            rowsCount: Number(rowsCount),
            data: []
        });

        // Populate data array with rows and columns
        for (let i = 1; i <= table.rowsCount; i++) {
            const row = {
                rowNumber: i,
                columns: columns.map((col) => ({
                    columnName: col.name,
                    value: "",
                    type: col.type,
                    isEditable: col.isEditable
                }))
            };
            table.data.push(row);
        }

        await table.save();
        return res.status(201).json({ message: "Table created successfully", table });
    } catch (error) {
        console.error("Error creating table:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const viewTables = async (sectionId) => {
    try {

        await db(); // Ensure database connection

        if (!sectionId) {
            throw new Error("Missing section ID.");
        }

        const tables = await Table.find({ section: sectionId });

        return tables; // Return data, don't use `res.status()`
    } catch (error) {
        console.error("❌ Error fetching tables:", error);
        throw new Error("Database query failed");
    }
};


export const deleteTable = async (req, res) => {
    try {
        const { id } = req.query; // The table ID to delete
        if (!id) {
            return res.status(400).json({ error: "Missing table ID" });
        }

        // Find and delete the table by ID
        const table = await Table.findByIdAndDelete(id);

        if (!table) {
            return res.status(404).json({ error: "Table not found" });
        }

        return res.status(200).json({ message: "Table deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Failed to delete table" });
    }
};


export const getEditableTable = async (req, res) => {
    try {
        await db(); // Ensure database connection

        console.log("Received ID:", req.query.id);
        console.log("Type of ID:", typeof req.query.id);

        if (!req.query.id) {
            return res.status(400).json({ error: "Missing Table ID." });
        }

        if (!mongoose.Types.ObjectId.isValid(req.query.id)) {
            return res.status(400).json({ error: "Invalid Table ID format." });
        }
        const table = await Table.findOne({ _id: req.query.id }).populate('section');
        console.log("Found Table:", table);

        if (!table) {
            return res.status(404).json({ error: "Table not found." });
        }

        return res.status(200).json({ table });
    } catch (error) {
        console.error("❌ Error fetching table:", error);
        return res.status(500).json({ error: "Database query failed" });
    }
};


// export const updateTable = async (req, res) => {
//     console.log("rciveeeeee", req.body);
//     try {
//         const { id } = req.query;
//         const { table } = req.body;
//         console.log(req.body);
//         if (!id || !table) {
//             return res.status(400).json({ message: "Table ID and Data are required" });
//         }

//         const existingTable = await Table.findById(id);
//         if (!existingTable) {
//             return res.status(404).json({ message: "Table not found" });
//         }

//         // Update table properties
//         existingTable.tableName = table.tableName;
//         existingTable.columns = table.columns;

//         // ✅ Ensure each cell respects the column's `isEditable`
//         if (Array.isArray(table.data)) {
//             existingTable.data = table.data.map((row, rowIndex) => ({
//                 rowNumber: row.rowNumber,
//                 columns: row.columns.map((col, colIndex) => ({
//                     columnName: table.columns[colIndex]?.name,
//                     value: col.value || "",
//                     type: col.type || "text",
//                     isEditable: table.columns[colIndex]?.isEditable ?? false, // Ensuring correct editability
//                 })),
//             }));
//             const { maxMarks } = calculateMaxMarksOnly(existingTable.data);
//             existingTable.maxMarks = maxMarks;
//             existingTable.tableDescription = table.tableDescription;

//         }

//         await existingTable.save();
//         return res.status(200).json({ message: "Table updated successfully", table: existingTable });
//     } catch (error) {
//         console.error("Error updating table:", error);
//         res.status(500).json({ message: "Server Error" });
//     }
// };

export const updateTable = async (req, res) => {
    console.log("Received:", req.body);
    try {
        const { id } = req.query;
        const { table } = req.body;

        if (!id || !table) {
            return res.status(400).json({ message: "Table ID and Data are required" });
        }

        const existingTable = await Table.findById(id);
        if (!existingTable) {
            return res.status(404).json({ message: "Table not found" });
        }

        // Update basic table properties
        existingTable.tableName = table.tableName;
        existingTable.columns = table.columns;
        existingTable.tableDescription = table.tableDescription;

        if (Array.isArray(table.data)) {
            existingTable.data = table.data.map((row, rowIndex) => ({
                rowNumber: row.rowNumber,
                columns: row.columns.map((col, colIndex) => ({
                    columnName: table.columns[colIndex]?.name,
                    value: col.value || "",
                    type: col.type || "text",
                    isEditable: table.columns[colIndex]?.isEditable ?? false,
                })),
            }));

            // Dynamically calculate max values depending on available types
            const { maxMarks, maxPoints } = calculateMaxValues(existingTable.data);
            if (maxMarks) existingTable.maxMarks = maxMarks;
            if (maxPoints) existingTable.maxPointTotal = maxPoints;

        }

        await existingTable.save();
        return res.status(200).json({ message: "Table updated successfully", table: existingTable });
    } catch (error) {
        console.error("Error updating table:", error);
        res.status(500).json({ message: "Server Error" });
    }
};


const calculateMaxValues = (data) => {
    let maxMarks = 0;
    let maxPoints = 0;

    data.forEach(row => {
        row.columns.forEach(col => {
            const value = Number(col.value) || 0;

            if (col.type === "max-mark") {
                maxMarks += value;
            } else if (col.type === "max-point") {
                maxPoints += value;
            }
        });
    });

    return {
        maxMarks: maxMarks > 0 ? [maxMarks] : null,
        maxPoints: maxPoints > 0 ? [maxPoints] : null
    };
};



export const getAllUsers = async (req, res) => {
    console.log("get ALL users:", req.body);
    try {
        await db();
        const users = await User.find({}).lean();
        res.status(200).json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getUserSections = async (req, res) => {
    const { id } = req.query;
    console.log("user sections:", req.query);
    try {
        const sections = await Section.find();
        res.status(200).json({ sections });
    } catch (err) {
        console.error("Error fetching user sections:", err);
        res.status(500).json({ error: "Failed to fetch user sections" });
    }
};

export const getTablesByUserAndSection = async (userId, sectionId) => {

    console.log("user tablessss", userId, sectionId)
    try {
        const tables = await UserTableData.find({ section: sectionId, user: userId }).populate("user").lean();
        return tables;
    } catch (error) {
        console.error("Error in getTablesByUserAndSection:", error);
        throw error;
    }
};


// export const updateMark = async (req) => {
//     const { userId, tableId, data } = req.body;

//     console.log("📝 Incoming Request:", { userId, tableId, data });

//     await db();

//     const userTableData = await UserTableData.findOne({
//         _id: tableId,
//         user: userId,
//     });

//     if (!userTableData) {
//         console.error("❌ Table not found for user");
//         return { status: 404, data: { error: "Table not found" } };
//     }

//     for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
//         const row = data[rowIndex];
//         const originalRow = userTableData.data[rowIndex];

//         for (let colIndex = 0; colIndex < row.columns.length; colIndex++) {
//             const col = row.columns[colIndex];

//             // 🔍 Instead of using originalCol.columnName, use incoming col.type
//             if (["mark", "max-mark"].includes(col.type?.toLowerCase())) {
//                 // Find matching column in original data by type
//                 const targetCol = originalRow.columns.find(
//                     (c) => c.type?.toLowerCase() === col.type?.toLowerCase()
//                 );

//                 if (targetCol) {
//                     console.log(`✅ Updating ${col.type} →`, col.value);
//                     targetCol.value = col.value;
//                 } else {
//                     console.warn("⚠️ Column with type not found:", col.type);
//                 }
//             }
//         }
//     }

//     // 🔢 Calculate totalMarks (only marks)
//     const { marksTotal } = calculateMarksOnly(userTableData.data);
//     userTableData.totalMarks = marksTotal;



//     // 🧮 Calculate percentage if maxMarks exist
//     const max = userTableData.maxMarks?.[0] || 0;
//     const percentage = max > 0 ? ((marksTotal[0] / max) * 100).toFixed(2) : 0;
//     userTableData.percentage = [Number(percentage)];

//     userTableData.markModified("data");

//     try {
//         await userTableData.save();
//         console.log("✅ ✅ Saved table with total and percentage:", JSON.stringify(userTableData.data, null, 2));
//         return { status: 200, data: { message: "Marks updated successfully" } };
//     } catch (err) {
//         console.error("❌ Failed to save:", err);
//         return { status: 500, data: { error: "Failed to save data" } };
//     }
// };


// const calculateMarksOnly = (data) => {
//     let marksTotal = 0;
//     data.forEach(row => {
//         row.columns.forEach(col => {
//             if (col.type === "mark") {
//                 marksTotal += Number(col.value) || 0;
//             }
//         });
//     });
//     return { marksTotal: [marksTotal] };
// };


// export const updateMark = async (req) => {
//     const { userId, tableId, data } = req.body;

//     console.log("📝 Incoming Request:", { userId, tableId, data });

//     await db();

//     const userTableData = await UserTableData.findOne({
//         _id: tableId,
//         user: userId,
//     });

//     if (!userTableData) {
//         console.error("❌ Table not found for user");
//         return { status: 404, data: { error: "Table not found" } };
//     }

//     for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
//         const row = data[rowIndex];
//         const originalRow = userTableData.data[rowIndex];

//         for (let colIndex = 0; colIndex < row.columns.length; colIndex++) {
//             const col = row.columns[colIndex];

//             // 🔍 Instead of using originalCol.columnName, use incoming col.type
//             if (["mark", "max-mark"].includes(col.type?.toLowerCase())) {
//                 // Find matching column in original data by type
//                 const targetCol = originalRow.columns.find(
//                     (c) => c.type?.toLowerCase() === col.type?.toLowerCase()
//                 );

//                 if (targetCol) {
//                     console.log(`✅ Updating ${col.type} →`, col.value);
//                     targetCol.value = col.value;
//                 } else {
//                     console.warn("⚠️ Column with type not found:", col.type);
//                 }
//             }
//         }
//     }

//     // 🔢 Calculate totalMarks (only marks)
//     const { marksTotal } = calculateMarksOnly(userTableData.data);
//     userTableData.totalMarks = marksTotal;



//     // 🧮 Calculate percentage if maxMarks exist
//     const max = userTableData.maxMarks?.[0] || 0;
//     const percentage = max > 0 ? ((marksTotal[0] / max) * 100).toFixed(2) : 0;
//     userTableData.percentage = [Number(percentage)];

//     userTableData.markModified("data");

//     try {
//         await userTableData.save();
//         console.log("✅ ✅ Saved table with total and percentage:", JSON.stringify(userTableData.data, null, 2));
//         return { status: 200, data: { message: "Marks updated successfully" } };
//     } catch (err) {
//         console.error("❌ Failed to save:", err);
//         return { status: 500, data: { error: "Failed to save data" } };
//     }
// };


// const calculateMarksOnly = (data) => {
//     let marksTotal = 0;
//     data.forEach(row => {
//         row.columns.forEach(col => {
//             if (col.type === "mark") {
//                 marksTotal += Number(col.value) || 0;
//             }
//         });
//     });
//     return { marksTotal: [marksTotal] };
// };


export const updateMark = async (req) => {
    const { userId, tableId, data } = req.body;

    console.log("📝 Incoming Request:", { userId, tableId, data });

    await db();

    const userTableData = await UserTableData.findOne({
        _id: tableId,
        user: userId,
    });

    if (!userTableData) {
        console.error("❌ Table not found for user");
        return { status: 404, data: { error: "Table not found" } };
    }

    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
        const row = data[rowIndex];
        const originalRow = userTableData.data[rowIndex];

        for (let colIndex = 0; colIndex < row.columns.length; colIndex++) {
            const col = row.columns[colIndex];

            // 🔍 Instead of using originalCol.columnName, use incoming col.type
            if (["mark", "max-mark", "point", "max-point"].includes(col.type?.toLowerCase())) {
                // Find matching column in original data by type
                const targetCol = originalRow.columns.find(
                    (c) => c.type?.toLowerCase() === col.type?.toLowerCase()
                );

                if (targetCol) {
                    console.log(`✅ Updating ${col.type} →`, col.value);
                    targetCol.value = col.value;
                } else {
                    console.warn("⚠️ Column with type not found:", col.type);
                }
            }
        }
    }

    // 🔢 Calculate totalMarks (only marks)
    const { marksTotal, pointsTotal } = calculateMarksOnly(userTableData.data);
    userTableData.totalMarks = marksTotal;
    userTableData.pointTotal = pointsTotal;

    // 🧮 Calculate percentage if maxMarks exist
    // Marks percentage
    const maxMarks = userTableData.maxMarks?.[0] || 0;
    const markPercentage = maxMarks > 0 ? ((marksTotal[0] / maxMarks) * 100).toFixed(2) : 0;
    userTableData.percentage = [Number(markPercentage)];

    // Points percentage (optional)
    const maxPoints = userTableData.maxPointTotal?.[0] || 0;
    const pointPercentage = maxPoints > 0 ? ((pointsTotal[0] / maxPoints) * 100).toFixed(2) : 0;
    userTableData.pointPercentage = [Number(pointPercentage)];

    userTableData.markModified("data");

    try {
        await userTableData.save();
        console.log("✅ ✅ Saved table with total and percentage:", JSON.stringify(userTableData.data, null, 2));
        return { status: 200, data: { message: "Marks updated successfully" } };
    } catch (err) {
        console.error("❌ Failed to save:", err);
        return { status: 500, data: { error: "Failed to save data" } };
    }
};


const calculateMarksOnly = (data) => {
    let marksTotal = 0;
    let pointsTotal = 0;

    data.forEach(row => {
        row.columns.forEach(col => {
            if (col.type === "mark") {
                marksTotal += Number(col.value) || 0;
            }
            if (col.type === "point") {
                pointsTotal += Number(col.value) || 0;
            }
        });
    });

    return {
        marksTotal: [marksTotal],
        pointsTotal: [pointsTotal]
    };
};



export const LeaderboardSection = async (req, res) => {
    try {
        await db();

        const { category } = req.query;
        if (!category) {
            return res.status(400).json({ error: "Category is required" });
        }

        // Step 1: Get all users in this category
        const users = await User.find({ category });
        const userIds = users.map(user => user._id);

        // Step 2: Get all table data for these users
        const allTableData = await UserTableData.find({ user: { $in: userIds } });

        // Step 3: Build leaderboard by user
        const sumArray = (arr) => arr.reduce((acc, val) => acc + val, 0);

        const leaderboard = users.map(user => {
            const userData = allTableData.filter(d => d.user.toString() === user._id.toString());

            const totalMarks = userData.reduce((sum, d) => sum + sumArray(d.totalMarks), 0);

            return {
                _id: user._id,
                name: user.username,
                email: user.email,
                totalTables: userData.length,
                totalMarks
            };
        });
        console.log("leaderboard", leaderboard);
        // Sort by totalMarks descending
        const sorted = leaderboard.sort((a, b) => b.totalMarks - a.totalMarks);

        // Top 3
        const topThree = sorted.slice(0, 3);

        res.status(200).json({
            topThree,
            totalUsers: leaderboard.length,
            allUsers: sorted
        });

    } catch (err) {
        console.error("Leaderboard error:", err);
        res.status(500).json({ error: "Server Error" });
    }
};
