import { connectDB } from "../../../lib/mongodb";
import { getUserFromRequest } from "../../../lib/auth";
import pusher from "../../../lib/pusher-server";
import Message from "../../../models/Message";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const decoded = getUserFromRequest(req);
  if (!decoded) return res.status(401).json({ error: "Not authenticated" });
  await connectDB();
  const { to, message, isDM } = req.body;
  if (!to || !message) return res.status(400).json({ error: "Missing fields" });
  const msg = await Message.create({ from: decoded.username, to, message, isDM: !!isDM });
  const channel = isDM ? `dm-${[decoded.username, to].sort().join("-")}` : `chat-${to}`;
  await pusher.trigger(channel, "new-message", {
    id: msg._id.toString(),
    from: decoded.username,
    to,
    message,
    isDM: !!isDM,
    color: decoded.color,
    createdAt: msg.createdAt,
  });
  return res.status(200).json({ success: true });
}
