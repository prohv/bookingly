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
  current_bookings int not null default 0,
  is_full boolean not null default false,

  -- sanity check
  constraint slots_time_check
    check (end_time > start_time)
);

-- =========================
-- Secure Slot Counter RPC
-- =========================

-- This function is called by the frontend to recount a slot
-- It is a 'security definer' so it can update the slots table even if the user can't
create or replace function public.sync_slot_stats(p_slot_id uuid)
returns void as $$
declare
  v_count int;
  v_capacity int;
begin
  -- 1. Get the actual booking count
  select count(*) into v_count
  from public.bookings
  where slot_id = p_slot_id;

  -- 2. Get the capacity
  select capacity into v_capacity
  from public.slots
  where id = p_slot_id;

  -- 3. Update the slot
  update public.slots
  set 
    current_bookings = v_count,
    is_full = (v_count >= v_capacity)
  where id = p_slot_id;
end;
$$ language plpgsql security definer set search_path = public;

-- ENABLE REALTIME REPLICATION
alter publication supabase_realtime add table public.slots;
alter publication supabase_realtime add table public.bookings;

-- =========================
-- bookings table
-- =========================
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),

  slot_id uuid not null,
  name text not null,
  email text not null,
  phone text not null,

  created_at timestamptz not null default now(),

  constraint bookings_slot_fk
    foreign key (slot_id)
    references public.slots(id)
    on delete cascade,

  -- Ensure a user can only have one active booking
  constraint bookings_email_unique unique (email)
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
  name text, -- New column for display names
  role text not null check (role in ('participant', 'admin')),
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.authorized_users enable row level security;

-- Allow authenticated users (Admins) to see everyone
create policy "Admins can see all authorized users"
  on public.authorized_users
  for select
  to authenticated
  using (public.is_admin());

-- Users can see their own profile
create policy "Users can see their own profile"
  on public.authorized_users
  for select
  to authenticated
  using (auth.jwt()->>'email' = email);

-- Allow everyone to see Admin names/emails (Needed for Attendance UI)
create policy "Admins are publicly visible"
  on public.authorized_users
  for select
  to public
  using (role = 'admin');

-- Keep public check for login whitelist (only for anon users to prevent authenticated crawling)
create policy "Allow email check for login"
  on public.authorized_users
  for select
  to anon
  using (true);

-- =========================
-- slot_admins table (Junction for admin Attendance)
-- =========================
create table if not exists public.slot_admins (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.slots(id) on delete cascade,
  admin_id uuid not null references public.authorized_users(id) on delete cascade,
  created_at timestamptz default now(),

  -- Ensure an admin isn't added twice to the same slot
  unique(slot_id, admin_id)
);

-- Indexes
create index if not exists idx_slot_admins_slot_id on public.slot_admins(slot_id);
create index if not exists idx_slot_admins_admin_id on public.slot_admins(admin_id);

-- Enable RLS
alter table public.slot_admins enable row level security;

-- Allow public read
create policy "Allow public read access to slot_admins"
  on public.slot_admins
  for select
  to public
  using (true);

-- Allow authenticated users (Admins) to manage assignments
create policy "Only admins can manage slot assignments"
  on public.slot_admins
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ENABLE REALTIME REPLICATION
alter publication supabase_realtime add table public.slot_admins;
alter publication supabase_realtime add table public.authorized_users;

-- =========================
-- Security Helpers
-- =========================

-- Function to check if the current user is an admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.authorized_users
    where email = auth.jwt()->>'email'
    and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- =========================
-- Anonymous View for counting
-- =========================
create or replace view public.bookings_anonymous with (security_invoker = false) as
  select id, slot_id from public.bookings;

grant select on public.bookings_anonymous to public;

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

-- Only admins can manually update slot data
create policy "Only admins can update slots"
  on public.slots
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Allow authenticated users to manage bookings
drop policy if exists "Allow public read access to bookings" on public.bookings;

create policy "Admins can see all bookings"
  on public.bookings
  for select
  to authenticated
  using (public.is_admin());

create policy "Users can see their own bookings"
  on public.bookings
  for select
  to authenticated
  using (auth.jwt()->>'email' = email);

create policy "Admins can delete any booking"
  on public.bookings
  for delete
  to authenticated
  using (public.is_admin());

create policy "Users can delete their own bookings"
  on public.bookings
  for delete
  to authenticated
  using (auth.jwt()->>'email' = email);

create policy "Users can create their own bookings"
  on public.bookings
  for insert
  to authenticated
  with check (auth.jwt()->>'email' = email);
