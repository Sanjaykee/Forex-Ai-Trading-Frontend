import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useStore from './store/signalStore'
import Layout      from './components/layout/Layout'
import Login       from './pages/Login'
import Dashboard   from './pages/Dashboard'
import Scanner     from './pages/Scanner'
import Signals     from './pages/Signals'
import Trades      from './pages/Trades'
import Performance from './pages/Performance'
import Settings    from './pages/Settings'
import Chat        from './pages/Chat'

function Protected({ children }) {
  const { token } = useStore()
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/*" element={
          <Protected>
            <Layout>
              <Routes>
                <Route path="/dashboard"   element={<Dashboard />}   />
                <Route path="/scanner"     element={<Scanner />}     />
                <Route path="/signals"     element={<Signals />}     />
                <Route path="/trades"      element={<Trades />}      />
                <Route path="/performance" element={<Performance />} />
                <Route path="/chat"        element={<Chat />}        />
                <Route path="/settings"    element={<Settings />}    />
              </Routes>
            </Layout>
          </Protected>
        } />
      </Routes>
    </BrowserRouter>
  )
}
