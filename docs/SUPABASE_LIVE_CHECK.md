# Supabase live database check

Checked: 2026-10-25. Project selected by the owner:
`your-golden-hour's Project` (`ubjcvqqxkgshguiwikqu`, Tokyo).

## Existing state

The initial schema was already present when the plugin was connected. It was
not applied again. All seven application tables have RLS enabled. The thirteen
application/helper functions have fixed empty search paths. Anonymous callers
cannot execute application RPCs. The private contact formatter is callable only
by its owner. Application users cannot directly change roles, phones, driver
approval, counters, or request status.

## Live verification

`supabase/checks/rollback_access_check.sql` ran successfully against the cloud
PostgreSQL database. It creates fictional fixtures inside one transaction,
sets the actual `authenticated`/`anon` database roles, checks access, and rolls
everything back. It verifies:

- Users see only their own profile and cannot promote themselves to admin.
- Pending drivers cannot accept requests; other-zone drivers cannot view or
  accept them.
- Phones are hidden before acceptance and visible to the assigned counterpart
  afterwards.
- Drivers cannot confirm completion. Passenger completion increments the
  driver's counter exactly once; a repeated confirmation fails.
- Anonymous callers cannot read users or call acceptance RPCs, and authenticated
  callers cannot directly invoke the private formatter.

After rollback: zero Auth accounts, zero app users, zero requests. No test data,
passwords, or geographic fixtures were retained. These checks impersonate
database roles; they do not verify Auth signup, JWT validation, HTTP/PostgREST,
account recovery, or two genuinely simultaneous transactions.

## Advisor findings

Security advisor reports ten intentionally exposed authenticated
`SECURITY DEFINER` RPCs. These implement the protected per-user operations;
each must keep its internal authorization checks and restricted grants. The
warning is documented rather than suppressed. See the
[Supabase explanation](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).

Performance advisor recommends village foreign-key indexes on `users` and
`requests`, caching row-independent Auth calls in RLS, and separating reference
table admin write policies to avoid overlapping SELECT policies. It also lists
unused indexes, expected for an empty database. These are pending optimizations;
no indexes were removed. See
[foreign-key indexes](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys),
[Auth calls in RLS](https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan),
and [overlapping policies](https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies).

## Next

Integrate the real browser adapter, verify phone/password Auth and ownership
recovery, check the exposed schemas through Data API settings, add verified
village data, and test concurrent acceptance/completion using independent
sessions. The website still uses its in-memory demo API. Nothing is deployed
to Cloudflare, and release promotion remains pending.
