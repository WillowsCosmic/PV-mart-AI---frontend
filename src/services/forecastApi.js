import axios from 'axios'

const API_BASE = import.meta.env.VITE_FORECAST_API_URL || 'http://localhost:8000'

const client = axios.create({ baseURL: API_BASE })

/**
 * Requests a forecast for any site. Handles both response shapes from the
 * backend:
 *   - 200: pilot or previously-processed location, instant result
 *   - 202: brand-new location, backend started a background job -- this
 *     function polls the status endpoint until it completes or fails.
 *
 * onStatusChange(status) is called with 'processing' while polling, so the
 * UI can show progress without the caller needing to know about jobs.
 */
export async function requestForecast(site, system, onStatusChange) {
  const response = await client.post('/v1/forecast', {
    site,
    system,
    horizon_years: 10,
  })

  if (response.status === 200) {
    return response.data
  }

  const { job_id } = response.data
  onStatusChange?.('processing')

  const POLL_INTERVAL_MS = 8000
  const MAX_ATTEMPTS = 90 // 12 minutes ceiling

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))

    const statusResponse = await client.get(`/v1/forecast/status/${job_id}`)
    const { status } = statusResponse.data

    if (status === 'completed') {
      return statusResponse.data
    }
    if (status === 'failed') {
      throw new Error(statusResponse.data.error || 'Forecast pipeline failed')
    }
  }

  throw new Error('Forecast is taking longer than expected. Try again shortly.')
}