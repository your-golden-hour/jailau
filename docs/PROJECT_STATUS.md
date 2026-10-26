# Project status — Jailau

Updated 2026-10-26. Codex owns development; Qwen and Qwen Coder are no longer used.
Repository: https://github.com/your-golden-hour/jailau. Current review branch:
`codex/website-rebuild`, PR #4. `release`/Cloudflare must not be changed before
the owner's explicit approval.

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
  driver. The PWA shell cache was bumped to v8 for this update.
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
  All 14 automated tests pass. Static PWA shell avoids caching API responses.

## Decisions and limitations

- Zero budget; no SMS or paid map service. Email verification is required.
  Google login is **not operational** until owner configures OAuth in Google Cloud
  and Supabase. Do not request its secret in chat.
- Phone uniqueness does not verify ownership; users must confirm and can edit
  their number. Calls/contact are only available after request acceptance.
- Two-hour occupancy is a provisional journey window; tune against verified
  route times before wider use. The one-hour completion floor is server-enforced.
- Supabase has an admin account, one synthetic test driver awaiting approval,
  and one configured zone/village. No pilot rides or passenger accounts have
  been reported. Keep the test driver pending until explicitly approved.
- Supabase Site URL is `http://localhost:3000` with no extra redirect URLs.
  A real email Magic Link/password setup walkthrough is still pending. Production URL must be
  allowlisted only after owner-approved deployment. OAuth needs owner setup.
  No site was published.
- Terms/privacy draft exists, but legal consultation is still needed before real
  passengers. License choice is still pending.

## Next checks

1. Owner serves the site at `http://localhost:3000/`, creates a disposable email
   test account, and confirms email. Verify profile flow and phone correction.
2. Verify geography and create zones/villages, then admin approval of a test driver.
3. Test two concurrent acceptances against live cloud, scheduling boundaries,
   completion at one hour, mobile slow-network behavior, and app installability.
4. Review PR #4, then ask owner before promoting to protected `release` and
   publishing Cloudflare Pages. Disable preview deploys for unreviewed branches.

See `docs/SUPABASE_SETUP.md` for setup and owner-only actions. Run
`node --test tests/*.test.cjs`, `node tests/audit.cjs`, and `git diff --check`.
