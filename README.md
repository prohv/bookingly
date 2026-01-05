# 📅 Bookingly

**Bookingly** is a lightweight, modern, **Calendly-style booking system** designed for **short-term, controlled scheduling** with strict access rules.  
It is built to be **free**, **reliable**, and **clean**, focusing on correctness over scale.

---

## 🎯 Purpose

- Handle bookings for short-term events or sessions
- Restrict access to **college users only**
- Avoid paid scheduling tools
- Enforce strict booking rules without overengineering
- Ship a modern, professional UI quickly

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
- **Next.js (App Router)**
- **Tailwind CSS**
- Modern, responsive UI
- Subtle glassmorphism (white-only)

### Authentication
- **Supabase Auth**
- **Google OAuth**
- Domain restriction (e.g. `@college.edu`)

### Backend / Data
- **Supabase Postgres**
- Row Level Security (RLS)
- Atomic booking transactions

### Hosting
- **Vercel (free tier)**

---

## 🎨 UI / UX Guidelines

- White background only (no dark mode)
- Glassmorphism cards:
  - `bg-white/60`
  - `backdrop-blur-md`
  - soft shadows
- Bold, modern typography
- Mobile-first, fully responsive
- Clear UI states:
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
