# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev     # Start development server (Node 22 required)
npm run build   # Production build
npm run start   # Start production server
```

There are no lint or test scripts configured.

## Environment

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

ALEGRA_AUTH_MODE=basic          # or 'bearer' depending on the account
ALEGRA_EMAIL=
ALEGRA_API_TOKEN=
ALEGRA_BASE_URL=https://api.alegra.com/api/v1
```

If `ALEGRA_API_TOKEN` is absent, the app falls back to Supabase-only data.

## Architecture

Next.js 15 App Router app with **no API routes**. All data fetching happens in async Server Components. There are two pages:

- `/` — main dashboard (`app/page.tsx`) — shows current or selected month metrics
- `/charts` — yearly ventas chart + inventario radar (`app/charts/page.tsx`)

Authentication is handled by Supabase SSR via `middleware.ts`, which calls `updateSession` on every request. All protected pages redirect to `/login` if no session is found.

### Data flow

```
Supabase (settings + metrics tables)
    ↓
getMetricsDataFromSupabase()   ← base config + manual metric values
    +
Alegra REST API                ← live invoices, payments, inventory
    ↓
getAlegraMetricsSnapshot()     ← computes ventas, recaudo, inventario, margen
    ↓
mergeAlegraMetrics()           ← Alegra values override Supabase base values
    ↓
monthly_snapshots table        ← cached per month (YYYY-MM key)
```

**Current month**: always fetched live from Alegra; snapshot saved/overwritten on each load.

**Past months**: snapshot loaded from `monthly_snapshots` if present; otherwise Alegra is queried for the full month range and the result is saved. Once saved, past snapshots are never automatically recalculated — to force a recalculation, delete the row(s) from `monthly_snapshots`.

### Supabase tables

| Table | Purpose |
|---|---|
| `settings` | Global config (e.g. `company_name`) |
| `metrics` | Base values and targets for each metric key |
| `monthly_snapshots` | Cached `metrics_data` JSONB per `month` (YYYY-MM) |
| `discounts` | Per-client discount rules keyed by `alegra_contact_id` or `client_identification` |
| `excluded_invoices` | Invoice IDs to exclude from ventas calculations |

### Discount application

`lib/customer-discounts.ts` loads discount rules from Supabase. `lib/alegra.ts` builds in-memory lookup maps (`buildCustomerDiscountLookup`) and applies discounts per invoice via `getAdjustedInvoiceNetSalesAmount` (amount × (1 - discount%/100)). Discounts are applied at calculation time; changing a discount does not retroactively update existing snapshots.

### Key lib files

- `lib/alegra.ts` — all Alegra API calls; net sales/recaudo/inventory calculation logic
- `lib/metrics.ts` — orchestrates Supabase + Alegra data, snapshot read/write, formatting utilities
- `lib/chart-data.ts` — loads yearly snapshots for the charts page
- `lib/supabase/server.ts` — server-side Supabase client (SSR cookies)
- `lib/supabase/middleware.ts` — session refresh middleware

### UI conventions

- All dates/times displayed in `America/Bogota` timezone
- Currency formatted as Colombian pesos (`$` prefix, `es-CO` locale, no decimals)
- Tailwind CSS 4 + shadcn/ui components; `components/ui/` contains only `button`, `card`, `chart`
- Framer Motion used for page transition animations (`app/template.tsx`)
- `AutoRefresh` component silently reloads the dashboard every 2 minutes when viewing the current month
