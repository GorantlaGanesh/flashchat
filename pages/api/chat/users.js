import { connectDB } from "../../../lib/mongodb";
import { getUserFromRequest } from "../../../lib/auth";
import User from "../../../models/User";

export default async function handler(req, res) {
  const decoded = getUserFromRequest(req);
  if (!decoded) return res.status(401).json({ error: "Not authenticated" });
  await connectDB();
  const users = await User.find({ username: { $ne: decoded.username } }).select("username bio color").limit(50);
  return res.status(200).json(users);
}
