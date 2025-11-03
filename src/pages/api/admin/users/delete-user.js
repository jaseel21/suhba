import db from "@/lib/db";
import User from "@/models/User";
import UserTableData from "@/models/UserTableData";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  await db();

  const { userId } = req.body;
  console.log("Received delete request for userId:", userId);

  if (!userId) {
    return res.status(400).json({ success: false, message: "Missing userId" });
  }

  try {
    // Delete the user and their saved table data without additional auth check
    await User.findByIdAndDelete(userId);
    await UserTableData.deleteMany({ user: userId });

    return res.json({ success: true });
  } catch (err) {
    console.error("Error deleting user:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
