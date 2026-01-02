# 🏆 LBVC — Discord Voice Leaderboard & Stats Bot

LBVC is a **Discord voice statistics bot** designed to display **clean, modern embeds** showing server activity such as **voice usage, streams, cameras, and counters**.

The bot is built for **private usage**, with **full access restricted to SYS and bot owners only**.

---

## ✨ Features

- 📊 Voice statistics system  
- 🔢 Voice counters configuration (`/compteur`)  
- 🏆 Voice leaderboard (`/lbvc`)  
- 📡 Server voice stats (`/vc`)  
- 🔍 Find a user in voice channels (`/find`)  
- 👑 Owner management system  
- 🔒 Global slash-command restriction (SYS / Owners only)  
- 💾 Persistent JSON storage  
- 🎨 Clean & modern embed design  
- ⚡ Lightweight & stable  

---

## 🧩 Commands Overview

### `/compteur`
Configure server voice counters (up to **5 counters**).

- Clean counters list  
- No unnecessary text  
- Thousand separator support  
- Public embed (visible to the whole server)  

---

### `/lbvc`
Displays a **voice leaderboard** across servers where the bot is present.

- Active users  
- Voice time  
- Streams & cameras  
- Pagination support  

---

### `/vc`
Shows **live server statistics**:
- Members  
- Online users  
- Users in voice  
- Users in stream  
- Boost count  

---

### `/find <user>`
Find where a user is connected in voice.

- Shows the voice channel if connected  
- Displays a warning if not in voice  

---

## 👑 Owner Commands

> **SYS only**

- `/owner <user>` → Add a bot owner  
- `/unowner <user>` → Remove a bot owner  
- `/ownerlist` → Display bot owners  

---

## 🔐 Permissions & Security

- **All slash commands are restricted**
- Only:
  - SYS (defined in config)
  - Bot owners  

Unauthorized users are automatically blocked.

---

## 🗂 Project Structure

```txt
LBVC/
├── src/
│   ├── commands/
│   ├── handlers/
│   ├── services/
│   ├── storage/
│   └── utils/
├── config.js
├── index.js
├── package.json
└── README.md
```

---

## ⚙️ Requirements

- Node.js **v18+**
- discord.js **v14**
- A Discord bot application
- Recommended: **Administrator permission**

---

## 📦 Installation

```bash
npm install
```

---

## 🔧 Configuration

Edit `config.js`:

```js
module.exports = {
  TOKEN: "BOT_TOKEN",
  CLIENT_ID: "CLIENT_ID",
  GUILD_ID: "GUILD_ID",
  SYS_ID: "YOUR_DISCORD_ID"
};
```

⚠️ **Never share your bot token.**

---

## ▶️ Running the Bot

### Development
```bash
node index.js
```

### Production (recommended)
```bash
pm2 start index.js --name LBVC
```

---

## 💾 Data Storage

All data is stored locally using JSON files.

No external database required.

---

## 🎨 Branding

```
ᶜᵉᶰᵗᵉʳ ᵇᵒᵗˢ
```

---

## 📜 License

Private / internal usage only.  
Redistribution or resale without permission is prohibited.
