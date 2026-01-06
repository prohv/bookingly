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

-- Function to update slot statistics automatically
create or replace function update_slot_stats()
returns trigger as $$
begin
  update public.slots
  set 
    current_bookings = (
      select count(*)
      from public.bookings
      where public.bookings.slot_id = public.slots.id
    ),
    is_full = (
      select count(*) >= public.slots.capacity
      from public.bookings
      where public.bookings.slot_id = public.slots.id
    )
  where id = coalesce(new.slot_id, old.slot_id);
  return null;
end;
$$ language plpgsql;

-- Trigger to run after insert or delete on bookings
drop trigger if exists on_booking_change on public.bookings;
create trigger on_booking_change
after insert or delete on public.bookings
for each row execute function update_slot_stats();

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
  name text, -- New column for display names
  role text not null check (role in ('participant', 'admin')),
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.authorized_users enable row level security;

-- Allow public read access for the auth check (both anon and authenticated)
create policy "Public read for auth check"
  on public.authorized_users
  for select
  to public
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
create policy "Allow auth users to manage slot assignments"
  on public.slot_admins
  for all
  to authenticated
  using (true)
  with check (true);

-- ENABLE REALTIME REPLICATION
alter publication supabase_realtime add table public.slot_admins;
alter publication supabase_realtime add table public.authorized_users;

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
