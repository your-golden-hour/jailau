# Supabase setup for Jailau

Updated 2026-10-26. The selected project is `ubjcvqqxkgshguiwikqu`.
The original `supabase/schema.sql` is already installed; do not run it again.
Migration `supabase/migrations/202610260001_email_profile_capacity.sql` was applied
through the connected Supabase project. Do not reapply it.
Migration `supabase/migrations/202610260002_driver_lines_and_offers.sql` is
prepared but **not yet applied**: the connected tool's automatic approval
review reached its usage limit. The local code needs this migration before
the new driver line and two-sided offer screens can function. To apply it
manually, open Supabase → SQL Editor → New query, paste the complete contents
of that exact file, run it once, and check for a success message. Do not run
`schema.sql` again. No secret or service-role key is needed in chat. If an
error appears, stop and share only its error text (not credentials).

## Authentication

- Registration asks only for an email and calls Supabase `signInWithOtp` to send
  a one-time Magic Link. After the link creates a verified session, Profile
  completion asks for a password (8+ characters), name, phone, and role. Returning
  users sign in with email/password. Passwords stay in Supabase Auth.
- Google OAuth is coded in the browser, but its Supabase provider is **disabled**.
  Only the project owner can configure a Google Cloud OAuth consent screen and web
  client, enter its client ID/secret directly in the Supabase dashboard, and enable
  the provider. Do not share the Google secret, database password, or service-role
  key in chat or GitHub.
- Authentication → URL Configuration currently has Site URL
  `http://localhost:3000` and no additional Redirect URLs. For local testing,
  serve on port 3000 and open **`http://localhost:3000/`**, not `127.0.0.1`.
  Before any approved production deployment, allow the exact `.pages.dev` URL
  for email and OAuth redirects. Keep the allowlist narrow.
- Phone Auth is not used. The user enters a contact number after email/Google
  login, confirms its spelling in the UI, and can edit it in Profile. The unique
  `users.phone` constraint prevents duplicate numbers; it does **not** prove
  ownership. There is no SMS and no phone-based password recovery.
- A fresh authenticated account without a `public.users` row is routed to
  Profile completion. Driver registration requires a zone, vehicle, plate, and
  seat count. Admin approval is still required before taking requests.

## Data and security

- All seven application tables have RLS. `jailau_private` must stay outside
  exposed schemas. Normal ride mutations call database RPCs; the browser must
  never update `requests.status` or trip counters directly.
- The offer RPC locks the driver row, then the request row, and counts seats
  for overlapping two-hour windows. Later scheduled rides can be offered.
  Two hours is a pilot assumption, not verified journey duration.
- After migration 002, driver village/city lines are effective for 30 minutes.
  Passenger consent is required after a driver offers a ride; contacts open
  only after consent. District changes require fresh admin approval.
- Only the passenger can confirm completion, at least one hour after acceptance
  or the scheduled start, whichever is later. The database increments the driver
  counter exactly once.
- Phones become visible to the matched passenger and driver only after the
  passenger accepts the driver's offer.
- Security Advisor warns about exposed `SECURITY DEFINER` RPCs. Those ten RPCs are
  intentional and implement explicit authorization. Review each when changing it:
  https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable
- The project has test users, one verified zone/village, and test requests.
  Preserve existing accepted rides when applying migration 002. Do not import
  mock places: verify real geography before entering more pilot data.

## Owner actions before real-user pilot

1. Run the site at `http://localhost:3000/` so email confirmation returns to it.
2. Register a test email account using only the email field, follow the link,
   create a password, and enter a contact number. Check that Profile displays
   the number and can change it.
3. Create verified zones/villages through an admin account. Promote only your
   own already-created `public.users` row to admin in SQL Editor by its UUID.
4. Configure Google OAuth only if you want it now; no purchase is needed to
   keep email login. Google Cloud setup and Supabase provider credentials are
   account-owner actions.
5. Test both route directions, driver approval, concurrent acceptance, seat
   limits, and the one-hour confirmation boundary with disposable test users.
6. Obtain legal/privacy advice before using real people's data. Do not publish
   until the owner explicitly approves the reviewed `release` version.

For a **new empty** Supabase project, run `supabase/schema.sql` once, then the
numbered migrations in order before use. Then set
up Auth and verified location data. Never run the initial schema in an existing
project. The only browser key is the public publishable key in `js/config.js`.
