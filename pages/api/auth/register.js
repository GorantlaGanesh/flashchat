import bcrypt from "bcryptjs";
import cookie from "cookie";
import { connectDB } from "../../../lib/mongodb";
import { signToken } from "../../../lib/auth";
import User from "../../../models/User";

const COLORS = ["#ff6b6b","#ffd93d","#6bcb77","#4d96ff","#ff922b","#cc5de8","#20c997","#f06595"];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  await connectDB();
  const { username, password, bio } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Username and password required" });
  if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
  const exists = await User.findOne({ username: username.trim() });
  if (exists) return res.status(400).json({ error: "Username already taken" });
  const hashed = await bcrypt.hash(password, 10);
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const user = await User.create({ username: username.trim(), password: hashed, bio: bio || "", color });
  const token = signToken({ id: user._id, username: user.username, color: user.color });
  res.setHeader("Set-Cookie", cookie.serialize("token", token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 }));
  return res.status(200).json({ username: user.username, bio: user.bio, color: user.color });
}
