import { useEffect, useState } from 'react'
import { performanceAPI, signalsAPI } from '../services/api'
import { StatCard, SignalBadge, Loader } from '../components/common'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const [perf, setPerf]       = useState(null)
  const [signals, setSignals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([performanceAPI.get(), signalsAPI.history()])
      .then(([p, s]) => { setPerf(p.data); setSignals(s.data.slice(0, 5)) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Dashboard</h2>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Trades"  value={perf?.total_trades ?? 0} />
        <StatCard label="Win Rate"      value={`${perf?.win_rate ?? 0}%`}    color="text-buy" />
        <StatCard label="Net P&L"       value={`$${perf?.net_pnl_usd ?? 0}`} color={perf?.net_pnl_usd >= 0 ? 'text-buy' : 'text-sell'} />
        <StatCard label="Total Losses"  value={perf?.losses ?? 0}            color="text-sell" />
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-4">Latest Signals</h3>
        {signals.length === 0 ? (
          <p className="text-wait text-sm">No signals yet. Run a scan from the Scanner page.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-wait text-left border-b border-border">
                <th className="pb-2">Pair</th><th className="pb-2">Signal</th>
                <th className="pb-2">Entry</th><th className="pb-2">R:R</th><th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {signals.map(s => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-border/20">
                  <td className="py-2 font-medium">{s.symbol}</td>
                  <td className="py-2"><SignalBadge direction={s.direction} /></td>
                  <td className="py-2 text-wait">{s.entry_price ?? '—'}</td>
                  <td className="py-2 text-wait">{s.rr_ratio ?? '—'}</td>
                  <td className="py-2 text-wait capitalize">{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
