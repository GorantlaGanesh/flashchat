import { useState, useEffect, useRef } from "react";
import Pusher from "pusher-js";

const ROOMS = ["general", "tech", "random", "gaming", "music"];
const COLORS = ["#ff6b6b","#ffd93d","#6bcb77","#4d96ff","#ff922b","#cc5de8","#20c997","#f06595"];

/* ── Avatar ── */
function Avatar({ name, color, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color || "#4d96ff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 800, fontSize: size * 0.4, color: "#fff",
      flexShrink: 0, textTransform: "uppercase", userSelect: "none",
    }}>
      {(name || "?")[0]}
    </div>
  );
}

/* ── Auth Screen ── */
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", password: "", bio: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error);
    onAuth(data);
  };

  const s = {
    wrap: { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0e0e10" },
    card: { background:"#18181b", border:"1px solid #2a2a2e", borderRadius:20, padding:"48px 40px", width:"100%", maxWidth:400, textAlign:"center" },
    tab: (active) => ({ flex:1, padding:"8px 0", borderRadius:8, border:"none", cursor:"pointer", fontWeight:700, fontSize:13, background: active ? "#4d96ff" : "transparent", color: active ? "#fff" : "#71717a", transition:"all 0.2s" }),
    input: { background:"#09090b", border:"1px solid #27272a", borderRadius:10, color:"#fff", fontSize:14, padding:"12px 14px", outline:"none", width:"100%" },
    btn: (disabled) => ({ background:"#4d96ff", border:"none", borderRadius:10, color:"#fff", fontWeight:700, fontSize:15, padding:14, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, width:"100%" }),
  };

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={{ fontSize:44, marginBottom:10 }}>💬</div>
        <h1 style={{ color:"#fff", fontSize:28, fontWeight:800, marginBottom:6, letterSpacing:"-1px" }}>FlashChat</h1>
        <p style={{ color:"#71717a", fontSize:13, marginBottom:28 }}>Real-time chat · Private DMs · Group rooms</p>

        <div style={{ display:"flex", background:"#09090b", borderRadius:10, padding:4, marginBottom:22 }}>
          <button style={s.tab(mode==="login")} onClick={() => { setMode("login"); setError(""); }}>Sign In</button>
          <button style={s.tab(mode==="register")} onClick={() => { setMode("register"); setError(""); }}>Register</button>
        </div>

        <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <input style={s.input} placeholder="Username" value={form.username} onChange={e => setForm({...form, username:e.target.value})} autoFocus />
          <input style={s.input} placeholder="Password (min 6 chars)" type="password" value={form.password} onChange={e => setForm({...form, password:e.target.value})} />
          {mode === "register" && (
            <input style={s.input} placeholder="Bio (optional)" value={form.bio} onChange={e => setForm({...form, bio:e.target.value})} />
          )}
          {error && <p style={{ color:"#ff6b6b", fontSize:13, textAlign:"left" }}>{error}</p>}
          <button type="submit" style={s.btn(loading || !form.username || !form.password)} disabled={loading || !form.username || !form.password}>
            {loading ? "Loading..." : mode === "login" ? "Sign In →" : "Create Account →"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Profile Modal ── */
function ProfileModal({ user, onClose, onUpdate, onLogout }) {
  const [bio, setBio] = useState(user.bio || "");
  const [color, setColor] = useState(user.color || "#4d96ff");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/auth/update-profile", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio, color }),
    });
    const data = await res.json();
    setSaving(false);
    onUpdate({ ...user, bio: data.bio, color: data.color });
    onClose();
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 }}>
      <div style={{ background:"#18181b", border:"1px solid #2a2a2e", borderRadius:20, padding:36, width:"100%", maxWidth:380 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <h2 style={{ color:"#fff", fontSize:18, fontWeight:800 }}>Edit Profile</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#71717a", cursor:"pointer", fontSize:22 }}>✕</button>
        </div>

        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, marginBottom:24 }}>
          <Avatar name={user.username} color={color} size={80} />
          <p style={{ color:"#fff", fontWeight:700, fontSize:16 }}>@{user.username}</p>
          {user.bio && <p style={{ color:"#71717a", fontSize:13, textAlign:"center" }}>{user.bio}</p>}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={{ color:"#a1a1aa", fontSize:11, fontWeight:700, letterSpacing:"0.5px", display:"block", marginBottom:6 }}>BIO</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={120} rows={3}
              placeholder="Tell people about yourself..."
              style={{ background:"#09090b", border:"1px solid #27272a", borderRadius:10, color:"#fff", fontSize:14, padding:"10px 14px", outline:"none", resize:"none", width:"100%" }} />
          </div>
          <div>
            <label style={{ color:"#a1a1aa", fontSize:11, fontWeight:700, letterSpacing:"0.5px", display:"block", marginBottom:8 }}>AVATAR COLOR</label>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  style={{ width:30, height:30, borderRadius:"50%", background:c, border: color===c ? "3px solid #fff" : "3px solid transparent", cursor:"pointer", transition:"border 0.15s" }} />
              ))}
            </div>
          </div>
          <button onClick={save} disabled={saving}
            style={{ background:"#4d96ff", border:"none", borderRadius:10, color:"#fff", fontWeight:700, fontSize:14, padding:12, cursor:"pointer", opacity:saving?0.6:1 }}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
          <button onClick={onLogout}
            style={{ background:"#27272a", border:"none", borderRadius:10, color:"#ff6b6b", fontWeight:600, fontSize:14, padding:12, cursor:"pointer" }}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main App ── */
export default function App() {
  const [user, setUser]           = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab]             = useState("rooms");   // rooms | dms
  const [activeRoom, setActiveRoom] = useState("general");
  const [activeDM, setActiveDM]   = useState(null);
  const [messages, setMessages]   = useState([]);
  const [users, setUsers]         = useState([]);
  const [input, setInput]         = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef  = useRef(null);
  const pusherRef  = useRef(null);
  const inputRef   = useRef(null);

  /* Check session */
  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setUser(data); setAuthLoading(false); });
  }, []);

  /* Load user list for DMs */
  useEffect(() => {
    if (!user) return;
    fetch("/api/chat/users").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setUsers(data);
    });
  }, [user]);

  /* Subscribe to Pusher + load history whenever chat target changes */
  useEffect(() => {
    if (!user) return;
    const isDM   = tab === "dms";
    const target = isDM ? activeDM : activeRoom;
    if (!target) return;

    setMessages([]);

    fetch(`/api/chat/messages?to=${target}&isDM=${isDM}`)
      .then(r => r.json()).then(data => { if (Array.isArray(data)) setMessages(data); });

    if (pusherRef.current) pusherRef.current.disconnect();
    pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });
    const channel = isDM
      ? `dm-${[user.username, target].sort().join("-")}`
      : `chat-${target}`;
    const ch = pusherRef.current.subscribe(channel);
    ch.bind("new-message", msg => setMessages(prev => [...prev, msg]));

    return () => { pusherRef.current?.disconnect(); };
  }, [user, tab, activeRoom, activeDM]);

  /* Scroll to bottom */
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const isDM = tab === "dms";
    const to   = isDM ? activeDM : activeRoom;
    if (!to) return;
    await fetch("/api/chat/send", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, message: input.trim(), isDM }),
    });
    setInput("");
    inputRef.current?.focus();
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null); setShowProfile(false);
  };

  const formatTime = d => new Date(d).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });

  const selectRoom = (r) => { setActiveRoom(r); setTab("rooms"); setSidebarOpen(false); };
  const selectDM   = (u) => { setActiveDM(u.username); setTab("dms"); setSidebarOpen(false); };

  const chatLabel = tab === "dms" ? `@${activeDM}` : `#${activeRoom}`;
  const chatTarget = tab === "dms" ? activeDM : activeRoom;

  if (authLoading) return (
    <div style={{ minHeight:"100vh", background:"#0e0e10", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
      Loading...
    </div>
  );

  if (!user) return <AuthScreen onAuth={setUser} />;

  /* ── Sidebar content ── */
  const SidebarContent = () => (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      {/* Logo */}
      <div style={{ padding:"18px 16px 14px", borderBottom:"1px solid #1f1f23", fontSize:16, fontWeight:800, color:"#fff" }}>
        💬 FlashChat
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", padding:"10px 10px 4px", gap:4 }}>
        {[["rooms","🏠 Rooms"],["dms","💌 DMs"]].map(([t,label]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex:1, padding:"7px 0", borderRadius:8, border:"none", cursor:"pointer", fontWeight:700, fontSize:12,
              background: tab===t ? "#1d3a6e" : "transparent", color: tab===t ? "#fff" : "#71717a" }}>
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ flex:1, overflowY:"auto", padding:"4px 8px" }}>
        {tab === "rooms" ? (
          <>
            <p style={{ fontSize:11, fontWeight:700, color:"#52525b", letterSpacing:"0.8px", padding:"10px 6px 6px" }}>CHANNELS</p>
            {ROOMS.map(r => (
              <button key={r} onClick={() => selectRoom(r)}
                style={{ width:"100%", textAlign:"left", background: activeRoom===r && tab==="rooms" ? "#1d3a6e" : "none",
                  border:"none", borderRadius:8, color: activeRoom===r && tab==="rooms" ? "#fff" : "#71717a",
                  cursor:"pointer", fontSize:14, padding:"9px 10px", transition:"all 0.15s",
                  fontWeight: activeRoom===r && tab==="rooms" ? 700 : 400 }}>
                # {r}
              </button>
            ))}
          </>
        ) : (
          <>
            <p style={{ fontSize:11, fontWeight:700, color:"#52525b", letterSpacing:"0.8px", padding:"10px 6px 6px" }}>DIRECT MESSAGES</p>
            {users.length === 0 && (
              <p style={{ color:"#52525b", fontSize:13, padding:"8px 10px" }}>No other users yet</p>
            )}
            {users.map(u => (
              <button key={u.username} onClick={() => selectDM(u)}
                style={{ width:"100%", textAlign:"left", background: activeDM===u.username && tab==="dms" ? "#1d3a6e" : "none",
                  border:"none", borderRadius:8, cursor:"pointer", padding:"8px 10px", transition:"all 0.15s",
                  display:"flex", alignItems:"center", gap:10 }}>
                <Avatar name={u.username} color={u.color} size={28} />
                <div style={{ textAlign:"left", overflow:"hidden" }}>
                  <p style={{ color: activeDM===u.username && tab==="dms" ? "#fff" : "#d4d4d8", fontSize:13, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                    {u.username}
                  </p>
                  {u.bio && <p style={{ color:"#52525b", fontSize:11, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{u.bio}</p>}
                </div>
              </button>
            ))}
          </>
        )}
      </div>

      {/* Profile footer */}
      <div style={{ borderTop:"1px solid #1f1f23", padding:"12px 12px" }}>
        <button onClick={() => setShowProfile(true)}
          style={{ width:"100%", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:10, padding:"6px 4px", borderRadius:8 }}>
          <Avatar name={user.username} color={user.color} size={32} />
          <div style={{ textAlign:"left", flex:1, overflow:"hidden" }}>
            <p style={{ color:"#fff", fontSize:13, fontWeight:700, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.username}</p>
            {user.bio && <p style={{ color:"#71717a", fontSize:11, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.bio}</p>}
          </div>
          <span style={{ color:"#71717a", fontSize:12 }}>✎</span>
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", height:"100vh", background:"#0e0e10", color:"#fff", position:"relative" }}>
      {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} onUpdate={setUser} onLogout={logout} />}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:40, display:"none" }}
          className="mobile-overlay" />
      )}

      {/* Sidebar desktop */}
      <aside style={{ width:230, background:"#111113", borderRight:"1px solid #1f1f23", flexShrink:0, display:"flex", flexDirection:"column" }}
        className="sidebar-desktop">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile drawer */}
      {sidebarOpen && (
        <aside style={{ position:"fixed", left:0, top:0, bottom:0, width:260, background:"#111113", borderRight:"1px solid #1f1f23", zIndex:50, display:"flex", flexDirection:"column" }}>
          <SidebarContent />
        </aside>
      )}

      {/* Main */}
      <main style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>
        {/* Header */}
        <header style={{ background:"#111113", borderBottom:"1px solid #1f1f23", padding:"12px 20px", display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
          <button onClick={() => setSidebarOpen(s => !s)}
            style={{ background:"none", border:"none", color:"#71717a", cursor:"pointer", fontSize:18, padding:4, display:"none" }}
            className="menu-btn">☰</button>
          <div style={{ flex:1 }}>
            <span style={{ fontWeight:800, fontSize:16 }}>{chatLabel}</span>
          </div>
          <button onClick={() => { fetch("/api/chat/users").then(r=>r.json()).then(d=>{if(Array.isArray(d))setUsers(d);}); }}
            style={{ background:"none", border:"none", color:"#71717a", cursor:"pointer", fontSize:13 }}>↻ refresh</button>
        </header>

        {/* Messages */}
        <div style={{ flex:1, overflowY:"auto", padding:"20px 20px 8px", display:"flex", flexDirection:"column", gap:2 }}>
          {!chatTarget ? (
            <div style={{ margin:"auto", textAlign:"center", color:"#52525b" }}>
              <p style={{ fontSize:32, marginBottom:10 }}>{tab==="dms" ? "💌" : "💬"}</p>
              <p style={{ fontSize:14 }}>{tab==="dms" ? "Select a user from the sidebar to start a DM" : "Select a room to start chatting"}</p>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ margin:"auto", textAlign:"center", color:"#52525b" }}>
              <p style={{ fontSize:32, marginBottom:10 }}>👋</p>
              <p style={{ fontSize:14 }}>No messages yet — say hello!</p>
            </div>
          ) : null}

          {messages.map((msg, i) => {
            const isMe = msg.from === user.username;
            const showName = !isMe && (i === 0 || messages[i-1].from !== msg.from);
            return (
              <div key={msg.id || i} style={{ display:"flex", flexDirection:"column", alignItems: isMe ? "flex-end" : "flex-start", maxWidth:"72%", alignSelf: isMe ? "flex-end" : "flex-start", marginBottom:2 }}>
                {showName && (
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3, paddingLeft:4 }}>
                    <Avatar name={msg.from} color={msg.color} size={18} />
                    <span style={{ fontSize:12, fontWeight:700, color: msg.color || "#4d96ff" }}>{msg.from}</span>
                    <span style={{ fontSize:11, color:"#52525b" }}>{formatTime(msg.createdAt)}</span>
                  </div>
                )}
                <div style={{
                  background: isMe ? "#4d96ff" : "#1f1f23",
                  borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  padding:"10px 14px", fontSize:14, lineHeight:1.5, wordBreak:"break-word",
                  color: isMe ? "#fff" : "#e4e4e7",
                  display:"flex", alignItems:"flex-end", gap:8,
                }}>
                  <span>{msg.message}</span>
                  {isMe && <span style={{ fontSize:10, opacity:0.7, whiteSpace:"nowrap", flexShrink:0 }}>{formatTime(msg.createdAt)}</span>}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {chatTarget && (
          <form onSubmit={send} style={{ display:"flex", gap:10, padding:"14px 20px", borderTop:"1px solid #1f1f23", background:"#111113", flexShrink:0 }}>
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); send(e); } }}
              placeholder={`Message ${chatLabel}...`}
              style={{ flex:1, background:"#1a1a1e", border:"1px solid #27272a", borderRadius:12, color:"#fff", fontSize:14, padding:"11px 16px", outline:"none" }} />
            <button type="submit" disabled={!input.trim()}
              style={{ background:"#4d96ff", border:"none", borderRadius:12, color:"#fff", fontWeight:800, fontSize:18, width:44, cursor:"pointer", opacity: input.trim() ? 1 : 0.35, transition:"opacity 0.15s" }}>
              ↑
            </button>
          </form>
        )}
      </main>

      <style>{`
        @media (max-width: 640px) {
          .sidebar-desktop { display: none !important; }
          .menu-btn { display: flex !important; }
          .mobile-overlay { display: block !important; }
        }
      `}</style>
    </div>
  );
}
