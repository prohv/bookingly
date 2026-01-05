# 📅 Bookingly

**Bookingly** is a lightweight, modern **booking system** built for short-term, controlled usage.  
It focuses on **correctness, simplicity, and zero-cost deployment**, not long-term scale.

Frontend is a **Vite + React SPA**, backed by **Supabase Auth & Postgres**.

---

## 🎯 Purpose

- Handle bookings for short-term events or sessions
- Restrict access to **college users only**
- Avoid paid tools like Calendly
- Ship fast with a clean, modern UI
- Keep logic simple and reliable

---

## ✅ Core Rules (Non-Negotiable)

- **Fixed time slots**
- **Max 5 users per slot**
- **College-domain–restricted access**
- **One active booking per user**
- Users can **modify / reschedule**
- **Phone number required**
- **White mode only** UI

---

## 🧱 Tech Stack

### Frontend
- **Vite + React**
- **TypeScript**
- **Tailwind CSS**
- **Lucide Icons**
- SPA (no SSR)

### Authentication
- **Supabase Auth**
- **Google OAuth**
- College domain restriction (e.g. `@college.edu`)

### Backend / Data
- **Supabase Postgres**
- Row Level Security (RLS)
- Atomic booking transactions

### Hosting
- **Vercel** (Vite preset, free tier)

---

## 🎨 UI / UX Guidelines

- White background only (no dark mode)
- Subtle glassmorphism:
  - `bg-white/60`
  - `backdrop-blur-md`
  - soft shadows
- Bold, modern typography
- Mobile-first, fully responsive
- Clear states:
  - loading
  - success
  - error
  - disabled (full slots)

---

## 🗂️ Data Model (Conceptual)

### Slots
```txt
id
start_time
capacity = 5
booked_count
