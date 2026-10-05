import { useState } from 'react'
import { signalsAPI } from '../services/api'
import { SignalBadge, Button, Loader } from '../components/common'

function WinBar({ pct }) {
  if (!pct) return <span className="text-wait">—</span>
  const color = pct >= 80 ? '#22c55e' : pct >= 65 ? '#eab308' : '#ef4444'
  const label = pct >= 80 ? 'Strong' : pct >= 65 ? 'Medium' : 'Weak'
  return (
    <div className="space-y-1 min-w-[90px]">
      <div className="flex justify-between text-xs">
        <span style={{ color }} className="font-bold">{pct}%</span>
        <span style={{ color }} className="text-xs">{label}</span>
      </div>
      <div className="w-full bg-border rounded-full h-1.5">
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

function ConfirmationTags({ items }) {
  if (!items?.length) return null
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {items.map((c, i) => (
        <span key={i} className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full border border-accent/30">
          {c}
        </span>
      ))}
    </div>
  )
}

function SignalRow({ r, index, expanded, setExpanded }) {
  const cur = r.current_price
  const curColor = !cur
    ? 'text-wait'
    : r.direction === 'BUY'
      ? cur >= r.entry_price ? 'text-buy' : 'text-sell'
      : cur <= r.entry_price ? 'text-buy' : 'text-sell'

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div
        className="grid grid-cols-9 gap-2 px-4 py-3 cursor-pointer hover:bg-border/20 items-center"
        onClick={() => setExpanded(expanded === index ? null : index)}
      >
        <div className="font-bold text-white">{r.symbol}</div>
        <div><SignalBadge direction={r.direction} /></div>
        <div className={`text-sm font-semibold ${curColor}`}>{cur ?? '—'}</div>
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <span className="text-white">{r.entry_price}</span>
            {r.entry_type && r.entry_type !== 'market' && (
              <span className="text-xs text-yellow-400">
                {r.entry_type === 'limit_ob' ? '📦OB' : '📊FVG'}
              </span>
            )}
          </div>
          {r.entry_status && (
            <div className={`text-xs mt-0.5 ${
              r.entry_valid === false ? 'text-sell' :
              r.entry_status.startsWith('Wait') ? 'text-yellow-400' : 'text-buy'
            }`}>
              {r.entry_valid === false ? '⛔ Stale' :
               r.entry_status.startsWith('Wait') ? '⏳ Pending' : '✅ Valid'}
            </div>
          )}
        </div>
        <div className="text-sell text-sm">{r.stop_loss}</div>
        <div className="text-buy text-sm">{r.take_profit}</div>
        <div className="text-wait text-sm">{r.rr_ratio}</div>
        <div><WinBar pct={r.win_probability} /></div>
        <div className="text-wait text-xs text-right">{r.session} {expanded === index ? '▲' : '▼'}</div>
      </div>

      {expanded === index && (
        <div className="border-t border-border px-4 py-4 bg-dark/40 space-y-3">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-wait text-xs mb-1">H4 Trend</p>
              <p className={r.h4_trend === 'BULLISH' ? 'text-buy font-semibold' : 'text-sell font-semibold'}>{r.h4_trend}</p>
            </div>
            <div>
              <p className="text-wait text-xs mb-1">H1 Trend</p>
              <p className={r.h1_trend === 'BULLISH' ? 'text-buy font-semibold' : 'text-sell font-semibold'}>{r.h1_trend}</p>
            </div>
            <div>
              <p className="text-wait text-xs mb-1">Lot Size</p>
              <p className="text-white font-semibold">{r.lot_size}</p>
            </div>
            <div>
              <p className="text-wait text-xs mb-1">Risk</p>
              <p className="text-white font-semibold">${r.risk_usd}</p>
            </div>
            <div>
              <p className="text-wait text-xs mb-1">SL Pips</p>
              <p className="text-sell font-semibold">{r.sl_pips}</p>
            </div>
            <div>
              <p className="text-wait text-xs mb-1">TP Pips</p>
              <p className="text-buy font-semibold">{r.tp_pips}</p>
            </div>
            <div>
              <p className="text-wait text-xs mb-1">Strategy</p>
              <p className="text-accent text-xs">{r.strategy}</p>
            </div>
            <div>
              <p className="text-wait text-xs mb-1">Entry Type</p>
              <p className={`text-xs font-semibold ${
                r.entry_type === 'limit_ob' ? 'text-yellow-400' :
                r.entry_type === 'limit_fvg' ? 'text-purple-400' : 'text-white'
              }`}>
                {r.entry_type === 'limit_ob' ? '📦 Limit @ Order Block' :
                 r.entry_type === 'limit_fvg' ? '📊 Limit @ FVG' : '⚡ Market Order'}
              </p>
            </div>
            <div>
              <p className="text-wait text-xs mb-1">Spread</p>
              <p className="text-white">{r.spread} pips</p>
            </div>
            <div className="col-span-2">
              <p className="text-wait text-xs mb-1">Entry Status</p>
              <p className={`text-xs font-semibold ${
                r.entry_valid === false ? 'text-sell' :
                r.entry_status?.startsWith('Wait') ? 'text-yellow-400' : 'text-buy'
              }`}>{r.entry_status ?? '—'}</p>
            </div>
          </div>

          <div>
            <p className="text-wait text-xs mb-1">Confirmations ({r.confirmations?.length})</p>
            <ConfirmationTags items={r.confirmations} />
          </div>

          <div className="bg-border/30 rounded-lg px-3 py-2">
            <p className="text-wait text-xs mb-1">Win Probability Score</p>
            <div className="flex items-center gap-3">
              <WinBar pct={r.win_probability} />
              <p className="text-xs text-wait">
                {r.win_probability >= 80
                  ? '✅ Strong signal — recommended'
                  : r.win_probability >= 65
                    ? '⚠️ Medium signal — trade with caution'
                    : '❌ Weak signal — consider skipping'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Scanner() {
  const [results, setResults]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [lastScan, setLastScan] = useState(null)
  const [expanded, setExpanded] = useState(null)

  const runScan = async () => {
    setLoading(true)
    setExpanded(null)
    try {
      const res = await signalsAPI.scan()
      setResults(res.data)
      setLastScan(new Date().toLocaleTimeString())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const signals    = results.filter(r => r.direction !== 'NO TRADE')
  const noTrades   = results.filter(r => r.direction === 'NO TRADE')
  const sortedSigs = [...signals].sort((a, b) => (b.win_probability || 0) - (a.win_probability || 0))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Multi-Pair Scanner</h2>
          {lastScan && <p className="text-wait text-xs mt-1">Last scan: {lastScan}</p>}
        </div>
        <Button onClick={runScan} disabled={loading}>
          {loading ? 'Scanning...' : '🔍 Run Scan'}
        </Button>
      </div>

      {loading && <Loader />}

      {!loading && results.length > 0 && (
        <>
          {sortedSigs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">
                🎯 Active Signals ({sortedSigs.length})
                <span className="text-wait font-normal ml-2 text-xs">sorted by win probability</span>
              </h3>
              <div className="grid grid-cols-9 gap-2 px-4 py-2 text-xs text-wait border-b border-border bg-dark/50">
                <div>Pair</div>
                <div>Signal</div>
                <div>Current</div>
                <div>Entry</div>
                <div>Stop Loss</div>
                <div>Take Profit</div>
                <div>R:R</div>
                <div>Win %</div>
                <div className="text-right">Session</div>
              </div>
              {sortedSigs.map((r, i) => (
                <SignalRow key={i} r={r} index={i} expanded={expanded} setExpanded={setExpanded} />
              ))}
            </div>
          )}

          {noTrades.length > 0 && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-2 border-b border-border bg-dark/50">
                <p className="text-wait text-xs">No Trade Pairs ({noTrades.length})</p>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {noTrades.map((r, i) => (
                    <tr key={i} className="border-b border-border/30">
                      <td className="px-4 py-2 text-wait font-semibold">{r.symbol}</td>
                      <td className="px-4 py-2"><SignalBadge direction={r.direction} /></td>
                      <td className="px-4 py-2 text-wait text-xs">{r.reason?.[0] ?? '—'}</td>
                      <td className="px-4 py-2 text-wait text-xs text-right">{r.session}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {!loading && results.length === 0 && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <p className="text-wait">Click "Run Scan" to analyze all currency pairs</p>
        </div>
      )}
    </div>
  )
}
