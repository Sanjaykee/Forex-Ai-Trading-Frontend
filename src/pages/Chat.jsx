import { useState, useRef, useEffect } from 'react'
import { chatAPI } from '../services/api'
import { Send, Bot, User, Sparkles, TrendingUp, RotateCcw } from 'lucide-react'

// ── Markdown renderer ─────────────────────────────────────────────────────────

function renderInline(text) {
  // Bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} className="text-white font-semibold">{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>
  )
}

function TableRow({ cells, isHeader }) {
  const Tag = isHeader ? 'th' : 'td'
  return (
    <tr className={isHeader ? 'bg-accent/10' : 'border-t border-border/40 hover:bg-white/5'}>
      {cells.map((c, i) => (
        <Tag key={i} className={`px-3 py-1.5 text-xs ${isHeader ? 'text-accent font-semibold text-left' : 'text-white/90'}`}>
          {renderInline(c.trim())}
        </Tag>
      ))}
    </tr>
  )
}

function MarkdownTable({ lines }) {
  const rows = lines.filter(l => !l.match(/^\|[\s:|-]+\|$/))
  const [header, ...body] = rows
  const parseRow = l => l.replace(/^\||\|$/g, '').split('|')
  return (
    <div className="overflow-x-auto my-2 rounded-lg border border-border/60">
      <table className="w-full text-xs">
        <thead><TableRow cells={parseRow(header)} isHeader /></thead>
        <tbody>{body.map((r, i) => <TableRow key={i} cells={parseRow(r)} />)}</tbody>
      </table>
    </div>
  )
}

function renderFormatted(text) {
  const lines = text.split('\n')
  const output = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Table block — collect consecutive pipe lines
    if (line.trim().startsWith('|')) {
      const tableLines = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i])
        i++
      }
      output.push(<MarkdownTable key={i} lines={tableLines} />)
      continue
    }

    // H2 heading **text**
    if (line.startsWith('## ')) {
      output.push(
        <h3 key={i} className="text-sm font-bold text-white mt-4 mb-1">
          {renderInline(line.slice(3))}
        </h3>
      )
      i++; continue
    }

    // Emoji heading lines like 📊 **text**
    if (/^[📊🔍🏆✅⚠️🔴🟢🟡💔🔭]/.test(line) && line.includes('**')) {
      output.push(
        <p key={i} className="text-sm font-semibold text-white mt-3 mb-1">
          {renderInline(line)}
        </p>
      )
      i++; continue
    }

    // Bullet point
    if (line.startsWith('- ')) {
      output.push(
        <div key={i} className="flex gap-2 items-start my-0.5">
          <span className="text-accent mt-0.5 shrink-0">•</span>
          <p className="text-xs text-white/90">{renderInline(line.slice(2))}</p>
        </div>
      )
      i++; continue
    }

    // Empty line
    if (line.trim() === '') {
      output.push(<div key={i} className="h-2" />)
      i++; continue
    }

    // Normal line
    output.push(
      <p key={i} className="text-xs leading-relaxed text-white/90">
        {renderInline(line)}
      </p>
    )
    i++
  }

  return output
}

// ── Main Chat component ───────────────────────────────────────────────────────

const SUGGESTED = [
  'backtest all pairs M3 last 2 days 1:3',
  'backtest GBPJPY M15 last 7 days 1:3',
  'backtest EURUSD M3 last 15 days 1:2',
  'give signal',
  'backtest all pairs M15 last 15 days 1:3',
]

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 **ForexAI ready.** Ask me to backtest any pair, scan live signals, or check session win rates.',
    },
  ])
  const [input, setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (text) => {
    const msg = text || input
    if (!msg.trim() || loading) return
    setMessages(p => [...p, { role: 'user', content: msg }])
    if (!text) setInput('')
    setLoading(true)
    try {
      const res = await chatAPI.send(msg)
      setMessages(p => [...p, { role: 'assistant', content: res.data.reply || 'No response.' }])
    } catch {
      setMessages(p => [...p, { role: 'assistant', content: '⚠️ Connection error. Check backend.' }])
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => setMessages([{
    role: 'assistant',
    content: '👋 **ForexAI ready.** Ask me to backtest any pair, scan live signals, or check session win rates.',
  }])

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              ForexAI Chatbot <Sparkles size={14} className="text-accent" />
            </h2>
            <p className="text-xs text-wait">SMC strategy · M3 + M15 · CHoCH · Order Block · Liquidity Sweep</p>
          </div>
        </div>
        <button onClick={clearChat} className="text-wait hover:text-white p-2 rounded-lg hover:bg-border transition-colors" title="Clear chat">
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Suggested prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 no-scrollbar">
        {SUGGESTED.map((p, i) => (
          <button key={i} onClick={() => handleSend(p)}
            className="text-xs whitespace-nowrap bg-card border border-border hover:border-accent text-wait hover:text-white px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 shrink-0">
            <TrendingUp size={11} className="text-accent" /> {p}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>

            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-accent shrink-0 mt-1">
                <Bot size={15} />
              </div>
            )}

            <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
              m.role === 'user'
                ? 'bg-accent text-white font-medium rounded-tr-none max-w-[75%]'
                : 'bg-card border border-border text-white rounded-tl-none max-w-[90%] space-y-0.5'
            }`}>
              {m.role === 'assistant' ? renderFormatted(m.content) : m.content}
            </div>

            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-border flex items-center justify-center text-white shrink-0 mt-1">
                <User size={15} />
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-accent shrink-0">
              <Bot size={15} />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-wait">Running SMC backtest on live candles...</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={e => { e.preventDefault(); handleSend() }}
        className="mt-3 pt-3 border-t border-border flex gap-2 items-center">
        <input
          type="text"
          placeholder="e.g. backtest all pairs M3 last 7 days 1:3  or  give signal"
          className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-accent transition-colors placeholder:text-wait/50"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={!input.trim() || loading}
          className="bg-accent hover:bg-accent/80 disabled:opacity-40 text-white px-5 py-3 rounded-xl flex items-center justify-center transition-colors">
          <Send size={15} />
        </button>
      </form>
    </div>
  )
}
