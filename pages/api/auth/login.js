import bcrypt from "bcryptjs";
import cookie from "cookie";
import { connectDB } from "../../../lib/mongodb";
import { signToken } from "../../../lib/auth";
import User from "../../../models/User";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  await connectDB();
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "All fields required" });
  const user = await User.findOne({ username: username.trim() });
  if (!user) return res.status(400).json({ error: "Invalid username or password" });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Invalid username or password" });
  const token = signToken({ id: user._id, username: user.username, color: user.color });
  res.setHeader("Set-Cookie", cookie.serialize("token", token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 }));
  return res.status(200).json({ username: user.username, bio: user.bio, color: user.color });
}
