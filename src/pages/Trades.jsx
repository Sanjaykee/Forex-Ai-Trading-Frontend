import { useEffect, useState } from 'react'
import { tradesAPI } from '../services/api'
import { Loader } from '../components/common'

export default function Trades() {
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    tradesAPI.getAll().then(r => setTrades(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  const wins   = trades.filter(t => t.result === 'WIN').length
  const losses = trades.filter(t => t.result === 'LOSS').length
  const net    = trades.reduce((sum, t) => sum + (t.profit_usd || 0), 0)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Trade Journal</h2>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-wait">Total Trades</p>
          <p className="text-2xl font-bold text-white">{trades.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-wait">Wins</p>
          <p className="text-2xl font-bold text-buy">{wins}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-wait">Losses</p>
          <p className="text-2xl font-bold text-sell">{losses}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-wait">Net P&L</p>
          <p className={`text-2xl font-bold ${net >= 0 ? 'text-buy' : 'text-sell'}`}>${net.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-wait text-left border-b border-border bg-dark/50">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Pair</th>
              <th className="px-4 py-3">Direction</th>
              <th className="px-4 py-3">Entry</th>
              <th className="px-4 py-3">Close</th>
              <th className="px-4 py-3">Result</th>
              <th className="px-4 py-3">P&L</th>
              <th className="px-4 py-3">R:R</th>
            </tr>
          </thead>
          <tbody>
            {trades.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-wait">No trades yet</td></tr>
            ) : trades.map(t => (
              <tr key={t.id} className="border-b border-border/50 hover:bg-border/20">
                <td className="px-4 py-3 text-wait">{t.open_time ? new Date(t.open_time).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3 font-semibold text-white">{t.symbol}</td>
                <td className="px-4 py-3">
                  <span className={t.direction === 'BUY' ? 'text-buy' : 'text-sell'}>{t.direction}</span>
                </td>
                <td className="px-4 py-3 text-wait">{t.entry_price}</td>
                <td className="px-4 py-3 text-wait">{t.close_price ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    t.result === 'WIN' ? 'bg-buy/20 text-buy' : t.result === 'LOSS' ? 'bg-sell/20 text-sell' : 'bg-wait/20 text-wait'
                  }`}>{t.result ?? 'OPEN'}</span>
                </td>
                <td className={`px-4 py-3 font-medium ${(t.profit_usd || 0) >= 0 ? 'text-buy' : 'text-sell'}`}>
                  {t.profit_usd != null ? `$${t.profit_usd.toFixed(2)}` : '—'}
                </td>
                <td className="px-4 py-3 text-wait">{t.actual_rr ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
