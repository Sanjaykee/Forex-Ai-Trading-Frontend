import { useEffect, useState } from 'react'
import { signalsAPI } from '../services/api'
import { SignalBadge, Button, Loader } from '../components/common'

export default function Signals() {
  const [signals, setSignals] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    signalsAPI.history().then(r => setSignals(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const approve = async (id) => {
    await signalsAPI.approve(id)
    load()
  }

  const reject = async (id) => {
    await signalsAPI.reject(id)
    load()
  }

  if (loading) return <Loader />

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Signals</h2>

      {signals.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <p className="text-wait">No signals yet. Go to Scanner to generate signals.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {signals.map(s => (
            <div key={s.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">{s.symbol}</span>
                  <SignalBadge direction={s.direction} />
                  <span className="text-xs text-wait">{s.strategy}</span>
                </div>
                <span className="text-xs text-wait capitalize px-2 py-1 bg-border rounded">{s.status}</span>
              </div>

              <div className="grid grid-cols-5 gap-4 text-sm mb-3">
                <div><p className="text-wait text-xs">Entry</p><p className="text-white font-medium">{s.entry_price}</p></div>
                <div><p className="text-wait text-xs">Stop Loss</p><p className="text-sell font-medium">{s.stop_loss}</p></div>
                <div><p className="text-wait text-xs">Take Profit</p><p className="text-buy font-medium">{s.take_profit}</p></div>
                <div><p className="text-wait text-xs">R:R</p><p className="text-white font-medium">{s.rr_ratio}</p></div>
                <div><p className="text-wait text-xs">Lot Size</p><p className="text-white font-medium">{s.lot_size}</p></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                  {(s.confirmations || []).map((c, i) => (
                    <span key={i} className="text-xs bg-buy/10 text-buy px-2 py-0.5 rounded">✅ {c}</span>
                  ))}
                </div>
                {s.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button variant="success" onClick={() => approve(s.id)}>✅ Approve</Button>
                    <Button variant="danger"  onClick={() => reject(s.id)}>❌ Reject</Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
