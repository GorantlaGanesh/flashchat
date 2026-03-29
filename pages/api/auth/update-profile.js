import { connectDB } from "../../../lib/mongodb";
import { getUserFromRequest } from "../../../lib/auth";
import User from "../../../models/User";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const decoded = getUserFromRequest(req);
  if (!decoded) return res.status(401).json({ error: "Not authenticated" });
  await connectDB();
  const { bio, color } = req.body;
  const user = await User.findByIdAndUpdate(decoded.id, { bio, color }, { new: true }).select("-password");
  return res.status(200).json({ username: user.username, bio: user.bio, color: user.color });
}
