import { create } from 'zustand'

const useStore = create((set) => ({
  user:        null,
  token:       localStorage.getItem('token') || null,
  signals:     [],
  trades:      [],
  performance: null,

  setAuth: (user, token) => {
    localStorage.setItem('token', token)
    set({ user, token })
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null, signals: [], trades: [] })
  },

  setSignals:     (signals)     => set({ signals }),
  setTrades:      (trades)      => set({ trades }),
  setPerformance: (performance) => set({ performance }),
}))

export default useStore
