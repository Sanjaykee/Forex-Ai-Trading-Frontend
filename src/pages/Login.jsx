import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import useStore from '../store/signalStore'

export default function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm]             = useState({ email: '', password: '', full_name: '' })
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const { setAuth }                 = useStore()
  const navigate                    = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = isRegister
        ? await authAPI.register(form)
        : await authAPI.login({ email: form.email, password: form.password })
      setAuth({ email: form.email }, res.data.access_token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-1">🤖 ForexAI</h1>
        <p className="text-wait text-sm mb-6">{isRegister ? 'Create your account' : 'Sign in to your account'}</p>

        <form onSubmit={handle} className="space-y-4">
          {isRegister && (
            <input className="w-full bg-dark border border-border rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-accent"
              placeholder="Full Name" value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })} required />
          )}
          <input className="w-full bg-dark border border-border rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-accent"
            placeholder="Email" type="email" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input className="w-full bg-dark border border-border rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-accent"
            placeholder="Password" type="password" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} required />

          {error && <p className="text-sell text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-accent hover:bg-accent/80 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50">
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-wait text-sm mt-4">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <button onClick={() => setIsRegister(!isRegister)} className="text-accent ml-1 hover:underline">
            {isRegister ? 'Login' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  )
}
