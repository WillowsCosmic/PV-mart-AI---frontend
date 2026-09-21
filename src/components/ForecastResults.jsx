import { useRef, useState } from 'react'
import {
  Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, Bar, BarChart,
} from 'recharts'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function Metric({ label, value, unit }) {
  return (
    <div className="bg-white px-4 py-4">
      <div className="font-mono text-xl text-navy">
        {value}<span className="text-xs text-navy-soft ml-1">{unit}</span>
      </div>
      <div className="text-[0.72rem] text-navy-soft mt-1">{label}</div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const p50 = payload.find((p) => p.dataKey === 'p50_kwh')?.value
  const p75 = payload.find((p) => p.dataKey === 'p75_kwh')?.value
  const p90 = payload.find((p) => p.dataKey === 'p90_kwh')?.value
  return (
    <div className="bg-white border border-border rounded-lg px-3 py-2 text-xs leading-7 shadow-md shadow-navy/10">
      <div className="font-mono text-navy-soft mb-1">{label}</div>
      <div><span className="inline-block w-1.5 h-1.5 rounded-full bg-orange mr-2" />P50 &nbsp;{p50?.toLocaleString()} kWh</div>
      <div><span className="inline-block w-1.5 h-1.5 rounded-full bg-blue mr-2" />P75 &nbsp;{p75?.toLocaleString()} kWh</div>
      <div><span className="inline-block w-1.5 h-1.5 rounded-full bg-blue/50 mr-2" />P90 &nbsp;{p90?.toLocaleString()} kWh</div>
    </div>
  )
}

export default function ForecastResults({ result }) {
  const { champion_model, scoreboard, annual_forecast, summary, historical_monthly_avg } = result
  const captureRef = useRef(null)
  const [exporting, setExporting] = useState(false)

  async function handleExportPDF() {
    if (!captureRef.current) return
    setExporting(true)
    try {
      const canvas = await html2canvas(captureRef.current, {
        scale: 2,
        backgroundColor: '#fdf6e3',
      })
      const imgData = canvas.toDataURL('image/png')

      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      const safeModelName = champion_model.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
      pdf.save(`pv-mart-forecast-${safeModelName}.pdf`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div ref={captureRef} className="flex flex-col gap-6 bg-cream p-1">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-navy">10-year forecast</h2>
          <p className="text-navy-soft text-sm mt-1">
            Champion model: <strong className="text-orange font-semibold">{champion_model}</strong>
          </p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="shrink-0 flex items-center gap-2 bg-white border border-border text-navy text-sm font-medium px-4 py-2 rounded-lg hover:bg-cream-card transition-colors disabled:opacity-50 disabled:cursor-wait"
        >
          {exporting ? 'Exporting…' : 'Export PDF'}
        </button>
      </div>

      <div className="grid grid-cols-5 gap-px bg-border border border-border rounded-2xl overflow-hidden">
        <Metric label="Total 10-year output" value={summary.total_10yr_mwh} unit=" MWh" />
        <Metric label="Avg. annual output" value={summary.avg_annual_kwh?.toLocaleString()} unit=" kWh" />
        <Metric label="Specific yield" value={summary.specific_yield_kwh_per_kwp} unit=" kWh/kWp" />
        <Metric label="Capacity factor" value={summary.cuf_pct} unit="%" />
        <Metric label="System size" value={summary.system_kwp} unit=" kWp" />
      </div>

      <div className="bg-white border border-border rounded-2xl p-4 pt-6 shadow-sm shadow-navy/5">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={annual_forecast} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2f6fe4" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#2f6fe4" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#ece2c6" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" stroke="#4a5170" tick={{ fontSize: 12 }} />
            <YAxis stroke="#4a5170" tick={{ fontSize: 12 }} width={60} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="p75_kwh" stroke="none" fill="url(#bandFill)" />
            <Area type="monotone" dataKey="p90_kwh" stroke="none" fill="#ffffff" fillOpacity={1} />
            <Line type="monotone" dataKey="p75_kwh" stroke="#2f6fe4" strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="p90_kwh" stroke="#9db8ea" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
            <Line type="monotone" dataKey="p50_kwh" stroke="#f5841f" strokeWidth={2.5} dot={{ r: 3, fill: '#f5841f' }} />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="flex gap-6 justify-center text-xs text-navy-soft mt-2">
          <span><i className="inline-block w-2.5 h-[2.5px] bg-orange mr-1.5 align-middle" />P50 (likely)</span>
          <span><i className="inline-block w-2.5 h-[1.5px] bg-blue mr-1.5 align-middle" />P75</span>
          <span><i className="inline-block w-2.5 h-[1.5px] bg-blue/40 mr-1.5 align-middle" />P90 (conservative)</span>
        </div>
      </div>

      {historical_monthly_avg?.length > 0 && (
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm shadow-navy/5">
          <h3 className="text-sm text-navy-soft font-body font-semibold mb-1">
            Historical seasonal pattern
          </h3>
          <p className="text-xs text-navy-soft/70 mb-4">
            Average monthly generation across 25 years of historical weather data
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={historical_monthly_avg} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#ece2c6" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                tickFormatter={(m) => MONTH_NAMES[m - 1]}
                stroke="#4a5170"
                tick={{ fontSize: 11 }}
              />
              <YAxis stroke="#4a5170" tick={{ fontSize: 11 }} width={50} />
              <Tooltip
                formatter={(value) => [`${value.toLocaleString()} kWh`, 'Avg. output']}
                labelFormatter={(m) => MONTH_NAMES[m - 1]}
                contentStyle={{ background: '#fff', border: '1px solid #ece2c6', borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="avg_kwh" fill="#f5841f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white border border-border rounded-2xl p-5 shadow-sm shadow-navy/5">
        <h3 className="text-sm text-navy-soft font-body font-semibold mb-3">Candidate models</h3>
        <table className="w-full border-collapse font-mono text-[0.83rem]">
          <thead>
            <tr>
              <th className="text-left text-navy-soft/70 font-normal px-2.5 py-2 border-b border-border">Model</th>
              <th className="text-left text-navy-soft/70 font-normal px-2.5 py-2 border-b border-border">nRMSE</th>
              <th className="text-left text-navy-soft/70 font-normal px-2.5 py-2 border-b border-border">sMAPE</th>
              <th className="text-left text-navy-soft/70 font-normal px-2.5 py-2 border-b border-border">R²</th>
            </tr>
          </thead>
          <tbody>
            {scoreboard
              .slice()
              .sort((a, b) => a.nrmse - b.nrmse)
              .map((row, i) => (
                <tr key={row.model}>
                  <td className={`px-2.5 py-1.5 border-b border-border ${i === 0 ? 'text-orange font-medium' : 'text-navy'}`}>{row.model}</td>
                  <td className="px-2.5 py-1.5 border-b border-border text-navy">{row.nrmse?.toFixed(4)}</td>
                  <td className="px-2.5 py-1.5 border-b border-border text-navy">{row.smape?.toFixed(2)}%</td>
                  <td className="px-2.5 py-1.5 border-b border-border text-navy">{row.r2?.toFixed(4)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  )
}