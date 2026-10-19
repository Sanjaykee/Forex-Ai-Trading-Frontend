import { useState } from 'react'
import { signalsAPI } from '../services/api'
import { SignalBadge, Button, Loader } from '../components/common'

function WinBar({ pct }) {
  if (!pct) return <span className="text-wait">—</span>
  const color = pct >= 75 ? '#22c55e' : pct >= 55 ? '#eab308' : '#ef4444'
  const label = pct >= 75 ? 'High' : pct >= 55 ? 'Medium' : 'Low'
  return (
    <div className="space-y-1 min-w-[90px]">
      <div className="flex justify-between text-xs">
        <span style={{ color }} className="font-bold">{pct}</span>
        <span style={{ color }} className="text-xs">{label}</span>
      </div>
      <div className="w-full bg-border rounded-full h-1.5">
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }} />
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

function ConfidenceBadge({ conf }) {
  const map = {
    HIGH:   'bg-buy/20 text-buy border-buy/40',
    MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    LOW:    'bg-sell/20 text-sell border-sell/40',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${map[conf] ?? 'text-wait'}`}>
      {conf}
    </span>
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
      {/* ── Main row ── */}
      <div
        className="grid grid-cols-10 gap-2 px-4 py-3 cursor-pointer hover:bg-border/20 items-center"
        onClick={() => setExpanded(expanded === index ? null : index)}
      >
        <div className="font-bold text-white">{r.symbol}</div>
        <div className="text-xs font-bold text-accent">{r.timeframe ?? 'M15'}</div>
        <div><SignalBadge direction={r.direction} /></div>
        <div className={`text-sm font-semibold ${curColor}`}>{cur ?? '—'}</div>
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <span className="text-white">{r.entry_price}</span>
            <span className="text-xs text-yellow-400">📦OB</span>
          </div>
          <div className="text-xs mt-0.5 text-buy">✅ Valid</div>
        </div>
        <div className="text-sell text-sm">{r.stop_loss}</div>
        <div className="text-buy text-sm">{r.take_profit}</div>
        <div className="text-wait text-sm">{r.rr_ratio}</div>
        <div><WinBar pct={r.win_probability} /></div>
        <div className="text-wait text-xs text-right">
          {r.session}<br />{expanded === index ? '▲' : '▼'}
        </div>
      </div>

      {/* ── Expanded detail ── */}
      {expanded === index && (
        <div className="border-t border-border px-4 py-4 bg-dark/40 space-y-3">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-wait text-xs mb-1">Timeframe</p>
              <p className="text-accent font-bold">{r.timeframe ?? 'M15'}</p>
            </div>
            <div>
              <p className="text-wait text-xs mb-1">Pattern</p>
              <p className="text-white text-xs">{r.strategy}</p>
            </div>
            <div>
              <p className="text-wait text-xs mb-1">Confidence</p>
              <ConfidenceBadge conf={r.confidence} />
            </div>
            <div>
              <p className="text-wait text-xs mb-1">Score</p>
              <p className="text-white font-semibold">{r.score ?? r.win_probability}</p>
            </div>
            <div>
              <p className="text-wait text-xs mb-1">HTF Bias</p>
              <p className={r.h4_trend === 'BULLISH' ? 'text-buy font-semibold' : 'text-sell font-semibold'}>
                {r.h4_trend ?? '—'} {r.htf_aligned ? '✅' : '⚠️'}
              </p>
            </div>
            <div>
              <p className="text-wait text-xs mb-1">Killzone</p>
              <p className="text-white text-xs">{r.killzone ?? '—'}</p>
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
              <p className="text-wait text-xs mb-1">TP 1:2</p>
              <p className="text-buy text-xs">{r.tp_1_2 ?? '—'}</p>
            </div>
            <div>
              <p className="text-wait text-xs mb-1">TP 1:3</p>
              <p className="text-buy text-xs font-semibold">{r.tp_1_3 ?? r.take_profit}</p>
            </div>
            <div>
              <p className="text-wait text-xs mb-1">TP 1:5</p>
              <p className="text-buy text-xs">{r.tp_1_5 ?? '—'}</p>
            </div>
            <div>
              <p className="text-wait text-xs mb-1">OB Zone</p>
              <p className="text-yellow-400 text-xs">{r.ob_low} – {r.ob_high}</p>
            </div>
          </div>

          <div>
            <p className="text-wait text-xs mb-1">Confirmations ({r.confirmations?.length})</p>
            <ConfirmationTags items={r.confirmations} />
          </div>

          <div className="bg-border/30 rounded-lg px-3 py-2">
            <p className="text-wait text-xs mb-1">Signal Quality</p>
            <div className="flex items-center gap-3">
              <WinBar pct={r.win_probability} />
              <p className="text-xs text-wait">
                {r.win_probability >= 75
                  ? '✅ High confidence — recommended'
                  : r.win_probability >= 55
                    ? '⚠️ Medium confidence — trade with caution'
                    : '❌ Low confidence — consider skipping'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const PATTERN_NAMES = {
  A_CHOCH:    'CHoCH + OB',
  B_BOS_SWEEP: 'BOS + Sweep',
  C_ACCUM:    'Accumulation',
}

function BacktestResults({ data, onClose }) {
  const { summary, trades } = data
  const scoreColor = (s) => s >= 75 ? '#22c55e' : s >= 55 ? '#eab308' : '#ef4444'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">📊 2-Day Backtest Results</h3>
        <button onClick={onClose} className="text-wait text-xs hover:text-white">✕ Close</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Signals', value: summary.total, color: 'text-white' },
          { label: 'Wins', value: summary.wins, color: 'text-buy' },
          { label: 'Losses', value: summary.losses, color: 'text-sell' },
          { label: 'Win Rate', value: `${summary.win_rate}%`, color: summary.win_rate >= 60 ? 'text-buy' : 'text-sell' },
        ].map(c => (
          <div key={c.label} className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-wait text-xs mb-1">{c.label}</p>
            <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Trades table */}
      {trades.length > 0 ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-9 gap-2 px-4 py-2 text-xs text-wait border-b border-border bg-dark/50">
            <div>Pair</div><div>TF</div><div>Time</div><div>Dir</div>
            <div>Pattern</div><div>Score</div><div>Conf</div>
            <div>Pips</div><div>Result</div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {trades.map((t, i) => (
              <div key={i} className="grid grid-cols-9 gap-2 px-4 py-2 text-xs border-b border-border/30 hover:bg-border/10">
                <div className="font-bold text-white">{t.symbol}</div>
                <div className="text-accent">{t.timeframe}</div>
                <div className="text-wait">{t.time?.slice(11, 16)}</div>
                <div className={t.direction === 'BUY' ? 'text-buy font-semibold' : 'text-sell font-semibold'}>{t.direction}</div>
                <div className="text-white">{PATTERN_NAMES[t.pattern] ?? t.pattern}</div>
                <div>
                  <span className="font-bold" style={{ color: scoreColor(t.score) }}>{t.score}</span>
                  <div className="w-full bg-border rounded-full h-1 mt-0.5">
                    <div className="h-1 rounded-full" style={{ width: `${Math.min(t.score, 100)}%`, backgroundColor: scoreColor(t.score) }} />
                  </div>
                </div>
                <div>
                  <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                    t.confidence === 'HIGH' ? 'bg-buy/20 text-buy' :
                    t.confidence === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-sell/20 text-sell'
                  }`}>{t.confidence}</span>
                </div>
                <div className={t.pips > 0 ? 'text-buy font-semibold' : 'text-sell font-semibold'}>
                  {t.pips > 0 ? '+' : ''}{t.pips}
                </div>
                <div>
                  <span className={`px-1.5 py-0.5 rounded font-semibold ${
                    t.outcome === 'WIN' ? 'bg-buy/20 text-buy' : 'bg-sell/20 text-sell'
                  }`}>{t.outcome === 'WIN' ? '✅ WIN' : '❌ LOSS'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-wait text-sm">No completed signals found in the last 2 days.</p>
          <p className="text-wait text-xs mt-1">This can happen if MetaApi data is limited or no patterns fired.</p>
        </div>
      )}
    </div>
  )
}

export default function Scanner() {
  const [results, setResults]       = useState([])
  const [loading, setLoading]       = useState(false)
  const [lastScan, setLastScan]     = useState(null)
  const [expanded, setExpanded]     = useState(null)
  const [btLoading, setBtLoading]   = useState(false)
  const [btResults, setBtResults]   = useState(null)

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

  const runBacktest = async () => {
    setBtLoading(true)
    setBtResults(null)
    try {
      const res = await signalsAPI.backtestQuick(2)
      setBtResults(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setBtLoading(false)
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
          <p className="text-wait text-xs mt-1">
            Scans M15 + M3 | Patterns: CHoCH+OB · BOS+Sweep · Accumulation
            {lastScan && <span className="ml-3">Last scan: {lastScan}</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runBacktest} disabled={btLoading} variant="ghost">
            {btLoading ? 'Running...' : '📊 2-Day Backtest'}
          </Button>
          <Button onClick={runScan} disabled={loading}>
            {loading ? 'Scanning...' : '🔍 Run Scan'}
          </Button>
        </div>
      </div>

      {btLoading && (
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <Loader />
          <p className="text-wait text-xs mt-2">Running 2-day backtest on all 9 pairs × 2 timeframes... this may take 30–60s</p>
        </div>
      )}

      {!btLoading && btResults && (
        <BacktestResults data={btResults} onClose={() => setBtResults(null)} />
      )}

      {loading && <Loader />}

      {!loading && results.length > 0 && (
        <>
          {sortedSigs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">
                🎯 Active Signals ({sortedSigs.length})
                <span className="text-wait font-normal ml-2 text-xs">sorted by score</span>
              </h3>
              {/* Table header */}
              <div className="grid grid-cols-10 gap-2 px-4 py-2 text-xs text-wait border-b border-border bg-dark/50">
                <div>Pair</div>
                <div>TF</div>
                <div>Signal</div>
                <div>Current</div>
                <div>Entry</div>
                <div>Stop Loss</div>
                <div>Take Profit</div>
                <div>R:R</div>
                <div>Score</div>
                <div className="text-right">Session</div>
              </div>
              {sortedSigs.map((r, i) => (
                <SignalRow key={`${r.symbol}-${r.timeframe}-${i}`} r={r} index={i} expanded={expanded} setExpanded={setExpanded} />
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
        <div className="bg-card border border-border rounded-xl p-12 text-center space-y-2">
          <p className="text-white font-semibold">Click "Run Scan" to analyze all pairs</p>
          <p className="text-wait text-xs">Scans M15 + M3 on all 9 pairs during London (07–11 UTC) and NY (12–17 UTC) sessions</p>
        </div>
      )}
    </div>
  )
}
