# Krishna Hair Look — Automatic Booking Website

This version is built around the flow discussed:
- Customer selects service/date/time.
- 🟢 Available slots are selectable.
- 🔴 Already-booked slots are blocked.
- A database-level unique index prevents two customers from successfully taking the same date + time, even if they submit at nearly the same moment.
- Admin panel shows bookings.
- Demo mode works in the browser with localStorage.
- Supabase SQL and Edge Function skeletons are included for the real database, WhatsApp notification, and Razorpay order flow.

## Services currently configured
- Shaving — ₹50
- Haircut — ₹70
- Hair Colour — ₹100

## UPI payment
UPI ID shown on the booking page: `gsain16@ibl`. This is a manual UPI option; automatic payment verification needs a payment gateway such as Razorpay.

## Important
The website can be tested immediately in demo mode, but demo mode is NOT a real multi-user database and does NOT send WhatsApp or collect real payments.

For the real version:
1. Create a Supabase project.
2. Run `supabase-schema.sql` in Supabase SQL Editor.
3. Copy `config.example.js` to `config.js` and add the Supabase URL + public anon key.
4. Deploy the Supabase Edge Functions and add their secrets.
5. Connect Razorpay checkout to the create-razorpay-order function and verify payment server-side before marking a booking paid.
6. Configure WhatsApp Cloud API/provider credentials for the notification function.
7. Protect `admin.html` with Supabase Auth before production. Do not use a simple browser PIN or expose service-role secrets.

## Local test
Open `index.html` in a browser. If the browser blocks local scripts, use a simple local server (for example VS Code Live Server) or deploy to GitHub Pages/Netlify/Vercel.

## Double booking behavior
If Customer A gets 3:00 PM first, Customer B sees 3:00 PM as booked. If both submit nearly simultaneously, the database unique index rejects the second insert and the website tells that customer to choose another time.
