import { useState } from 'react'

const PRESET_CITIES = [
  { label: 'Custom coordinates', lat: '', lon: '' },
  { label: 'Jaisalmer, RJ', lat: 26.9157, lon: 70.9083 },
  { label: 'Kolkata, WB', lat: 22.5726, lon: 88.3639 },
  { label: 'Pune, MH', lat: 18.5204, lon: 73.8567 },
  { label: 'Ahmedabad, GJ', lat: 23.0225, lon: 72.5714 },
]

const inputClass =
  'w-full bg-white border border-border text-navy rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/40 focus:border-orange transition-shadow'
const labelClass = 'flex flex-col gap-1.5 text-xs font-medium text-navy-soft flex-1 mb-4'

export default function LocationForm({ value, onChange }) {
  const [presetIndex, setPresetIndex] = useState(0)

  function handlePreset(e) {
    const idx = Number(e.target.value)
    setPresetIndex(idx)
    const preset = PRESET_CITIES[idx]
    if (preset.lat !== '') {
      onChange({ ...value, latitude: preset.lat, longitude: preset.lon })
    }
  }

  return (
    <section className="bg-white border border-border rounded-2xl p-6 shadow-sm shadow-navy/5">
      <h2 className="text-lg font-display font-semibold text-navy mb-1">Site location</h2>
      <p className="text-navy-soft text-sm leading-relaxed mb-5 max-w-[52ch]">
        Any coordinate works. Known sites return instantly; a new one runs the full
        forecasting pipeline in the background.
      </p>

      <label className={labelClass}>
        Quick select
        <select value={presetIndex} onChange={handlePreset} className={inputClass}>
          {PRESET_CITIES.map((c, i) => (
            <option key={c.label} value={i}>{c.label}</option>
          ))}
        </select>
      </label>

      <div className="flex gap-4">
        <label className={labelClass}>
          Latitude
          <input
            type="number"
            step="0.0001"
            value={value.latitude}
            onChange={(e) => onChange({ ...value, latitude: parseFloat(e.target.value) })}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Longitude
          <input
            type="number"
            step="0.0001"
            value={value.longitude}
            onChange={(e) => onChange({ ...value, longitude: parseFloat(e.target.value) })}
            className={inputClass}
          />
        </label>
      </div>

      <div className="flex gap-4">
        <label className={labelClass}>
          Panel tilt (°)
          <input
            type="number"
            step="0.1"
            placeholder="auto"
            value={value.tilt_deg ?? ''}
            onChange={(e) =>
              onChange({ ...value, tilt_deg: e.target.value === '' ? null : parseFloat(e.target.value) })
            }
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Azimuth (°)
          <input
            type="number"
            step="1"
            value={value.azimuth_deg}
            onChange={(e) => onChange({ ...value, azimuth_deg: parseFloat(e.target.value) })}
            className={inputClass}
          />
        </label>
      </div>
    </section>
  )
}