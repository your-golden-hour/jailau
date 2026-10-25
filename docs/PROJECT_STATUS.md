# Project status

Updated: 2026-10-25

## Completed

- Public repository: https://github.com/your-golden-hour/jailau
- Qwen Coder uploaded the first bilingual vanilla-JS PWA scaffold to `main`.
- First review targets `f9d42bab2c4ae2264914a45683debb4f06e7b347`.
- Corrections and SQL are in `review/first-scaffold-security`; not merged to main/release.
- Initial `supabase/schema.sql`: seven RLS-protected tables, scoped grants,
  profile completion, atomic acceptance, cancellation/release, passenger-only
  completion with exactly-once trip counter, safe contacts, admin approval/blocking.
- Data contract corrected to match passenger-only completion, straight-line km,
  the counter, SQL RPC results, and the retained demo mode.
- Six local automated tests pass. Test dependencies are dev-only.
- GitHub secret scanning and push protection are enabled; no alerts at review time.
- `.gitignore` and GitHub Actions checks added.

## Decisions

- Main: incoming unreviewed Qwen Coder work. Release: verified code only.
- Static HTML/CSS/JS, Supabase Auth/PostgreSQL/RLS, later Cloudflare Pages.
- Zero budget; cash payments, no maps/SMS/paid APIs in the pilot.
- No secrets, database dumps, or real personal data in Git.
- Passwords belong to Supabase Auth, never application tables or browser storage.
- Only a passenger may confirm their accepted trip as completed.
- `km_to_city` means straight-line km; apply the 1.3 road estimate once.
- `kz` remains the JSON/dictionary key; `kk` is the HTML language tag.
- No real data seeds. Schema is a one-time initial migration for a new project.
- Schema RPCs return IDs; the future browser adapter loads authorized card JSON.
- License still pending the owner's choice.

## Next

1. Supabase project selected and connected through the plugin; the initial schema
   was already installed. Cloud SQL role/access checks passed; see
   `docs/SUPABASE_LIVE_CHECK.md`. Do not rerun the initial schema.
2. Integrate the real adapter in `js/api.js` with session persistence disabled.
3. Test Supabase Auth/PostgREST, two simultaneous acceptance/completion calls,
   blocked sessions, and recovery/ownership of phone-based accounts.
4. Verify village geography and calculate straight-line distance from coordinates.
5. Finish PWA installability, real phone/slow-network checks, async route handling.
6. Add terms/privacy and settle data retention and account recovery for the pilot.
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
- Real Auth/HTTP integration and simultaneous transaction checks remain pending.
- Site remains demo-only.
- Cloudflare is not configured; nothing has been published.
