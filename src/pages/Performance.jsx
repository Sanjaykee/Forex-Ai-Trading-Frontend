import { useEffect, useState } from 'react'
import { performanceAPI, tradesAPI } from '../services/api'
import { StatCard, Loader } from '../components/common'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function Performance() {
  const [perf, setPerf]     = useState(null)
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([performanceAPI.get(), tradesAPI.getAll()])
      .then(([p, t]) => { setPerf(p.data); setTrades(t.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  // Build equity curve
  let equity = 0
  const equityCurve = trades.map((t, i) => {
    equity += t.profit_usd || 0
    return { trade: i + 1, equity: parseFloat(equity.toFixed(2)) }
  })

  // Win/loss by pair
  const pairStats = {}
  trades.forEach(t => {
    if (!pairStats[t.symbol]) pairStats[t.symbol] = { wins: 0, losses: 0 }
    if (t.result === 'WIN')  pairStats[t.symbol].wins++
    if (t.result === 'LOSS') pairStats[t.symbol].losses++
  })
  const pairData = Object.entries(pairStats).map(([symbol, s]) => ({ symbol, ...s }))

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Performance Analytics</h2>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Win Rate"      value={`${perf?.win_rate ?? 0}%`}         color="text-buy" />
        <StatCard label="Net P&L"       value={`$${perf?.net_pnl_usd ?? 0}`}      color={perf?.net_pnl_usd >= 0 ? 'text-buy' : 'text-sell'} />
        <StatCard label="Total Profit"  value={`$${perf?.total_profit_usd ?? 0}`} color="text-buy" />
        <StatCard label="Total Loss"    value={`$${perf?.total_loss_usd ?? 0}`}   color="text-sell" />
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-4">Equity Curve</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={equityCurve}>
            <XAxis dataKey="trade" stroke="#94a3b8" tick={{ fontSize: 11 }} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 8 }} />
            <Line type="monotone" dataKey="equity" stroke="#6366f1" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {pairData.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Win/Loss by Pair</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pairData}>
              <XAxis dataKey="symbol" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 8 }} />
              <Bar dataKey="wins"   fill="#22c55e" radius={[4,4,0,0]} />
              <Bar dataKey="losses" fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
