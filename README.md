# Bookingly

A lightweight, serverless scheduling tool for booking **one-to-one time slots**.
Designed for speed, correctness, and minimal configuration.

---

## Features

* Predefined time slots
* One booking per slot (database-enforced)
* Email-based authentication
* Optional access restriction (domain or whitelist)
* Reschedule and cancel bookings
* Calendar invite (.ics) on booking
* Static frontend, serverless backend

---

## Non-Goals

* Calendar availability syncing
* OAuth providers
* Recurring events
* Complex scheduling rules
* Custom backend servers

This project focuses on **simple, deterministic scheduling**.

---

## Tech Stack

**Frontend**

* React (Vite)
* TypeScript
* Tailwind CSS

**Backend**

* Supabase (Postgres + Auth + RLS)

No custom APIs or servers required.

---

## Architecture

```
Slots → Database
Users → Auth
Bookings → DB constraints
Invites → .ics email
```

All booking rules are enforced at the database level.

---

## Data Model

* `slots` — available time windows
* `bookings` — confirmed reservations

  * `UNIQUE(slot_id)` prevents double booking
* `qualified_emails` (optional) — restrict access

---

## Security

* Authentication via email
* Authorization enforced using Row Level Security (RLS)
* No frontend-only validation for critical rules

---

## Performance

* Static frontend (CDN-served)
* Direct database access
* Single request per booking
* No cold starts

---

## Project Structure

```
supabase/   # schema, RLS, seed data
src/
  components/
  hooks/
  lib/
  types/
```

---

## Use Cases

* Interview scheduling
* Mentorship sessions
* Office hours
* Club or community bookings
* Internal team scheduling

---

## License

MIT
