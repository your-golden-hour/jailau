# Jailau — Data Contract (Mock → Supabase)

This document defines the data model for **Jailau / Жайлау**, a free platform that
connects passengers in villages near Shymkent with local taxi drivers. The frontend
currently runs against an **in-memory mock API** (`js/api.js`). When the real backend
(Supabase) is ready, implement exactly these entities, fields, relationships and
visibility rules so the frontend can swap `js/api.js` internals without touching screens.

Reviewed on 2026-10-25. `supabase/schema.sql` is the initial migration, and
`docs/SUPABASE_SETUP.md` defines the SQL-to-browser adapter mapping. The browser
API is still a mock; adding keys does not connect Supabase.

**Non-negotiable product constraints**

- Zero budget: free tier only. No SMS providers, no Google Maps, no paid APIs.
- Privacy-first: phone numbers are hidden until a driver **accepts** a request.
- The platform is **not a carrier**. Payments are cash, passenger ↔ driver, off-platform.
- Dictionary/JSON keys remain Russian (`ru`) and Kazakh (`kz`); the HTML language
  tag uses the standard Kazakh language code `kk`.
- Mobile-first PWA; vanilla JS; hash routing.

---

## 1. Entity overview

| Table | Purpose | Written by | Read by |
|---|---|---|---|
| `zones` | District-level areas around Shymkent | admin | everyone |
| `villages` | Villages belonging to a zone, with coords & distance | admin | everyone |
| `users` | Accounts: passenger / driver / admin | auth flow | self, admin |
| `driver_profiles` | Car, zone, approval & online state | driver + admin | see §6 |
| `requests` | Ride requests posted by passengers | passenger | see §6 |
| `tariffs` | Suggested price per village | admin | everyone |
| `settings` | Global pricing parameters (fuel, road coefficient) | admin | everyone |

Conventions:

- Primary keys: `id uuid default gen_random_uuid()` (mock uses readable string ids like `v-orkhovo`, `r-1`).
- Timestamps: `created_at timestamptz default now()`, ISO-8601 strings in JSON.
- Localized names are stored as JSONB: `{ "ru": "…", "kz": "…" }`.
- Money is integer tenge (KZT). No floats for currency.

---

## 2. `zones`

District/area grouping villages into a driver's working feed.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | uuid / text | ✔ | PK |
| `name` | jsonb `{ru, kz}` | ✔ | e.g. `{"ru":"Сарыагаш","kz":"Сарыағаш"}` |

Relationships: one zone → many `villages`; one zone → many `driver_profiles`.

---

## 3. `villages`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | uuid / text | ✔ | PK |
| `zone_id` | uuid / text | ✔ | FK → `zones.id` |
| `name` | jsonb `{ru, kz}` | ✔ | Village name in both languages |
| `lat` | numeric(9,6) | ✔ | WGS84 latitude (display/distance only — **no map tiles**) |
| `lng` | numeric(9,6) | ✔ | WGS84 longitude |
| `km_to_city` | numeric(6,1) | ✔ | Straight-line distance to the chosen Shymkent center, NOT road distance; multiply by road coefficient exactly once |

Relationships: belongs to a zone; referenced by `requests.village_id`, `tariffs.village_id`, `users.village_id`.

---

## 4. `users`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | uuid | ✔ | PK = Supabase `auth.users.id` when migrated |
| `name` | text | ✔ | Display name (first name + surname initial is enough) |
| `phone` | text | ✔ | E.164-ish `+77XXXXXXXXX`; unique; **never shown before consent event (§6)** |
| `password_hash` | text | mock-only | In production handled by Supabase Auth — do **not** store passwords yourself |
| `role` | enum `passenger` \| `driver` \| `admin` | ✔ | Set at registration; admin created out-of-band |
| `village_id` | uuid | optional | Home village of a passenger (drives “online drivers near me”) |
| `created_at` | timestamptz | ✔ | |

Rules:

- A `driver` user must have exactly one `driver_profiles` row.
- Drivers register as `pending` and cannot see the feed until approved (§5).
- The future browser adapter must reject blocked driver sessions and sign them out.
  The SQL immediately prevents blocked drivers reading request/contact data or
  accepting requests even with an existing valid JWT. Banning Supabase Auth login
  itself requires a separate trusted Auth admin action/hook; this migration does
  not implement an Auth ban and the frontend check alone is not authorization.

---

## 5. `driver_profiles`

One-to-one extension of `users` where `role = 'driver'`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `user_id` | uuid | ✔ | PK & FK → `users.id` |
| `zone_id` | uuid | ✔ | FK → `zones.id`; determines which feed the driver sees |
| `car_brand` | text | ✔ | e.g. `Hyundai Accent` |
| `plate` | text | ✔ | License plate, e.g. `560 ABC 03` |
| `seats` | int (1–4) | ✔ | Passenger seats offered |
| `fuel_consumption` | numeric(4,1) | ✔ | l/100 km, used by cost estimate; default from `settings` |
| `approval_status` | enum `pending` \| `active` \| `rejected` \| `blocked` | ✔ | Admin-managed lifecycle |
| `is_online` | boolean | ✔ | Feed visibility switch |
| `online_since` | timestamptz | nullable | Set when going online, cleared when offline |
| `completed_trips` | integer | ✔ | Default 0; only `confirm_trip_done` increments it, once per completed request |

Lifecycle: `pending → active` (approve) · `pending → rejected` · `active → blocked` ·
`blocked/rejected → active` (unblock). Going online requires `active`.

---

## 6. `requests`

A ride request posted by a passenger. This is the core entity.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | uuid | ✔ | PK |
| `passenger_id` | uuid | ✔ | FK → `users.id` (role passenger) |
| `direction` | enum `village_to_city` \| `city_to_village` | ✔ | Village → Shymkent or reverse |
| `village_id` | uuid | ✔ | FK → `villages.id` (the village end of the trip) |
| `pickup_spot` | text | optional | Free-text landmark (“near the mosque”), max ~120 chars |
| `when` | enum `asap` \| `scheduled` | ✔ | |
| `datetime` | timestamptz | if `scheduled` | Departure time; null when `asap` |
| `seats` | int (1–4) | ✔ | Seats needed |
| `price` | int (tenge) | if not negotiable | Passenger’s offered price; null when `negotiable` |
| `negotiable` | boolean | ✔ | “Договорная / Келіссөзбен” |
| `comment` | text | optional | Baggage, kids, livestock… |
| `status` | enum `open` \| `accepted` \| `done` \| `cancelled` | ✔ | State machine below |
| `driver_id` | uuid | nullable | FK → `users.id`, set on accept |
| `created_at` | timestamptz | ✔ | |
| `accepted_at` | timestamptz | nullable | |
| `done_at` | timestamptz | nullable | |

State machine:

```
open ──accept──▶ accepted ──confirm_done──▶ done
  │                  │
  │ cancel (own)     │ release (driver)
  ▼                  ▼
cancelled          open   (driver_id cleared)
```

- Only the owning passenger may cancel while `status = open`.
- Accept is atomic via `accept_request`: locks the driver's profile, verifies
  `active`, online state, seats and zone, then conditionally updates an open request.
  First driver wins; losing calls receive `df_already_taken`. Clients have no
  direct INSERT/UPDATE/DELETE privileges on requests.
- Only the owning passenger can confirm an accepted ride as done. Driver/admin
  completion is forbidden. The same transaction increments `completed_trips` once.
- A released request returns to the feed with `driver_id = null`.

### Privacy / field visibility matrix (critical for RLS policies)

| Viewer | Sees passenger name | Sees passenger phone | Sees driver name/car | Sees driver phone |
|---|---|---|---|---|
| Anonymous / unauthenticated | ✘ | ✘ | ✘ | ✘ |
| Passenger browsing feed (none — passengers don’t browse) | – | – | – | – |
| Driver, request `open` (feed card) | ✔ | ✘ | ✘ | ✘ |
| Driver, own accepted request | ✔ | ✔ (after accept) | ✔ | ✘ |
| Passenger, own request `open` | ✔ | n/a | ✘ | ✘ |
| Passenger, own request `accepted/done` | ✔ | n/a | ✔ | ✔ (after accept) |
| Admin | ✔ | ✔ | ✔ | ✔ |

Implementation notes for Supabase:

- Store phones in `users.phone`; expose them via a **view or RPC** that joins
  `requests` and returns the phone **only** when `requests.driver_id = auth.uid()`
  (for passenger phone) or `requests.passenger_id = auth.uid() AND status in ('accepted','done')`
  (for driver phone). Never select raw `users.phone` client-side.
- The mock enforces this in `decorateRequest()` inside `js/api.js` — keep the same
  semantics server-side.

---

## 7. `tariffs`

Suggested (reference) price per village, maintained by admin; shown to both sides
as guidance, never binding.

| Field | Type | Required | Notes |
|---|---|---|---|
| `village_id` | uuid | ✔ | PK & FK → `villages.id` (one tariff per village) |
| `suggested_price` | int (tenge) | ✔ | One-way price village ↔ Shymkent |

---

## 8. `settings`

Single-row global configuration (id = `default`).

| Field | Type | Default | Notes |
|---|---|---|---|
| `fuel_price_tenge_per_liter` | numeric(6,2) | 235 | AI-92 reference price |
| `road_coefficient` | numeric(4,2) | 1.3 | Multiplier for gravel/off-road reality vs straight-line km |
| `default_fuel_consumption` | numeric(4,1) | 8.0 | l/100 km used when a profile doesn’t specify |

Driver-feed fuel estimate formula:

```
effective_km = km_to_city × road_coefficient
liters       = effective_km × fuel_consumption / 100
fuel_cost ₸  = liters × fuel_price_tenge_per_liter
```

Arithmetic example (not verified geography): 22 km × 1.3 × 7.5 l/100km × 235 ₸ =
504.075 ₸, rounded to **504 ₸** fuel cost —
which helps a driver judge whether a 1500 ₸ offer is profitable.

---

## 9. API surface (frontend contract)

`js/api.js` exposes `window.JAILAU_API` — the single point of all data access.
The Supabase implementation must keep these signatures (all return Promises
except the synchronous `estimateFuelCost` helper):

| Function | Args | Returns | Notes |
|---|---|---|---|
| `signUp` | `{name, phone, password, role, village_id?, driver?{zone_id, car_brand, plate, seats, fuel_consumption}}` | public user | driver gets `pending` profile |
| `signIn` | `phone, password` | public user | blocked drivers rejected |
| `signOut` | – | true | clears session |
| `getCurrentUser` | – | public user \| null | session only, in-memory |
| `listZonesAndVillages` | – | zones[] each with villages[] (+`suggested_price`) | reference data |
| `setUserVillage` | `village_id` | public user | passenger home village |
| `createRequest` | `{direction, village_id, pickup_spot, when, datetime, seats, negotiable, price, comment}` | request | validates seats 1–4 |
| `listMyRequests` | – | decorated requests[] | viewer=`passenger` (driver phone after accept) |
| `cancelRequest` | `request_id` | decorated request | only own `open` requests |
| `listOpenRequestsForDriver` | – | decorated requests[] | zone-filtered, requires `active` + `is_online`; no phones |
| `getDriverStatus` | – | `{is_online, approval_status, zone_name, …}` | own profile |
| `acceptRequest` | `request_id` | decorated request | atomic; fails `df_already_taken` |
| `releaseRequest` | `request_id` | decorated request | own `accepted` only |
| `confirmTripDone` | `request_id` | decorated request | owning passenger only; `accepted` → `done`; increments assigned driver's counter once |
| `setDriverOnline` | `boolean` | `{is_online, online_since}` | requires `active` |
| `listOnlineDriversByVillage` | `village_id` | `[{name, car_brand, seats, online_since}]` | **phones excluded by design** |
| `listDriverAcceptedRequests` | – | decorated requests[] | viewer=`driver-owner`, passenger phone revealed |
| `estimateFuelCost` | `km, consumption?` | `{km, coefficient, consumption, fuel_price, liters, cost_tenge}` | pure calc from `settings` |
| `adminApproveDriver` / `adminRejectDriver` / `adminBlockDriver` / `adminUnblockDriver` | `user_id` | `{ok, messageKey, driver}` | admin only |
| `adminListDrivers` | `statusFilter ("pending"\|"all")` | driver rows incl. phone (admin view) | admin only |
| `adminAddZone` | `name_ru, name_kz` | zone | admin only |
| `adminAddVillage` | `{zone_id, name_ru, name_kz, lat, lng, km_to_city}` | village | admin only |
| `adminSetTariff` | `village_id, price` | `{ok}` | admin only |
| `adminSaveSettings` | `{fuel_price_tenge_per_liter, road_coefficient, default_fuel_consumption}` | settings | admin only |
| `getSettings` | – | settings | everyone |

Error convention: functions reject with `Error(messageKey)` where `messageKey` is an
i18n key (`err_login_failed`, `df_already_taken`, `mr_cancel_not_possible`, …) so the UI
can translate it directly.

---

## 10. Migration checklist (mock → Supabase)

1. Create tables per §2–§8 (SQL above described structurally; add indexes on
   `requests(status, village_id)`, `villages(zone_id)`, `driver_profiles(zone_id, is_online)`).
2. Enable RLS; write policies matching the visibility matrix in §6 — phones only after accept.
3. Implement `acceptRequest` as a Postgres RPC (`security definer`) for atomic first-wins.
4. Put the project URL + **anon key only** into `js/config.js` (never service_role).
5. Replace bodies of `js/api.js` with supabase-js calls; keep exports identical.
6. Keep `DEMO_MODE = true` until the real adapter and live security checks pass.
   Keys alone must never remove the banner.
7. Real auth: Supabase phone/password for the agreed pilot; no password/hash column
   in `public.users`. Without SMS there is no proof of phone ownership, so use
   trusted test accounts and agree a recovery process before enrolling real users.
8. `complete_profile` uses the authenticated user's phone from `auth.users`, never
   a phone or role taken blindly from editable metadata. It permits only passenger
   or driver creation, once. Admin is appointed out-of-band by the owner.
9. Paginate request lists (`list_requests` defaults to 50 rows, caps at 100).
10. Never include phone numbers in pickup/comment/name fields: free text is visible
    to approved drivers in the zone before acceptance. Add a user notice and
    input checks in the real adapter; structural phone privacy cannot protect a
    phone someone deliberately types into public request text.

---

## 11. Explicitly out of scope (for now)

- Online payments (cash only, direct).
- Maps/routing (coordinates stored for distance math only; no tile provider).
- SMS notifications (PWA push comes later, free tier).
- Ratings/dispute resolution.
- Multi-city support (Shymkent agglomeration only).
