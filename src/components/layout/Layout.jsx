import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Radio, TrendingUp, BookOpen, BarChart2, Settings, LogOut, Bot } from 'lucide-react'
import useStore from '../../store/signalStore'

const nav = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/scanner',     icon: Radio,           label: 'Scanner'     },
  { to: '/signals',     icon: TrendingUp,      label: 'Signals'     },
  { to: '/trades',      icon: BookOpen,        label: 'Trades'      },
  { to: '/performance', icon: BarChart2,        label: 'Performance' },
  { to: '/chat',        icon: Bot,             label: 'AI Chat'     },
  { to: '/settings',    icon: Settings,        label: 'Settings'    },
]

export default function Layout({ children }) {
  const { logout } = useStore()
  const navigate   = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen bg-dark">
      <aside className="w-56 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h1 className="text-accent font-bold text-lg">🤖 ForexAI</h1>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
              (import.meta.env.VITE_ACTIVE_PROFILE || '').toLowerCase() === 'prod' || import.meta.env.PROD
                ? 'bg-buy/20 text-buy border border-buy/30'
                : 'bg-accent/20 text-accent border border-accent/30'
            }`}>
              {(import.meta.env.VITE_ACTIVE_PROFILE || '').toLowerCase() === 'prod' || import.meta.env.PROD ? 'PROD' : 'LOCAL'}
            </span>
          </div>
          <p className="text-xs text-wait mt-0.5">$1 Risk Per Trade</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-accent text-white' : 'text-wait hover:text-white hover:bg-border'
                }`}>
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-6 py-4 text-sm text-wait hover:text-sell border-t border-border">
          <LogOut size={16} /> Logout
        </button>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
