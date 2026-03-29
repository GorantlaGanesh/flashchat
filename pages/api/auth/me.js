import { connectDB } from "../../../lib/mongodb";
import { getUserFromRequest } from "../../../lib/auth";
import User from "../../../models/User";

export default async function handler(req, res) {
  const decoded = getUserFromRequest(req);
  if (!decoded) return res.status(401).json({ error: "Not authenticated" });
  await connectDB();
  const user = await User.findById(decoded.id).select("-password");
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.status(200).json({ username: user.username, bio: user.bio, color: user.color });
}
