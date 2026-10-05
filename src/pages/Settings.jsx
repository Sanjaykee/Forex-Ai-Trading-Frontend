import { useEffect, useState } from 'react'
import { settingsAPI } from '../services/api'
import { Button, Loader } from '../components/common'

export default function Settings() {
  const [mt5, setMt5]         = useState({ mt5_login: '', mt5_password: '', mt5_server: '', telegram_chat_id: '' })
  const [risk, setRisk]       = useState({ max_risk_usd: 1, max_trades_day: 2, max_losses_day: 2, rr_ratio: 2 })
  const [dataSource, setDataSource] = useState('yfinance')
  const [hasPassword, setHasPassword] = useState(false)
  const [hasGeminiKey, setHasGeminiKey] = useState(false)
  const [geminiKey, setGeminiKey] = useState('')
  const [telegramChatId, setTelegramChatId] = useState('')
  const [telegramStatus, setTelegramStatus] = useState('')
  const [testingTelegram, setTestingTelegram] = useState(false)
  const [metaApi, setMetaApi] = useState({ token: '', account_id: '', region: 'new-york' })
  const [metaApiStatus, setMetaApiStatus] = useState(null)
  const [savingMetaApi, setSavingMetaApi] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved]     = useState('')

  useEffect(() => {
    Promise.all([
      settingsAPI.get().then(r => {
        const s = r.data
        setRisk({
          max_risk_usd:   parseFloat(s.max_risk_usd  || 1),
          max_trades_day: parseInt(s.max_trades_day  || 2),
          max_losses_day: parseInt(s.max_losses_day  || 2),
          rr_ratio:       parseFloat(s.rr_ratio      || 2),
        })
        setDataSource(s.data_source || (s.mt5_login ? 'mt5' : 'yfinance'))
        setHasPassword(!!s.has_mt5_password)
        setHasGeminiKey(!!s.has_gemini_key)
        setTelegramChatId(s.telegram_chat_id || '')
        setMt5(prev => ({
          ...prev,
          mt5_login:        s.mt5_login || '',
          mt5_server:       s.mt5_server || '',
          telegram_chat_id: s.telegram_chat_id || '',
        }))
      }),
      settingsAPI.getMetaApiStatus().then(r => {
        if (r.data?.configured) {
          setMetaApiStatus(r.data)
        }
      }).catch(() => {})
    ]).finally(() => setLoading(false))
  }, [])

  const saveMetaApi = async () => {
    if (!metaApi.token.trim() || !metaApi.account_id.trim()) {
      setSaved('⚠️ Please enter both MetaApi Token and Account ID')
      setTimeout(() => setSaved(''), 4000)
      return
    }
    setSavingMetaApi(true)
    try {
      const res = await settingsAPI.setupMetaApi({
        metaapi_token: metaApi.token.trim(),
        metaapi_account_id: metaApi.account_id.trim(),
        metaapi_region: metaApi.region || 'new-york'
      })
      if (res.data?.success) {
        setMetaApiStatus({ configured: true, connected: true, account: res.data.account })
        setDataSource('metaapi')
        setSaved(res.data?.message || 'MetaApi Connected!')
      } else {
        setSaved(res.data?.message || 'Failed to connect MetaApi')
      }
      setTimeout(() => setSaved(''), 5000)
    } catch (e) {
      setSaved('Error connecting to MetaApi')
      setTimeout(() => setSaved(''), 4000)
    } finally {
      setSavingMetaApi(false)
    }
  }

  const handleDataSourceChange = async (val) => {
    setDataSource(val)
    try {
      await settingsAPI.update({ ...risk, data_source: val, telegram_chat_id: telegramChatId })
      setSaved(`Data source switched to ${val === 'mt5' ? 'MetaTrader 5' : 'Yahoo Finance'}`)
      setTimeout(() => setSaved(''), 3000)
    } catch (e) {
      console.error(e)
    }
  }

  const saveMT5 = async () => {
    try {
      const res = await settingsAPI.setupMT5({ ...mt5, telegram_chat_id: telegramChatId })
      setDataSource('mt5')
      setSaved(res.data?.message || 'MT5 connected successfully!')
      setTimeout(() => setSaved(''), 4000)
    } catch (e) {
      setSaved('Failed to connect MT5')
      setTimeout(() => setSaved(''), 4000)
    }
  }

  const saveTelegram = async () => {
    try {
      await settingsAPI.update({ ...risk, data_source: dataSource, telegram_chat_id: telegramChatId.trim() })
      setSaved('Telegram Chat ID saved successfully!')
      setTimeout(() => setSaved(''), 4000)
    } catch (e) {
      setSaved('Failed to save Telegram Chat ID')
      setTimeout(() => setSaved(''), 4000)
    }
  }

  const testTelegram = async () => {
    if (!telegramChatId.trim()) {
      setTelegramStatus('⚠️ Please enter your Telegram Chat ID first.')
      return
    }
    setTestingTelegram(true)
    setTelegramStatus('Sending test message to your Telegram...')
    try {
      const res = await settingsAPI.testTelegram({ telegram_chat_id: telegramChatId.trim() })
      if (res.data?.success) {
        setTelegramStatus('✅ Test message sent! Check your Telegram app.')
      } else {
        setTelegramStatus(`⚠️ ${res.data?.message || 'Failed to send'}`)
      }
    } catch (e) {
      setTelegramStatus('⚠️ Connection error. Check server and bot token.')
    } finally {
      setTestingTelegram(false)
    }
  }

  const saveGeminiKey = async () => {
    if (!geminiKey.trim()) return
    try {
      await settingsAPI.update({ ...risk, data_source: dataSource, gemini_api_key: geminiKey.trim(), telegram_chat_id: telegramChatId })
      setHasGeminiKey(true)
      setGeminiKey('')
      setSaved('Google Gemini 1.5 Flash activated!')
      setTimeout(() => setSaved(''), 4000)
    } catch (e) {
      setSaved('Failed to save Gemini key')
      setTimeout(() => setSaved(''), 4000)
    }
  }

  const saveRisk = async () => {
    await settingsAPI.update({ ...risk, data_source: dataSource, telegram_chat_id: telegramChatId })
    setSaved('Settings saved!')
    setTimeout(() => setSaved(''), 3000)
  }

  if (loading) return <Loader />

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold text-white">Settings</h2>
      {saved && <p className="text-buy text-sm bg-buy/10 px-4 py-2 rounded-lg">{saved}</p>}

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-white">Data Source</h3>
        <p className="text-xs text-wait">Choose where to fetch market data from</p>
        {[
          { value: 'yfinance', label: 'Yahoo Finance', desc: 'Free data — no MT5 needed, works anywhere' },
          { value: 'metaapi',  label: 'MetaApi Cloud MT5 (Recommended for Mobile Trading)', desc: 'Direct cloud connection to broker — trades open on MT5 mobile with zero PC needed' },
          { value: 'mt5',      label: 'MetaTrader 5 Desktop (Local PC)', desc: 'Real broker data — requires MT5 terminal running on your Windows PC' },
        ].map(opt => (
          <label key={opt.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
            dataSource === opt.value ? 'border-accent bg-accent/10' : 'border-border'
          }`}>
            <input type="radio" name="dataSource" value={opt.value}
              checked={dataSource === opt.value}
              onChange={() => handleDataSourceChange(opt.value)}
              className="mt-1 accent-indigo-500" />
            <div>
              <p className="text-white text-sm font-medium">{opt.label}</p>
              <p className="text-wait text-xs">{opt.desc}</p>
            </div>
          </label>
        ))}
      </div>

      {/* MetaApi Cloud MT5 Card */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">⚡ MetaApi Cloud Bridge (MT5 Mobile Real Execution)</h3>
          {metaApiStatus?.connected && (
            <span className="text-[10px] text-buy font-medium bg-buy/10 px-2 py-0.5 rounded border border-buy/20">
              ✓ Connected ({metaApiStatus.account?.currency} {metaApiStatus.account?.balance})
            </span>
          )}
        </div>
        <p className="text-xs text-wait">
          Connects your broker MT5 account directly from the cloud. When you approve trades, orders automatically open inside your <strong>MT5 Mobile App</strong> with no PC needed. Get free API token at <a href="https://app.metaapi.cloud" target="_blank" rel="noreferrer" className="text-accent underline">app.metaapi.cloud</a>.
        </p>
        <div>
          <label className="text-xs text-wait block mb-1">MetaApi Token</label>
          <input
            type="password"
            placeholder={metaApiStatus?.configured ? "•••••••••••••••• (Saved in Cloud)" : "Paste your MetaApi API Token"}
            className="w-full bg-dark border border-border rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-accent"
            value={metaApi.token}
            onChange={e => setMetaApi({ ...metaApi, token: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-wait block mb-1">MetaApi Account ID</label>
          <input
            type="text"
            placeholder={metaApiStatus?.configured ? "Account ID Active" : "e.g. 5e1b8c2e-4b2a-4a6c-9c71-..."}
            className="w-full bg-dark border border-border rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-accent"
            value={metaApi.account_id}
            onChange={e => setMetaApi({ ...metaApi, account_id: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-wait block mb-1">Broker Region</label>
          <select
            className="w-full bg-dark border border-border rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-accent"
            value={metaApi.region}
            onChange={e => setMetaApi({ ...metaApi, region: e.target.value })}
          >
            <option value="new-york">New York (Standard)</option>
            <option value="london">London</option>
            <option value="singapore">Singapore</option>
            <option value="frankfurt">Frankfurt</option>
          </select>
        </div>
        <Button onClick={saveMetaApi} disabled={savingMetaApi}>
          {savingMetaApi ? "Connecting to MT5..." : "Connect MetaApi Cloud MT5"}
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-white">MT5 Connection (Optional for PC)</h3>
        {[
          { label: 'MT5 Login',    key: 'mt5_login',        type: 'text'     },
          { label: 'MT5 Password', key: 'mt5_password',     type: 'password', placeholder: hasPassword ? '•••••••• (Saved in Database)' : 'Enter MT5 password' },
          { label: 'MT5 Server',   key: 'mt5_server',       type: 'text',    placeholder: 'e.g. ICMarkets-Demo' },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-wait block">{label}</label>
              {key === 'mt5_password' && hasPassword && !mt5.mt5_password && (
                <span className="text-[10px] text-buy font-medium">✓ Saved & Active</span>
              )}
            </div>
            <input type={type} placeholder={placeholder}
              className="w-full bg-dark border border-border rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-accent"
              value={mt5[key]} onChange={e => setMt5({ ...mt5, [key]: e.target.value })} />
          </div>
        ))}
        <Button onClick={saveMT5}>Connect MT5</Button>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">Telegram Alerts (Mobile Push Notifications)</h3>
          {telegramChatId && (
            <span className="text-[10px] text-buy font-medium bg-buy/10 px-2 py-0.5 rounded border border-buy/20">
              ✓ Alerts Active
            </span>
          )}
        </div>
        <p className="text-xs text-wait">
          Receive real-time institutional trade alerts, Dynamic Ladder targets, and Stop Loss updates directly on your mobile Telegram app.
          To get your Chat ID: message <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-accent underline">@userinfobot</a> on Telegram.
        </p>
        <div>
          <label className="text-xs text-wait block mb-1">Your Telegram Chat ID</label>
          <input
            type="text"
            placeholder="e.g. 123456789"
            className="w-full bg-dark border border-border rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-accent"
            value={telegramChatId}
            onChange={e => setTelegramChatId(e.target.value)}
          />
        </div>
        {telegramStatus && (
          <p className="text-xs px-3 py-1.5 rounded bg-dark border border-border text-white">
            {telegramStatus}
          </p>
        )}
        <div className="flex gap-3">
          <Button onClick={saveTelegram}>Save Telegram ID</Button>
          <button
            onClick={testTelegram}
            disabled={testingTelegram}
            className="px-4 py-2 text-xs font-semibold text-white bg-dark border border-border hover:border-accent rounded-lg transition-colors"
          >
            {testingTelegram ? 'Testing...' : 'Send Test Alert'}
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">Google Gemini AI Model (Chatbot)</h3>
          {hasGeminiKey && (
            <span className="text-[10px] text-buy font-medium bg-buy/10 px-2 py-0.5 rounded border border-buy/20">
              ✓ Gemini 1.5 Flash Active
            </span>
          )}
        </div>
        <p className="text-xs text-wait">
          Powers natural conversation & automatic backtest tool calling. Get a free API key with no credit card at{' '}
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-accent underline">
            Google AI Studio
          </a>.
        </p>
        <div>
          <label className="text-xs text-wait block mb-1">Gemini API Key</label>
          <input
            type="password"
            placeholder={hasGeminiKey ? '•••••••••••••••••••• (Active)' : 'Paste your AI Studio Gemini API Key'}
            className="w-full bg-dark border border-border rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-accent"
            value={geminiKey}
            onChange={e => setGeminiKey(e.target.value)}
          />
        </div>
        <Button onClick={saveGeminiKey}>Save Gemini Key</Button>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-white">Risk Management</h3>
        {[
          { label: 'Max Risk Per Trade ($)', key: 'max_risk_usd',   step: 0.5  },
          { label: 'Max Trades Per Day',     key: 'max_trades_day', step: 1    },
          { label: 'Max Losses Per Day',     key: 'max_losses_day', step: 1    },
          { label: 'Risk:Reward Ratio (1:X)',key: 'rr_ratio',       step: 0.5  },
        ].map(({ label, key, step }) => (
          <div key={key}>
            <label className="text-xs text-wait block mb-1">{label}</label>
            <input type="number" step={step} min={0}
              className="w-full bg-dark border border-border rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-accent"
              value={risk[key]} onChange={e => setRisk({ ...risk, [key]: parseFloat(e.target.value) })} />
          </div>
        ))}
        <Button onClick={saveRisk}>Save Settings</Button>
      </div>
    </div>
  )
}
