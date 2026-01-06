# Bookingly

A modern, real-time scheduling platform designed for simplicity and visual harmony. Bookingly allows users to book predefined time slots instantly, while providing administrators with powerful tools to manage attendance and staffing.

## Core Features

- **Real-Time Dashboards**: All booking statuses and admin updates sync instantly across all clients.
- **Flexible Slot Capacity**: Support for both one-to-one sessions and multi-person group slots.
- **Admin Management Panel**: Dedicated interface for monitoring live statistics and participant details.
- **Admin Staffing (Attendance)**: Administrators can assign themselves or colleagues to specific slots for better coordination.
- **Secure Authentication**: Passwordless magic-link sign-in via email.
- **Access Control**: Built-in support for restricted access via email whitelisting.
- **Mobile-First Design**: Fully responsive across all devices with a premium, glassmorphism-inspired aesthetic.
- **Zero-Bypass Security**: All business rules (capacity, authorization) are enforced at the database level using Row Level Security (RLS).

## Tech Stack

- **Frontend**: React (Vite) + TypeScript
- **Styling**: Vanilla CSS + Tailwind CSS (Utility classes)
- **Backend/Database**: Supabase (PostgreSQL + Realtime + GoTrue Auth)
- **State/Logic**: Custom React hooks for data fetching and real-time synchronization.

## Project Structure

```text
supabase/       # Database migrations, RLS policies, and schema
public/         # Static assets including branding logos
src/
  components/   # Reusable UI elements (Models, Cards, Loaders)
  hooks/        # Specialized logic for auth, bookings, and admin data
  lib/          # Third-party service configurations (Supabase)
  pages/        # Main application views (Login, Dashboard, Admin)
  types/        # TypeScript interfaces for slots and bookings
```

## Use Cases

- **Office Hours**: Managing professor or mentor availability.
- **Interview Scheduling**: Coordinated hiring sessions with multiple interviewers.
- **Workshop Signups**: Booking slots for limited-capacity group sessions.
- **Internal Tools**: Coordinating team check-ins or shared resource usage.

## Setup & Deployment

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/bookingly.git
   ```

2. **Environment Variables**:
   Create a `.env` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Database Setup**:
   Run the SQL migrations provided in `supabase/schema.sql` within your Supabase SQL Editor.

4. **Install and Run**:
   ```bash
   npm install
   npm run dev
   ```

## License

MIT
