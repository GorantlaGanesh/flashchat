# 💬 FlashChat — Real-Time Chat App

A free, real-time multi-room chat app built with Next.js + Pusher. Deploy to Vercel in under 5 minutes.

---

## 🚀 Deploy in 3 Steps

### Step 1 — Get Free Pusher Credentials

1. Go to [https://pusher.com](https://pusher.com) and create a free account
2. Click **"Create App"**
3. Give it a name (e.g. `flashchat`), pick your nearest **cluster** (e.g. `ap2` for India)
4. Go to **App Keys** tab — copy these 4 values:
   - `app_id`
   - `key`
   - `secret`
   - `cluster`

---

### Step 2 — Deploy to Vercel

1. Upload this project to a GitHub repo (or use Vercel CLI)
2. Go to [https://vercel.com](https://vercel.com) → **New Project** → Import your repo
3. During setup, click **"Environment Variables"** and add:

| Variable | Value |
|---|---|
| `PUSHER_APP_ID` | your app_id |
| `PUSHER_KEY` | your key |
| `PUSHER_SECRET` | your secret |
| `PUSHER_CLUSTER` | your cluster |
| `NEXT_PUBLIC_PUSHER_KEY` | your key (same as above) |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | your cluster (same as above) |

4. Click **Deploy** — done! 🎉

---

### Step 3 — Share & Chat

- Open your Vercel URL
- Pick a username + room → start chatting!
- Share the link with friends — it's real-time!

---

## 🛠 Run Locally

```bash
npm install
cp .env.local.example .env.local
# Fill in your Pusher keys in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📦 Tech Stack

| Tool | Purpose | Free Tier |
|---|---|---|
| Next.js | Frontend + API | ✅ Always free |
| Vercel | Hosting | ✅ Free tier |
| Pusher | Real-time WebSockets | ✅ 200k msgs/day |

---

## 💡 Features

- 🏠 5 chat rooms (general, tech, random, gaming, music)
- 👤 Custom username with unique color
- 💬 Real-time messages via WebSockets
- 🌙 Dark mode UI
- 📱 Mobile responsive
# flashchat
