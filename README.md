# PV Mart — Forecast Engine UI (Frontend)

A standalone React + Vite interface for the PV Mart AI Forecasting Engine
backend. Lets you pick any site in India, configure a real panel/inverter/
battery combination, and view a 10-year probabilistic (P50/P75/P90) energy
forecast — including for locations the backend has never processed before.

This is a **separate repo** from `PV-Mart-Pro` (the main marketplace/site
analyser frontend) — built specifically to exercise and demo the AI
forecasting backend on its own.

---

## Tech stack

| Layer | Tool |
|---|---|
| Framework | React 18 + Vite 5 |
| Styling | Tailwind CSS (custom theme matching PV Mart's real brand palette) |
| Charting | Recharts (P50/P75/P90 band chart) |
| HTTP | Axios |
| Fonts | Poppins (display), Inter (body), IBM Plex Mono (tabular data) |

---

## Project structure

```
pv-mart-forecast-ui/
  index.html
  tailwind.config.js        Brand color tokens (cream, orange, navy, blue)
  vite.config.js             Dev server on port 5174
  .env.local.example         VITE_FORECAST_API_URL

  src/
    main.jsx
    App.jsx                  Top-level layout: header, location/system
                              forms, results panel
    index.css                Tailwind directives + base styles

    services/
      forecastApi.js         Calls POST /v1/forecast; if the backend
                              returns 202 (new location), automatically
                              polls GET /v1/forecast/status/{job_id}
                              every 8s until completed or failed

    components/
      BrandMark.jsx           Abstract sun-motif mark in brand colors
                               (not a copy of PV Mart's actual logo artwork)
      LocationForm.jsx        Lat/lng input + quick-select presets
      SystemForm.jsx          Panel / inverter / battery dropdowns
                               (full catalog, matches backend's
                               product_configs.py)
      ForecastResults.jsx     Metric strip, P50/P75/P90 chart, model
                               scoreboard table
```

---

## Setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Runs on `http://localhost:5174`.

**Requires the backend running** at the URL set in `.env.local`
(default `http://localhost:8000`) — see the `PV-Mart-AI` repo's README.

If you change the frontend's port or add another dev origin, the backend's
CORS `allow_origins` list in `forecast_api.py` needs that origin added too,
or requests will fail with a CORS error in the browser console.

---

## How the async flow works

1. User picks a site + system, clicks **Generate forecast**.
2. `requestForecast()` sends `POST /v1/forecast`.
   - **200** → known/cached site, result renders immediately.
   - **202** → new site, backend started a background job. The button
     switches to "Running full pipeline (few minutes)…" and the service
     polls the status endpoint automatically (no user action needed).
3. Once the job completes, the same `ForecastResults` component renders
   the result — the UI doesn't distinguish between "instant" and
   "just finished processing" results.

---

## Known limitations

- **Product dropdowns list every catalog model by short name only**
  (e.g. "Shark 550", not "Loom Solar Shark 550") — matches how the backend's
  `find_by_model()` looks products up. If two products ever share a short
  name, the backend resolves to whichever appears first in its catalog.
- **No map picker yet** — location entry is lat/lng fields + a handful of
  quick-select presets, not an interactive map (PV-Mart-Pro's Leaflet map
  could be reused here later if wanted).
- **Long-running new-location requests have no visual progress bar**,
  just a status message — the actual pipeline takes several minutes and
  there's no percentage/step indicator yet.
- **Brand mark is a placeholder**, not PV Mart's real logo asset — swap in
  the actual logo file whenever this is meant to be shown outside internal
  testing.
