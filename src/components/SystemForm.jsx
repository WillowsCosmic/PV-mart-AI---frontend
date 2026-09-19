const PANEL_OPTIONS = [
  'TP Mono 500', 'TP Mono 550',
  'Adani Mono 540', 'Adani TOPCon 600', 'Adani Bifacial 650',
  'Waaree Mono 540', 'Waaree Bi-600',
  'Somera 540', 'Somera 550',
  'Shark 440', 'Shark 550',
  'Hi-MO 550', 'Hi-MO 600',
  'Vertex 550', 'Vertex 670',
  'Tiger Neo 620',
  'DeepBlue 550',
]

const INVERTER_OPTIONS = [
  'SUN-3K-SG03LP1', 'SUN-5K-SG03LP1', 'SUN-10K-SG04LP3',
  'SolarPCU 3K', 'SolarPCU 5K',
  'Visol 5K-Grid',
  'Superb 5K',
  'Epro 5K-Hybrid',
  'UTL Gamma 3K', 'UTL Gamma 5K',
]

const BATTERY_OPTIONS = [
  'None',
  'Lithium 5kWh', 'Lithium 10kWh', 'Lithium 7.5kWh', 'Lithium Pack 5kWh',
  'Tubular 150Ah', 'Tubular 200Ah',
]

const inputClass =
  'w-full bg-white border border-border text-navy rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/40 focus:border-orange transition-shadow'
const labelClass = 'flex flex-col gap-1.5 text-xs font-medium text-navy-soft flex-1 mb-4'

export default function SystemForm({ value, onChange }) {
  return (
    <section className="bg-white border border-border rounded-2xl p-6 shadow-sm shadow-navy/5">
      <h2 className="text-lg font-display font-semibold text-navy mb-1">System configuration</h2>
      <p className="text-navy-soft text-sm leading-relaxed mb-5 max-w-[52ch]">
        The array is auto-sized from the inverter's rated capacity.
      </p>

      <div className="flex gap-4">
        <label className={labelClass}>
          Panel
          <select
            value={value.panel.model}
            onChange={(e) => onChange({ ...value, panel: { model: e.target.value } })}
            className={inputClass}
          >
            {PANEL_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <label className={labelClass}>
          Inverter
          <select
            value={value.inverter.model}
            onChange={(e) => onChange({ ...value, inverter: { model: e.target.value } })}
            className={inputClass}
          >
            {INVERTER_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
      </div>

      <label className={labelClass}>
        Battery (optional)
        <select
          value={value.battery?.model ?? 'None'}
          onChange={(e) =>
            onChange({
              ...value,
              battery: e.target.value === 'None' ? null : { model: e.target.value },
            })
          }
          className={inputClass}
        >
          {BATTERY_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </label>
    </section>
  )
}