import pusher from "../../lib/pusher-server";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { username, message, room } = req.body;

  if (!username || !message || !room) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const chatMessage = {
    id: Date.now().toString(),
    username,
    message,
    room,
    timestamp: new Date().toISOString(),
  };

  await pusher.trigger(`chat-${room}`, "new-message", chatMessage);

  return res.status(200).json({ success: true });
}
