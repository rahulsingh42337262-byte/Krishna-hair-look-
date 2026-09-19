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


## Admin Login Setup
1. In Supabase Dashboard, enable Authentication > Providers > Email.
2. Create an admin user under Authentication > Users (email + password).
3. Put the public Supabase URL and anon key in config.js.
4. Open admin-login.html to log in. admin.html redirects to login when not authenticated.
5. Never put a Supabase service-role key in config.js or the browser.


## Final package contents
- Logo: `assets/logo.jpg`
- Owner/team photos: `assets/owner-1.jpg`, `assets/owner-2.jpg`
- Shop photo: `assets/shop.jpg`
- UPI QR: `assets/upi-qr.png`
- Customer flow: service → date/time → UPI/QR payment → payment confirmation checkbox → final booking → printable booking slip
- Admin flow: `admin-login.html` → Supabase Auth → `admin.html`

### Important
The admin password is NOT hard-coded into the website ZIP. Create the admin user in Supabase Authentication and type your password there. Do not put service-role keys or passwords into browser files.

The UPI QR is generated for the UPI ID configured for this project. Automatic payment verification is not implemented by a plain UPI deep-link/QR; for verified payments, connect Razorpay or another payment gateway.
