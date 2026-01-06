alter table bookings enable row level security;

create policy "only qualified can book" on bookings for insert 
using(
    exists(
        select 1 from qualified_emails where email = auth.email()
    )
);

create policy "user can see own booking"
on bookings
for select
using (email = auth.email());

create policy "user can delete own booking"
on bookings
for delete
using (email = auth.email());

create policy "user can update own booking"
on bookings
for update
using (email = auth.email());
