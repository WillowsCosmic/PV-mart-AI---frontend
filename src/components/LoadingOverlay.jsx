import { useEffect, useState } from 'react'

function formatElapsed(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function LoadingOverlay({ phase }) {
  const [elapsed, setElapsed] = useState(0)
  const isVisible = phase === 'loading' || phase === 'processing'

  useEffect(() => {
    if (!isVisible) {
      setElapsed(0)
      return
    }
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [isVisible])

  if (!isVisible) return null

  const isNewSite = phase === 'processing'

  return (
    <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl shadow-navy/20 px-10 py-9 max-w-sm w-full mx-4 text-center">
        <div className="mx-auto mb-5 w-12 h-12 relative">
          <div className="absolute inset-0 rounded-full border-4 border-cream-card" />
          <div className="absolute inset-0 rounded-full border-4 border-orange border-t-transparent animate-spin" />
        </div>

        <h3 className="font-display font-semibold text-navy text-lg mb-1.5">
          {isNewSite ? 'Running the full pipeline' : 'Checking site'}
        </h3>
        <p className="text-navy-soft text-sm leading-relaxed">
          {isNewSite
            ? 'Pulling 25 years of weather data and training forecasting models from scratch. This usually takes a few minutes.'
            : 'Looking up this location…'}
        </p>

        {isNewSite && (
          <div className="mt-5 pt-4 border-t border-border">
            <span className="font-mono text-sm text-navy-soft">
              Elapsed: {formatElapsed(elapsed)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}