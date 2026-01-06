-- Enable UUID generation
create extension if not exists "pgcrypto";

-- =========================
-- slots table
-- =========================
create table if not exists public.slots (
  id uuid primary key default gen_random_uuid(),
  start_time timestamptz not null,
  end_time timestamptz not null,
  capacity int not null default 1,

  -- sanity check
  constraint slots_time_check
    check (end_time > start_time)
);

-- =========================
-- bookings table
-- =========================
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),

  slot_id uuid not null,
  name text not null,
  email text not null,

  created_at timestamptz not null default now(),

  constraint bookings_slot_fk
    foreign key (slot_id)
    references public.slots(id)
    on delete cascade
);

-- =========================
-- Indexes (important for performance)
-- =========================
create index if not exists idx_bookings_slot_id
  on public.bookings(slot_id);

create index if not exists idx_slots_start_time
  on public.slots(start_time);

-- =========================
-- authorized_users table
-- =========================
create table if not exists public.authorized_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text not null check (role in ('participant', 'admin')),
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.authorized_users enable row level security;

-- Allow public read access for the auth check
create policy "Public read for auth check"
  on public.authorized_users
  for select
  to anon
  using (true);

-- =========================
-- RLS Policies for Slots/Bookings
-- =========================

-- Enable RLS
alter table public.slots enable row level security;
alter table public.bookings enable row level security;

-- Allow everyone to read slots
create policy "Allow public read access to slots"
  on public.slots
  for select
  to public
  using (true);

-- Allow everyone to read bookings (needed for slot availability join)
create policy "Allow public read access to bookings"
  on public.bookings
  for select
  to public
  using (true);

-- Allow authenticated users to create bookings
create policy "Allow auth users to book"
  on public.bookings
  for insert
  to authenticated
  with check (true);
