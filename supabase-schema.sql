-- Krishna Hair Look booking database
create extension if not exists pgcrypto;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  mobile text not null,
  service text not null check (service in ('Shaving','Haircut','Hair Colour')),
  booking_date date not null,
  time text not null,
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed')),
  status text not null default 'confirmed' check (status in ('pending','confirmed','cancelled')),
  created_at timestamptz not null default now()
);

-- This is the key protection against double booking:
-- only ONE active booking can occupy a date + time.
create unique index if not exists one_active_booking_per_slot
on public.bookings (booking_date, time)
where status in ('pending','confirmed');

alter table public.bookings enable row level security;

-- Public website needs to read booked times and insert bookings.
create policy "public can read active bookings"
on public.bookings for select
to anon
using (status in ('pending','confirmed'));

create policy "public can create bookings"
on public.bookings for insert
to anon
with check (status='confirmed' and payment_status='pending');

-- IMPORTANT: For a real production admin panel, replace public admin access
-- with Supabase Auth + an admin role. Do not expose a service-role key in browser.
