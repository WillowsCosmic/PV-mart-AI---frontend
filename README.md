# PV Mart — Forecast Engine UI (Frontend)

A standalone React + Vite interface for the PV Mart AI Forecasting Engine
backend. Lets you pick any site in India, configure a real panel/inverter/
battery combination, and view a 10-year probabilistic (P50/P75/P90) energy
forecast — including for locations the backend has never processed before.

This is a **separate repo** from `PV-Mart-Pro` (the main marketplace/site
analyser frontend).

**🟢 Live:** https://pv-mart-ai-frontend.vercel.app
Backend API: https://pv-mart-ai-backend.onrender.com

---

## Tech stack

| Layer | Tool |
|---|---|
| Framework | React 18 + Vite 5 |
| Styling | Tailwind CSS — custom theme matching PV Mart's real brand (cream background, orange/navy/blue palette, Poppins + Inter) |
| Charting | Recharts |
| PDF export | jsPDF + html2canvas |
| HTTP | Axios |
| **Hosting** | **Vercel** |

---

## Project structure

```
pv-mart-forecast-ui/
  index.html
  tailwind.config.js        Brand color tokens
  vite.config.js             Dev server on port 5174
  .env.local.example         VITE_FORECAST_API_URL

  src/
    main.jsx
    App.jsx                  Top-level layout + LoadingOverlay mount point
    index.css

    services/
      forecastApi.js         Calls POST /v1/forecast; if the backend
                              returns 202 (new location), automatically
                              polls GET /v1/forecast/status/{job_id}
                              every 8s until completed or failed

    components/
      BrandMark.jsx           Abstract sun-motif mark in brand colors
                               (not a copy of PV Mart's actual logo)
      LocationForm.jsx        Lat/lng input + quick-select presets
      SystemForm.jsx          Panel / inverter / battery dropdowns
                               (full catalog, matches backend's
                               product_configs.py)
      LoadingOverlay.jsx      Full-screen backdrop + spinner card, shown
                               while a forecast is loading or a new-site
                               pipeline job is processing. Shows a live
                               elapsed-time counter during long jobs so
                               the user knows it's still working.
      ForecastResults.jsx     Metric strip, P50/P75/P90 chart, historical
                               seasonal chart, model scoreboard table, and
                               PDF export. Export button temporarily swaps
                               the on-screen bar chart for a full data
                               table (all ~300 historical monthly rows,
                               not just the 12-month average) before
                               capturing, then swaps back -- the visible
                               app is unaffected, only the exported PDF
                               shows the full table instead of the chart.
```

---

## Setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```
Runs on `http://localhost:5174`.

For local testing against the live backend instead of running it yourself:
```
VITE_FORECAST_API_URL=https://pv-mart-ai-backend.onrender.com
```

---

## Deployment (Vercel) — currently live

1. Import the GitHub repo in Vercel (auto-detects Vite, no config needed)
2. Environment variable: `VITE_FORECAST_API_URL=https://pv-mart-ai-backend.onrender.com`
3. Deploy

**Note on preview URLs:** every Vercel deployment (including non-production
pushes) gets its own random-hash URL, e.g.
`pv-mart-ai-frontend-<hash>-<team>.vercel.app`. These are **not** the same
as the production URL and initially caused a CORS failure when testing
against one by mistake. The backend's CORS config now allows any
`*.vercel.app` origin via regex specifically to cover this, but when in
doubt, test against the clean production URL first.

---

## How the async flow works

1. User picks a site + system, clicks **Generate forecast**.
2. `LoadingOverlay` appears immediately (full-screen backdrop + spinner card).
3. `requestForecast()` sends `POST /v1/forecast`.
   - **200** → known/cached site, result renders immediately, overlay disappears.
   - **202** → new site. Overlay switches to "Running the full pipeline"
     with a live elapsed-time counter. The service polls the status
     endpoint automatically every 8s — no user action needed. This can
     take several minutes, longer on Render's free tier than it would locally.
4. Once complete, `ForecastResults` renders — visually identical whether
   the result was instant or just finished processing.

---

## PDF export details

- Captures the results panel (metrics, P50/P75/P90 chart, seasonal chart,
  scoreboard) via `html2canvas`, then assembles a paginated PDF via `jsPDF`
  (splits across multiple A4 pages if content is taller than one page).
- **The historical seasonal section is swapped from a chart to a full
  data table specifically for the export** — the on-screen chart shows a
  12-month average for readability, but the exported PDF includes the
  complete ~300-row historical record (all 25 years, month by month),
  since a report is expected to carry the full data, not just a summary.
- Filename includes the champion model name, e.g. `pv-mart-forecast-ets.pdf`.

---
