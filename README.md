# ⚡ ZapChat — Real-Time Chat Application

<p align="center">
  <img src="https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge&logo=mongodb" alt="MERN Stack" />
  <img src="https://img.shields.io/badge/WebSockets-Socket.io-black?style=for-the-badge&logo=socketdotio" alt="Socket.io" />
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwindcss" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Security-Arcjet-purple?style=for-the-badge" alt="Arcjet" />
</p>

ZapChat is a full-stack, real-time messaging platform built on the MERN stack (`MongoDB`, `Express`, `React`, `Node.js`) and `Socket.IO`. It delivers an ultra-smooth, instant messaging experience packed with modern features like voice notes, live typing indicators, read receipts, emoji reactions, quoted message replies, and custom sound effects wrapped in a dark glassmorphism UI.

---

## ✨ Features

- 💬 **Real-Time Messaging**: Instant bidirectional communication powered by Socket.IO.
- 🎙️ **Voice Notes**: Built-in audio recorder for sending voice notes stored seamlessly via Cloudinary raw media.
- ⚡ **Live Typing Indicators**: Real-time bouncing dot indicators when chat partners are typing.
- ✔️ **WhatsApp-Style Read Receipts**: Live status tracking (`sent` ✓, `delivered` ✓✓, `read` ✓✓ in cyan).
- 😄 **Emoji Reactions**: Hover over any message to react with preset emojis (👍, ❤️, 😂, 😮, 😢, 🔥).
- 💬 **Quoted Message Replies**: Reply directly to specific messages with interactive click-to-scroll previews.
- 🖼️ **Smart Image Uploads**: Client-side canvas compression for high-res photos before uploading to Cloudinary.
- 🔊 **Custom Sound Effects**: Keystroke sound feedback, toggle sounds, and incoming message notifications.
- 🛡️ **Arcjet Security**: Integrated shield protection, bot detection, and rate limiting (100 req/60s).
- 📧 **Transactional Emails**: Automatic welcome email delivery via Resend upon user registration.
- 🎨 **Glassmorphism Dark UI**: Cyberpunk-inspired dark theme with animated conic-gradient borders built with TailwindCSS and DaisyUI.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.2 + Vite 7.3
- **State Management**: Zustand 5.0
- **Routing**: React Router 7.13
- **Styling**: TailwindCSS 3.4 + DaisyUI 4.12
- **Real-Time Client**: Socket.IO Client 4.8
- **Icons & Toast**: Lucide React + React Hot Toast

### Backend
- **Runtime**: Node.js (≥20.0) + Express 4.21
- **Real-Time Server**: Socket.IO 4.8
- **Database**: MongoDB (Mongoose 8.10)
- **Authentication**: JWT (HTTP-Only Cookie) + bcryptjs
- **Media Storage**: Cloudinary v2
- **Email Service**: Resend API
- **Security**: Arcjet Node SDK

---

## 🚀 Quick Start

### Prerequisites
- Node.js (>= 20.0)
- MongoDB Connection URI (Atlas or Local)
- Cloudinary Account
- Resend API Key

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/GiTerminator333/ZapChat.git
   cd ZapChat
   ```

2. **Install dependencies**:
   ```bash
   # Install root, backend, and frontend dependencies
   npm run build
   ```
3. **Run Development Mode**:
   Launch backend and frontend dev servers in separate terminals:

   ```bash
   # Terminal 1 — Backend (Port 3000)
   npm run dev --prefix backend

   # Terminal 2 — Frontend (Port 5173)
   npm run dev --prefix frontend
   ```

---

## 🌐 Production Deployment (Render)

ZapChat is configured for single-command production builds.

1. **Build Command**:
   ```bash
   npm run build
   ```
2. **Start Command**:
   ```bash
   npm start
   ```
3. Set `NODE_ENV=production` in your hosting dashboard environment variables. Express will automatically serve the built static frontend assets and handle SPA routing fallback.

---

## 📄 License

Distributed under the ISC License. See `LICENSE` for more information.
