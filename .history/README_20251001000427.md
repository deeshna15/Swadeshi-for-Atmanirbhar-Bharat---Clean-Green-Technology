# Kar-Kadam (Value-Step)

A web-first MVP that connects households with verified waste aggregators, uses AI to identify recyclables, enables sanitation reporting, and visualizes hyper-local waste activity.

## Quick start

Requirements: Node 18+

```bash
cd "C:\project clean and green"
npm install
npm run dev
```

Open http://localhost:3000

- Home: landing and navigation tiles
- Scan: camera/upload → mock AI classification → points and challenge
- Marketplace: verified aggregator cards (mock)
- Waste Map: Leaflet map with category filters + heatmap from /api/pickups
- Report: sanitation report form (mock)
- Learn: lessons with images, tags, sections, and quizzes

Production run:
```bash
npm start
```

## Tech stack

- Frontend: HTML5, custom CSS, vanilla JS
- Maps: Leaflet + leaflet-heat (no API key required)
- Backend: Node.js + Express (static hosting + mock APIs)
- Dev tooling: nodemon for autoreload

Recommended evolution:
- Next.js + Tailwind + shadcn/ui; Mapbox GL; Supabase (Auth, Postgres/PostGIS, Realtime)
- On-device/server AI via ONNX Runtime/TFLite; Prophet/XGBoost for forecasts

## Project structure

```
project clean and green/
├─ frontend/
│  ├─ index.html           # Home (tiles linking to all pages)
│  ├─ scan.html            # AI scan UI
│  ├─ marketplace.html     # Aggregators
│  ├─ map.html             # Waste Map + filters + heatmap
│  ├─ report.html          # Sanitation reporting
│  ├─ learn.html           # Lessons, detail, quiz, progress
│  ├─ styles.css           # Shared styles
│  ├─ app.js               # Navbar active state, home rates fetch
│  ├─ scan.js              # Camera/upload + scan API + points
│  └─ map.js               # Leaflet render, filters, heat overlay
├─ server.js               # Express server + mock APIs
├─ package.json            # Scripts and deps
└─ README.md               # This file
```

## API overview (mock)

- GET `/api/rates` → array of { id, title, pricePerKg, trendPct }
- GET `/api/aggregators` → array of aggregator cards
- GET `/api/pickups` → map points with { lat, lng, type, weightKg, time, location }
- POST `/api/scan` → { result: { label, recyclable, estimatedValue }, stats }
- GET `/api/lessons` → lessons with images, tags, sections, quiz
- GET `/api/learn/progress` → { completedLessonIds[], quizCompletedLessonIds[], totalCompleted, totalLessons, points }
- POST `/api/learn/progress` body: { lessonId, action: 'complete'|'quiz' }

Notes:
- Data is in-memory for the MVP; restart resets state.
- Replace mocks with a database (Postgres/PostGIS) as you scale.

## Configuration

- Maps: Using Leaflet with OpenStreetMap tiles (no key). If you prefer Google Maps, replace `frontend/map.html` and `frontend/map.js` with the Maps JS API and add your key.
- Ports: `PORT` env var (default 3000)

## Development notes

- Styling is utility‑like but custom; easy to port to Tailwind later.
- Keep pages independent for now; Next.js migration can unify layout.
- When introducing a DB, start with schema for users, aggregators, pickups, scans, rates, reports, lessons, progress.

## Roadmap

- Replace mock scan with ONNX/TFLite model; on-device where possible
- Auth + roles (user/aggregator/admin); verified aggregator onboarding
- Realtime pickup matching and notifications
- Persist scans/pickups/reports to Postgres + PostGIS; analytics dashboards
- Price ingestion and forecasts; city/ward filters on the map

## Future development

### Phase 1: Productionize MVP
- Harden APIs, input validation, rate limiting, HTTPS, CORS policies.
- Persist state in Postgres + PostGIS; replace in-memory data.
- AuthN/Z: OTP/social login, roles (user/aggregator/admin), session management.
- File storage: signed uploads for photos; retention and cleanup jobs.
- Basic admin portal for aggregators, rates, and content (lessons).

### Phase 2: AI + AR upgrades
- Dataset: expand labeled images (plastic subtypes, contamination states). Active learning loop from user feedback.
- Models: YOLOv8/YOLOv10 nano/small with distillation + quantization; export ONNX/TFLite.
- Inference: onnxruntime-web (WebGPU) on desktop; TFLite on mobile; server fallback (ONNX Runtime Server) with rate caps.
- AR guidance: overlaid sorting tips and bin highlights for supported devices (WebXR/ARCore/ARKit or lightweight overlays).

### Phase 3: Marketplace & payouts
- Aggregator onboarding with KYC (Passbase/Onfido) and service area management.
- Dynamic pricing: per-type quote bands, quality adjustments, surge rules.
- Negotiation & booking: counter-offers, time windows, cancellation policy, SLAs.
- Payouts: UPI integration for households; wallet history and invoices.

### Phase 4: Logistics & realtime
- Route optimization and batching for aggregators; estimated arrival times.
- Realtime tracking and messaging; push notifications for status changes.
- Dispute resolution workflows and ratings/reviews.

### Phase 5: Municipal integrations
- Authorized reporting channel: push sanitation reports into civic systems (Open311 or city APIs).
- Operations dashboard: hotspots, trends, ward-level KPIs, exportable reports.
- Community programs: cleanup drives, festival-specific waste plans.

### Phase 6: Data platform & analytics
- Event pipeline (Kafka/Redpanda or managed) → warehouse (BigQuery/Snowflake/Postgres BI).
- BI dashboards (Metabase/Superset/Looker) for internal teams and municipalities.
- Forecasts: Prophet/XGBoost baseline → Vertex AI/AWS Forecast as data grows.
- Data governance: PII minimization, anonymization, retention, and audit trails.

### Phase 7: Mobile apps and offline
- Expo/React Native apps with offline caching and background location (opt‑in).
- Camera pipelines tuned for low-end devices; progressive model loading.
- Push notifications (FCM/APNs) for pickups, challenges, and lessons.

### Phase 8: Security, compliance, reliability
- Security reviews, dependency scanning, secrets management, WAF/CDN caching.
- SLOs, error budgets, on‑call, runbooks; chaos and load testing.
- Backups, PITR for Postgres; disaster recovery playbooks.

### Phase 9: Monetization & growth
- B2B: aggregator SaaS tools, premium analytics to municipalities/brands.
- B2C: rewards marketplace, partnerships, sponsored lessons.
- Referrals, leaderboards, and seasonal challenges.

### Phase 10: Internationalization
- i18n (Hindi/English first; add regional languages), locale-aware rates/units.
- Country-specific compliance and partner integrations.


