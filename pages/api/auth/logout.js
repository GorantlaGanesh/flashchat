import cookie from "cookie";
export default function handler(req, res) {
  res.setHeader("Set-Cookie", cookie.serialize("token", "", { httpOnly: true, path: "/", maxAge: 0 }));
  return res.status(200).json({ success: true });
}
