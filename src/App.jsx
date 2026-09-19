import { useState } from 'react'
import LocationForm from './components/LocationForm.jsx'
import SystemForm from './components/SystemForm.jsx'
import ForecastResults from './components/ForecastResults.jsx'
import { requestForecast } from './services/forecastApi.js'

const DEFAULT_SITE = {
  latitude: 26.9157,
  longitude: 70.9083,
  tilt_deg: null,
  azimuth_deg: 180,
  obstacles: [],
}

const DEFAULT_SYSTEM = {
  panel: { model: 'Adani Mono 540' },
  inverter: { model: 'UTL Gamma 5K' },
  battery: null,
}

export default function App() {
  const [site, setSite] = useState(DEFAULT_SITE)
  const [system, setSystem] = useState(DEFAULT_SYSTEM)
  const [phase, setPhase] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function handleGenerate() {
    setPhase('loading')
    setError(null)
    setResult(null)
    try {
      const data = await requestForecast(site, system, (status) => setPhase(status))
      setResult(data)
      setPhase('done')
    } catch (err) {
      setError(err.message || 'Something went wrong.')
      setPhase('error')
    }
  }

  const isBusy = phase === 'loading' || phase === 'processing'

  return (
    <div className="min-h-screen bg-cream">
      <div className="border-b border-border bg-white">
        <div className="max-w-[1180px] mx-auto px-8 py-4 flex items-center gap-3">
          <span className="font-display font-semibold text-lg text-navy">PV Mart</span>
          <span className="text-navy-soft text-sm ml-1">Forecast Engine</span>
        </div>
      </div>

      <div className="max-w-[1180px] mx-auto px-8 pt-10 pb-16">
        <header className="max-w-[62ch] mb-10">
          <h1 className="text-[2.5rem] leading-tight font-display font-semibold mb-3">
            <span className="text-navy">What will your roof </span>
            <span className="bg-gradient-to-r from-orange to-orange-light bg-clip-text text-transparent">
              actually generate?
            </span>
          </h1>
          <p className="text-navy-soft text-[1.02rem] leading-relaxed">
            A physics-grounded, self-selecting forecast of real energy output over
            ten years — for any site in the country.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-8 items-start">
          <div className="flex flex-col gap-5 md:sticky md:top-8">
            <LocationForm value={site} onChange={setSite} />
            <SystemForm value={system} onChange={setSystem} />
            <button
              onClick={handleGenerate}
              disabled={isBusy}
              className={`rounded-lg px-5 py-3.5 text-[0.95rem] font-semibold transition-colors ${
                isBusy
                  ? 'bg-border text-navy-soft cursor-wait'
                  : 'bg-orange text-white hover:bg-orange-light'
              }`}
            >
              {phase === 'loading' && 'Checking site…'}
              {phase === 'processing' && 'Running full pipeline (few minutes)…'}
              {(phase === 'idle' || phase === 'done' || phase === 'error') && 'Generate forecast'}
            </button>
            {phase === 'processing' && (
              <p className="text-xs text-navy-soft leading-relaxed">
                New site — pulling 25 years of weather data and training models from scratch.
                This runs once; future requests for this site are instant.
              </p>
            )}
            {phase === 'error' && <p className="text-sm text-bad">{error}</p>}
          </div>

          <div className="min-h-[400px]">
            {result ? (
              <ForecastResults result={result} />
            ) : (
              <div className="h-full min-h-[400px] flex items-center justify-center text-navy-soft/60 border-2 border-dashed border-border rounded-2xl text-sm bg-cream-card">
                <p>Set a location and system, then generate a forecast.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
