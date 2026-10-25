# Project status

Updated: 2026-10-26

## Completed

- Public repository: https://github.com/your-golden-hour/jailau
- Qwen Coder uploaded the first bilingual vanilla-JS PWA scaffold to `main`.
- First review targets `f9d42bab2c4ae2264914a45683debb4f06e7b347`.
- Corrections and SQL merged into `main` through PR #2 (merge `c5a6880`).
- PR #3 was a zero-file merge and added no browser integration. The local-only
  Qwen export check commit was never uploaded. Development is now maintained
  directly by Codex with the project owner.
- Initial `supabase/schema.sql`: seven RLS-protected tables, scoped grants,
  profile completion, atomic acceptance, cancellation/release, passenger-only
  completion with exactly-once trip counter, safe contacts, admin approval/blocking.
- Data contract corrected to match passenger-only completion, straight-line km,
  the counter, SQL RPC results, and the retained demo mode.
- Six local automated tests pass. Test dependencies are dev-only.
- GitHub secret scanning and push protection are enabled; no alerts at review time.
- `.gitignore` and GitHub Actions checks added.
- Website redesign on `codex/website-rebuild`: responsive entry page, passenger
  dashboard, refined forms/cards/navigation, bilingual draft terms/privacy page,
  and clearer demo-role entry. Existing `icon.svg` logo is unchanged.
- Public-text request fields now warn and reject phone-number patterns before
  demo submission. Navigation detaches stale async screens; bootstrap/logout
  errors are handled. Service-worker cache version bumped for the new shell.
- Seven local tests pass, including new public-field phone validation. Browser
  walkthrough covered passenger request, driver feed, admin view, Kazakh UI,
  and terms page. This branch has not yet been promoted to `release`.

## Decisions

- `main`: active development. `release`: reserved for reviewed deployable code;
  it has not been created yet. Cloudflare deployment remains gated by owner approval.
- Static HTML/CSS/JS, Supabase Auth/PostgreSQL/RLS, later Cloudflare Pages.
- Zero budget; cash payments, no maps/SMS/paid APIs in the pilot.
- No secrets, database dumps, or real personal data in Git.
- Passwords belong to Supabase Auth, never application tables or browser storage.
- Only a passenger may confirm their accepted trip as completed.
- `km_to_city` means straight-line km; apply the 1.3 road estimate once.
- `kz` remains the JSON/dictionary key; `kk` is the HTML language tag.
- No real data seeds. Schema is a one-time initial migration for a new project.
- The refreshed interface still uses only demo data. It does not silently
  collect real passenger details or switch to Supabase on its own.
- Schema RPCs return IDs; the future browser adapter loads authorized card JSON.
- License still pending the owner's choice.

## Next

1. Supabase project selected and connected through the plugin; the initial schema
   was already installed. Cloud SQL role/access checks passed; see
   `docs/SUPABASE_LIVE_CHECK.md`. Do not rerun the initial schema.
2. Decide free Auth policy before real registration: SMS confirmation needs a
   provider and may cost money. Candidate pilot modes are demo-only, email login
   plus phone as profile data, or manually invited phone accounts. Do not disable
   verification or call an unverified number confirmed without owner consent.
3. Implement the real browser adapter in a `codex/` branch, preserving the
   `window.JAILAU_API` contract, with explicit demo/real selection and no mock
   fallback after real errors. Keep session persistence disabled.
4. Test Supabase Auth/PostgREST, two simultaneous acceptance/completion calls,
   blocked sessions, and recovery/ownership of phone-based accounts.
5. Verify village geography and calculate straight-line distance from coordinates.
6. Finish PWA installability, real phone/slow-network checks, data retention,
   account recovery, and legal review of the draft terms/privacy before real users.
7. Only then promote reviewed work to `release`, protect it, configure Cloudflare
   production=`release` and previews=None, and request owner approval to publish.

## Evidence and handoff

- `docs/DATA_CONTRACT.md`: reviewed entities and API shapes.
- `docs/SUPABASE_SETUP.md`: owner instructions, SQL adapter mapping and live checks.
- `docs/REVIEW_2026-10-25.md`: findings, changes, checks and remaining limitations.
- Run checks: `pnpm install --frozen-lockfile --ignore-scripts`, then
  `node --test tests/*.test.cjs` and `node tests/audit.cjs`.
- Supabase is connected. Existing schema inspected; disposable cloud SQL tests
  were rolled back. Auth accounts, app users, and requests remain empty.
- The selected Supabase project has seven application tables (all RLS enabled),
  one settings row, no Auth users, zones, villages, requests, Edge Functions,
  development branches, or migration-history entries. Keep its installed schema.
- Qwen handoff instructions removed from the active repository; historical
  commits and PRs remain available for provenance.
- Real Auth/HTTP integration and simultaneous transaction checks remain pending.
- Site remains demo-only.
- Cloudflare is not configured; nothing has been published.
