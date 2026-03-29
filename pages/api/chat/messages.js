import { connectDB } from "../../../lib/mongodb";
import { getUserFromRequest } from "../../../lib/auth";
import Message from "../../../models/Message";
import User from "../../../models/User";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const decoded = getUserFromRequest(req);
  if (!decoded) return res.status(401).json({ error: "Not authenticated" });
  await connectDB();
  const { to, isDM } = req.query;
  let messages;
  if (isDM === "true") {
    messages = await Message.find({
      isDM: true,
      $or: [{ from: decoded.username, to }, { from: to, to: decoded.username }],
    }).sort({ createdAt: 1 }).limit(100);
  } else {
    messages = await Message.find({ to, isDM: false }).sort({ createdAt: 1 }).limit(100);
  }
  const usernames = [...new Set(messages.map(m => m.from))];
  const users = await User.find({ username: { $in: usernames } }).select("username color");
  const colorMap = {};
  users.forEach(u => { colorMap[u.username] = u.color; });
  return res.status(200).json(messages.map(m => ({
    id: m._id.toString(), from: m.from, to: m.to,
    message: m.message, isDM: m.isDM,
    color: colorMap[m.from] || "#4d96ff",
    createdAt: m.createdAt,
  })));
}
