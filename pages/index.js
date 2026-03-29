import { useState, useEffect, useRef } from "react";
import Pusher from "pusher-js";
import styles from "../styles/Chat.module.css";

export default function Home() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("general");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [joined, setJoined] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const bottomRef = useRef(null);
  const pusherRef = useRef(null);
  const channelRef = useRef(null);

  useEffect(() => {
    if (!joined) return;

    pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    channelRef.current = pusherRef.current.subscribe(`chat-${room}`);

    channelRef.current.bind("new-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    // Simulate random online count for fun
    setOnlineCount(Math.floor(Math.random() * 8) + 2);

    return () => {
      channelRef.current?.unbind_all();
      pusherRef.current?.disconnect();
    };
  }, [joined, room]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (username.trim()) setJoined(true);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    await fetch("/api/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, message, room }),
    });

    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getColor = (name) => {
    const colors = ["#ff6b6b","#ffd93d","#6bcb77","#4d96ff","#ff922b","#cc5de8","#20c997"];
    let hash = 0;
    for (let c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const ROOMS = ["general", "tech", "random", "gaming", "music"];

  if (!joined) {
    return (
      <div className={styles.landingWrap}>
        <div className={styles.landingCard}>
          <div className={styles.logo}>💬</div>
          <h1 className={styles.appTitle}>FlashChat</h1>
          <p className={styles.tagline}>Real-time. No sign-up. Just chat.</p>
          <form onSubmit={handleJoin} className={styles.joinForm}>
            <input
              className={styles.input}
              placeholder="Choose a username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              autoFocus
            />
            <div className={styles.roomGrid}>
              {ROOMS.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`${styles.roomChip} ${room === r ? styles.roomChipActive : ""}`}
                  onClick={() => setRoom(r)}
                >
                  #{r}
                </button>
              ))}
            </div>
            <button className={styles.joinBtn} type="submit" disabled={!username.trim()}>
              Join #{room} →
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.appWrap}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>💬 FlashChat</div>
        <div className={styles.sidebarSection}>ROOMS</div>
        {ROOMS.map((r) => (
          <button
            key={r}
            className={`${styles.sidebarRoom} ${room === r ? styles.sidebarRoomActive : ""}`}
            onClick={() => {
              setRoom(r);
              setMessages([]);
              setJoined(false);
              setTimeout(() => setJoined(true), 50);
            }}
          >
            <span># {r}</span>
          </button>
        ))}
        <div className={styles.sidebarBottom}>
          <div className={styles.userBadge} style={{ borderColor: getColor(username) }}>
            <span className={styles.userDot} style={{ background: getColor(username) }} />
            {username}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerRoom}># {room}</span>
            <span className={styles.headerOnline}>🟢 {onlineCount} online</span>
          </div>
        </header>

        <div className={styles.messages}>
          {messages.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🚀</div>
              <p>You're the first here! Say hello to #{room}</p>
            </div>
          )}
          {messages.map((msg, i) => {
            const isMe = msg.username === username;
            const showName = i === 0 || messages[i - 1].username !== msg.username;
            return (
              <div key={msg.id} className={`${styles.msgRow} ${isMe ? styles.msgRowMe : ""}`}>
                {!isMe && showName && (
                  <div className={styles.msgMeta}>
                    <span className={styles.msgAuthor} style={{ color: getColor(msg.username) }}>
                      {msg.username}
                    </span>
                    <span className={styles.msgTime}>{formatTime(msg.timestamp)}</span>
                  </div>
                )}
                <div className={`${styles.bubble} ${isMe ? styles.bubbleMe : styles.bubbleThem}`}>
                  {msg.message}
                  {isMe && <span className={styles.bubbleTime}>{formatTime(msg.timestamp)}</span>}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form className={styles.inputBar} onSubmit={handleSend}>
          <input
            className={styles.msgInput}
            placeholder={`Message #${room}...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button className={styles.sendBtn} type="submit" disabled={!message.trim()}>
            ↑
          </button>
        </form>
      </main>
    </div>
  );
}
