# Qwen Coder task: real Supabase browser adapter

Start from the latest remote `main`, including merged PR #2. Read `AGENTS.md`
if present, `docs/PROJECT_STATUS.md`, `docs/DATA_CONTRACT.md`,
`docs/SUPABASE_SETUP.md`, `docs/SUPABASE_LIVE_CHECK.md`, and
`supabase/schema.sql` before editing. Keep code and code comments in English.
Keep all user messages available in Russian and Kazakh.

## Outcome

Implement real Supabase support behind `window.JAILAU_API`, preserving existing
method signatures and the vanilla HTML/CSS/JS PWA. The cloud schema already
exists and its database-role checks passed. The website still uses a mock.
Prepare code for review in `main`; do not deploy, promote to `release`, modify
cloud Auth settings, or execute the initial schema again.

## Implementation requirements

1. Add an explicit backend selection (`demo` / `supabase`). Preserve the isolated
   mock for existing tests and an explicitly selected offline demo. Never fall
   back to mock data after real Auth, network, configuration, or SQL failures.
   Missing real configuration must show a translated configuration error. Keep
   the demo banner and demo shortcuts only in demo mode. Keep the default demo
   until the reviewer enables and verifies the real adapter.
2. Keep URL and public-key placeholders in tracked config. Support a publishable
   key and document compatibility if retaining `SUPABASE_ANON_KEY`. Never add
   secret/service-role keys, passwords, tokens, real user records, or dumps.
   Add no paid services, frameworks, map providers, SMS providers, or analytics.
3. Use the official Supabase JS client with an exact verified version. Prefer a
   self-hosted browser bundle with reproducible dependency/lockfile instructions;
   keep deployment static with no runtime package installation. Do not use a
   floating `@latest` CDN URL. Configure `persistSession: false`; do not store
   passwords, Auth sessions, JWTs, or contact responses in browser persistence.
4. Implement Auth phone/password signup, signin, and signout. Profile creation
   uses `complete_profile` only after Auth returns an active session. Never
   infer authorization from editable user metadata. Handle signup without a
   session and Auth accounts with incomplete application profiles: show a clear
   translated state and allow safe completion after signin. Retrying must not
   recreate an existing profile or register a second Auth account. Do not claim
   SMS was sent or ownership was verified without a real configured provider.
   Do not weaken cloud confirmation settings or fabricate phone verification.
5. Follow the adapter mapping in `SUPABASE_SETUP.md`. Use RPCs for request
   creation, acceptance, cancellation, release, completion, driver online state,
   and admin driver approval. UUID mutation responses require refetching the
   authorized card. Release returns `{id,status:'open'}`. Never directly update
   request state, roles, approval, phones, or counters. Phones of counterparts
   come only from authorized RPC output, never raw cross-user profile queries.
6. Load settings before showing fuel estimates. Use straight-line km times the
   road coefficient exactly once, then consumption / 100 times fuel price.
   Respect the driver's own consumption. Do not display a calculated value from
   silently substituted settings after a real loading failure.
7. Implement pagination or load-more for request lists using RPC `p_limit` and
   `p_offset`, preserving existing callers. Do not imply the first 50 rows are
   the entire history. Clear lists, settings, and private in-memory state on
   signout/account change. Discard results from old sessions or stale routes.
8. Reject blocked drivers and sign them out when detected at signin or later
   refresh. SQL remains the security boundary. Handle pending/rejected drivers
   with clear states. Passenger alone sees completion for their accepted trip.
   Guard async rendering and double-clicked mutations; recover from a request
   taken by another driver by refreshing and showing a translated message.
9. Preserve HTML escaping. Add a translated warning not to put phone numbers in
   public names/pickup/comments, with reasonable input checks for obvious phone
   strings. Do not claim such checks detect every possible disclosure.
10. Service worker must never cache Auth, REST, RPC, API responses or private
    rendered pages. Cache only explicit static shell resources. Update its
    version and precache when adding adapter or vendor files. Real offline mode
    must explain that mutations cannot be submitted, with no fake successes.
11. Empty reference tables are expected: do not seed mock villages, tariffs,
    people, or fake coordinates into the real database. Show usable translated
    empty/loading/error states, including admin setup. Admin role is assigned
    by the owner out of band, never through browser signup.

## Verification and handoff

Run existing checks and update meaningful adapter tests with stubbed client
responses (no credentials). Cover success/error mapping, missing session,
incomplete profile, duplicate signup retry, blocked/signout cleanup, stale
responses, RPC-only mutations, pagination, missing settings/configuration,
and no mock fallback or private caching. Preserve existing database tests.
Run `node --test tests/*.test.cjs`, `node tests/audit.cjs`, JS syntax checks,
and `git diff --check`; report actual results and any commands unavailable.

Update `PROJECT_STATUS.md`, the data contract, setup instructions, and a short
integration report with changed files and remaining live checks. Document how
the reviewer inserts public configuration and selects the real backend. Be
explicit that mocked client tests do not verify real Auth/JWT/PostgREST or
independent concurrent sessions. Do not report production readiness.

Commit/upload the implementation to `main` through the normal Qwen workflow.
Stop after upload and provide the commit/PR link for engineering review.
