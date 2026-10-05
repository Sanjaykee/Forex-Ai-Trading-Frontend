export function StatCard({ label, value, color = 'text-white' }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-xs text-wait mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

export function SignalBadge({ direction }) {
  const styles = {
    BUY:      'bg-buy/20 text-buy',
    SELL:     'bg-sell/20 text-sell',
    'NO TRADE': 'bg-wait/20 text-wait',
  }
  const icons = { BUY: '📈', SELL: '📉', 'NO TRADE': '⏳' }
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[direction] || styles['NO TRADE']}`}>
      {icons[direction]} {direction}
    </span>
  )
}

export function Loader() {
  return (
    <div className="flex items-center justify-center h-32">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export function Button({ children, onClick, variant = 'primary', disabled = false, className = '' }) {
  const styles = {
    primary:  'bg-accent hover:bg-accent/80 text-white',
    success:  'bg-buy hover:bg-buy/80 text-white',
    danger:   'bg-sell hover:bg-sell/80 text-white',
    ghost:    'bg-border hover:bg-border/80 text-white',
  }
  return (
    <button onClick={onClick} disabled={disabled}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${styles[variant]} ${className}`}>
      {children}
    </button>
  )
}
