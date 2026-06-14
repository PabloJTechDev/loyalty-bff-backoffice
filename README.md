# loyalty-bff-backoffice

NestJS BFF (Backend for Frontend) — backoffice operational API for the loyalty platform.

Part of the **backoffice vertical**: `web-backoffice` → **`bff-backoffice`** → `core-backoffice` + `core-points`

---

## Responsibilities

Aggregates data from two core services to power the backoffice panel:

- **`core-backoffice`** → capabilities and operational alerts
- **`core-points`** → enrollment stats, customer profiles, point balances and transaction history

Falls back to safe mock data when cores are unavailable (live/fallback badge shown in UI).

---

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Service health + integration status |
| `GET` | `/api/ready` | Readiness check |
| `GET` | `/api/metrics` | Prometheus metrics |
| `GET` | `/api/v1/backoffice/dashboard` | Full dashboard: KPIs, queues, customer snapshots, point flows |
| `GET` | `/api/v1/backoffice/customers/:customerId` | Customer detail with profile + points balance |
| `GET` | `/api/v1/backoffice/customers/:customerId/points` | Customer point balance + transaction history |
| `GET` | `/api/v1/backoffice/orders/:orderId` | Order snapshot |

### Dashboard KPIs (live from `core-points`)

- Total enrollments / pending
- Total logins
- Password changes / pending
- **Points in circulation** (SUM balance across all accounts)
- **Lifetime accrued vs redeemed**

---

## Tech stack

- **NestJS 10** (modular architecture)
- **Axios** (`@nestjs/axios`) for core service calls
- **Prometheus** client (request counters + histograms)
- Structured JSON logging

---

## Running locally

```bash
cp .env.example .env
npm install
npm run start:dev
```

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3003` | HTTP listen port |
| `NODE_ENV` | `development` | Environment |
| `CORE_BACKOFFICE_BASE_URL` | `http://localhost:3005` | core-backoffice URL |
| `CORE_POINTS_BASE_URL` | `http://localhost:3001` | core-points URL |

---

## Integration pattern

```
Dashboard request
  → getHealth(core-backoffice) + getHealth(core-points)    [parallel]
  → if available: getCapabilities, getAlerts, getStats, getSnapshots
  → if unavailable: safe mock fallback
  → { source: 'live' | 'mock', kpis, queues, customerSnapshots, ... }
```

---

## Part of loyalty-platform

See the [monorepo root](https://github.com/PabloJTechDev/loyalty-platform) for the full architecture, port map, and Docker Compose setup.
