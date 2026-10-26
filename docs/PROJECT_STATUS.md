# Project status — Jailau

Updated 2026-10-26. Codex owns development; Qwen and Qwen Coder are no longer used.
Repository: https://github.com/your-golden-hour/jailau. Current review branch:
`codex/website-rebuild`, PR #4. `release`/Cloudflare must not be changed before
the owner's explicit approval.

## Current change in progress (database applied; website not published)

- The owner applied `202610260002_driver_lines_and_offers.sql` in Supabase SQL
  Editor on 2026-10-26. Read-only live verification found `offered_at`,
  `online_location`, all six expected new/updated RPC signatures, the new
  constraints, and RLS on users, drivers, and requests. All five pre-existing
  test requests remain, including two accepted ones. `anon` has no direct
  request access or EXECUTE on the new RPCs; `authenticated` has no direct
  request UPDATE grant. A no-session RPC smoke test returned zero private rows.
- This is structural/permission verification, **not** a full live two-account
  ride test. The frontend is still a local/review build; nothing was promoted
  to `release` or published.
- New workflow: driver sends an offer; only the passenger accepts or declines.
  Contact phones remain hidden until the passenger accepts. Offered/accepted
  seats count against the same two-hour capacity window. The seat-limit error
  now explains that there is not enough room in the car.
- Driver lines have separate village and Shymkent modes. They expire after
  30 minutes, enforced on feed, acceptance, online counts and listings. A driver
  changing district is taken offline and returns to pending admin approval;
  outstanding offers are reopened, accepted rides remain assigned.
- Passenger home groups online drivers by village/city. Driver feed displays
  counts by mode. Screens use a dark steppe palette and locally bundled Manrope
  with the original illustrated city/yurt icons. The official Manrope binary
  lacks several Kazakh glyphs, so the CSS stack falls back to device Noto Sans
  or system sans for those letters; the RU/KZ browser preview rendered them.
  Full low-end Android glyph QA remains to do. No new paid service.
- Local suite: 17 tests pass after live migration, including offer
  privacy/decline, line expiry, mode filtering, seat error, district
  reapproval, and bilingual UI. The real-browser two-account flow still
  requires follow-up.

## Implemented in the review branch

- Static bilingual Russian/Kazakh website with Supabase-only browser backend.
  Demo login, fake accounts, demo banner, and mock script have been removed from
  the runtime. Public URL/publishable key are in `js/config.js`; no secret key.
- Email-only registration sends a Supabase Magic Link. After email verification,
  the user creates a password (8+ characters) and completes the profile. Returning
  users sign in with email/password. Google OAuth flow is coded but the provider
  remains disabled pending owner Google Cloud setup.
- First-login profile completion gathers name, contact phone, and passenger or
  driver role. UI confirms the phone before saving. Profile shows email/Google
  identity, permits name/phone edits and password changes, and has support/feedback
  placeholders. Contact phone is shown on passenger and driver main screens.
- Passenger home has clear village→Shymkent and Shymkent→village choices with
  original city/yurt SVG icons. The redundant eyebrow was removed. The request
  form and driver feed already handle both directions; cards simplified.
- Admin driver actions now read the matching `data-*` ID attribute before
  calling the status RPC, so approve/reject/block/unblock target the selected
  driver. The current PWA shell cache is v10, including the local font.
- Database migration `supabase/migrations/202610260001_email_profile_capacity.sql`
  applied to cloud project `ubjcvqqxkgshguiwikqu`. Phone is unique contact data,
  not Auth identity. Old phone-based `complete_profile` signature has no client
  EXECUTE grant; new email/Google-compatible signature is active.
- Driver acceptance serializes on driver/request locks and enforces total seats
  in overlapping two-hour windows. Later scheduled rides are allowed. Only the
  passenger can confirm completion, one hour after acceptance or scheduled start,
  whichever is later; completion increments the counter once.
- Seven public tables have RLS. Local PGlite test exercises roles, private phone
  reveal, zone/approval restrictions, seat limit, completion delay, and counter.
  All 17 automated tests pass. Static PWA shell avoids caching API responses.

## Decisions and limitations

- Zero budget; no SMS or paid map service. Email verification is required.
  Google login is **not operational** until owner configures OAuth in Google Cloud
  and Supabase. Do not request its secret in chat.
- Phone uniqueness does not verify ownership; users must confirm and can edit
  their number. Calls/contact are only available after request acceptance.
- Two-hour occupancy is a provisional journey window; tune against verified
  route times before wider use. The one-hour completion floor is server-enforced.
- Supabase has a test admin, an active synthetic driver and one configured
  zone/village. The database contains test requests, including accepted ones.
  Preserve these while migrating; do not import fake geography.
- Supabase Site URL is `http://localhost:3000` with no extra redirect URLs.
  A real email Magic Link/password setup walkthrough is still pending. Production URL must be
  allowlisted only after owner-approved deployment. OAuth needs owner setup.
  No site was published.
- Terms/privacy draft exists, but legal consultation is still needed before real
  passengers. License choice is still pending.

## Next checks

1. Check village/city modes, offer accept/decline, district reapproval, and
   live 30-minute expiry with disposable accounts.
2. Test two concurrent offers against live cloud, scheduling boundaries,
   completion at one hour, mobile slow-network behavior, and app installability.
3. Review PR #4, then ask owner before promoting to protected `release` and
   publishing Cloudflare Pages. Disable preview deploys for unreviewed branches.

Security Advisor currently flags 13 intentional signed-in `SECURITY DEFINER`
RPCs, which must retain explicit in-function authorization, and disabled leaked
password protection. Performance Advisor has non-blocking index/RLS policy
optimization suggestions. Review these before a real-user pilot.

See `docs/SUPABASE_SETUP.md` for setup and owner-only actions. Run
`node --test tests/*.test.cjs`, `node tests/audit.cjs`, and `git diff --check`.
