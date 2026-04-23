# CheatChat (Real‑Time Chat App) — MERN + Socket.IO

Production-style full‑stack chat application built with **MongoDB, Express, React, Node.js** (MERN) and **Socket.IO**.  
It demonstrates **JWT authentication**, **real‑time presence**, **1:1 messaging**, **message edit/delete**, and **file/image sharing** with a clean responsive UI (light/dark).

> Repo structure: the app lives inside `CheatChat/` (`CheatChat/backend` + `CheatChat/Frontend`).

---

## Why this project is recruiter-friendly

- **Full‑stack ownership:** database schema → secure APIs → realtime sockets → polished UI.
- **Real-time engineering:** event-driven updates for presence + new/edit/delete messages.
- **Modern React:** Vite + React Router + Redux Toolkit + Tailwind CSS.
- **Security hygiene:** `.env` is ignored, examples are provided, and secrets are documented.
- **Scalable upgrade path:** notes included for moving attachments to S3/GridFS for production.

---

## Key Features

- **Auth**
  - Sign up / login with **hashed passwords (bcrypt)** and **JWT**.
  - Auth middleware protecting user/message routes.
- **Chat**
  - Create conversations on first message and persist messages in MongoDB.
  - Fetch chat history between two users.
  - **Edit message** (sender-only) with “Edited” state.
  - **Delete message** (sender-only) using **soft-delete** (keeps timeline intact).
- **Real-time (Socket.IO)**
  - Online users presence list broadcast to clients.
  - Realtime message delivery + realtime updates for edit/delete.
- **File / Image sharing**
  - Attach up to **5 files** (each up to **4MB**) per message.
  - Images preview inline; other files download via link.
- **Responsive UI**
  - Mobile-first layout: on small screens it switches between **Users** and **Chat** view.
  - Light/Dark mode toggle.

---

## Tech Stack (MERN)

- **Frontend:** React, Vite, React Router, Redux Toolkit, Axios, Tailwind CSS, Socket.IO Client
- **Backend:** Node.js, Express, Socket.IO, Mongoose, JWT, bcrypt, CORS, dotenv
- **Database:** MongoDB (Mongoose models: `User`, `Conversation`, `Message`)

---

## Architecture (high level)

```
React (Vite)  ── Axios ──>  Express REST API  ──> MongoDB (Mongoose)
     │
     └──── Socket.IO (presence + new/edit/delete message events) ────┘
```

---

## API Endpoints

Base URL: `http://localhost:4000/api/v1`

### Auth

- `POST /signup`
- `POST /login`
- `GET /getAllUsers` (JWT required)

### Messages

- `POST /send-message` (JWT required)  
  Body: `{ receiverId, message, attachments? }`
- `GET /get-all-messages/:chatUserId` (JWT required)
- `PATCH /edit-message/:messageId` (JWT required, sender-only)  
  Body: `{ message }`
- `DELETE /delete-message/:messageId` (JWT required, sender-only)

---

## Socket.IO Events

- Server → client:
  - `send-all-online-users` → array of online userIds
  - `new-message` → message payload
  - `message-updated` → updated message payload
  - `message-deleted` → deleted message payload (soft-delete)

Client connects with: `?userId=<currentUserId>`

---

## Local Setup (Windows/macOS/Linux)

### 1) Backend

1. `cd CheatChat/backend`
2. Copy env: `copy .env.example .env` (Windows) / `cp .env.example .env` (macOS/Linux)
3. Update `MONGODB_URI` + `JWT_SECRET`
4. Install + run:
   - `npm install`
   - `npm run dev` (or `npm start`)

Backend runs on: `http://localhost:4000`

### 2) Frontend

1. `cd CheatChat/Frontend`
2. Copy env: `copy .env.example .env` / `cp .env.example .env`
3. Install + run:
   - `npm install`
   - `npm run dev`

Frontend runs on: `http://localhost:5173`

---

## Security Notes (important)

- Never commit secrets. This repo ignores `.env` and keeps only `.env.example`.
- If you *ever* committed a real MongoDB URI/JWT secret:
  1) **Rotate** credentials immediately  
  2) Remove tracked env: `git rm --cached CheatChat/backend/.env`  
  3) Consider rewriting history (e.g., BFG / git filter-repo) if the repo is public.

---

## What I’d ship next (production upgrades)

- Store attachments in **S3 / Cloudinary / GridFS** and save only URLs in MongoDB.
- Add pagination + infinite scroll for messages.
- Add typing indicators + read receipts.
- Add tests (Jest + Supertest) and CI.

---

## Resume bullets (copy/paste)

- Built a **real‑time MERN chat application** with **JWT auth**, **Socket.IO presence**, and **1:1 messaging** using **React, Redux Toolkit, Express, and MongoDB**.
- Designed **Mongoose schemas** for users, conversations, and messages; implemented protected REST APIs with robust validation and error handling.
- Implemented realtime features: **online user tracking**, **message delivery**, and realtime **edit/delete** updates with Socket.IO.
- Added **file/image sharing**, message soft-delete, and a responsive, mobile-first UI with Tailwind CSS.

---

## Keywords / Hashtags (ATS / recruiter search)

**Keywords:** MERN Stack, Full Stack Developer, JavaScript, TypeScript (basics), React, Redux Toolkit, Node.js, Express.js, MongoDB, Mongoose, Socket.IO, REST API, JWT Authentication, bcrypt, CORS, Vite, Tailwind CSS, Responsive UI, Real-time Web App, WebSockets, CRUD, MVC, Deployment, Git, GitHub.

**Hashtags:**  
#FullStackDeveloper #MERNStack #MERN #ReactJS #ReduxToolkit #NodeJS #ExpressJS #MongoDB #Mongoose #SocketIO #WebSockets #RESTAPI #JWT #Authentication #TailwindCSS #Vite #JavaScript #FrontendDeveloper #BackendDeveloper #SoftwareEngineer #WebDeveloper #OpenToWork #Hiring #ImmediateJoiner #Remote #Internship #EntryLevel

---

Contact
For any inquiries, feel free to reach out:

Email: krunalsawarkar2004@gmail.com
GitHub: https://github.com/krunalsawarkar18
