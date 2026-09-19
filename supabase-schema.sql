-- Krishna Hair Look production booking schema
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

create unique index if not exists one_active_booking_per_slot
on public.bookings (booking_date, time)
where status in ('pending','confirmed');

alter table public.bookings enable row level security;

-- Public customers can create bookings, but cannot read private customer data.
drop policy if exists "public can read active bookings" on public.bookings;
drop policy if exists "public can create bookings" on public.bookings;
drop policy if exists "authenticated admins can read bookings" on public.bookings;

create policy "public can create bookings"
on public.bookings for insert to anon
with check (status='confirmed' and payment_status='pending');

create policy "authenticated admins can read bookings"
on public.bookings for select to authenticated
using (true);

-- Public slot lookup returns only times, not customer names/mobile numbers.
create or replace function public.get_booked_times(p_date date)
returns table(time text)
language sql
security definer
set search_path = public
as $$
  select b.time from public.bookings b
  where b.booking_date = p_date
    and b.status in ('pending','confirmed');
$$;

grant execute on function public.get_booked_times(date) to anon, authenticated;
