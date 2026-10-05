import { useState, useRef, useEffect } from 'react'
import { chatAPI } from '../services/api'
import { Send, Bot, User, Sparkles, TrendingUp, BarChart2 } from 'lucide-react'

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        '👋 **Hello! I am your ForexAI Backtest Analyst.**\n\n' +
        'Ask me any question about historical performance, win ratios, or strategy setups across M1, M3, M5, M15, M30, H1, and H4!\n\n' +
        'Try clicking one of the suggested prompts below or type your own question.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const handleSend = async (textToSend) => {
    const text = textToSend || input
    if (!text.trim() || loading) return

    const userMsg = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInput('')
    setLoading(true)

    try {
      const res = await chatAPI.send(text)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.data.reply || 'No response generated.' },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Failed to connect to AI Analyst service. Please check your backend connection.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const suggestedPrompts = [
    'EURUSD M3 entries for last 1 week with win ratio',
    'GBPUSD on M15 win rate last 14 days',
    'EURUSD on M5 during London session',
    'USDJPY on M3 vs H1 comparison',
  ]

  // Helper to format basic markdown-like lines
  const renderFormatted = (text) => {
    const lines = text.split('\n')
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-sm font-bold text-accent mt-3 mb-1">
            {line.replace('### ', '')}
          </h4>
        )
      }
      if (line.startsWith('- ')) {
        return (
          <p key={idx} className="text-xs text-white/90 pl-3 border-l-2 border-accent/40 my-0.5">
            {line.replace('- ', '')}
          </p>
        )
      }
      if (line.trim().length === 0) {
        return <div key={idx} className="h-1.5" />
      }
      return (
        <p key={idx} className="text-xs leading-relaxed text-white/90">
          {line}
        </p>
      )
    })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
            <Bot size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              ForexAI Chatbot <Sparkles size={16} className="text-accent" />
            </h2>
            <p className="text-xs text-wait">
              Backtesting engine powered by 2.8M real MT5 market candles
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 no-scrollbar">
        {suggestedPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p)}
            className="text-xs whitespace-nowrap bg-card border border-border hover:border-accent text-wait hover:text-white px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
          >
            <TrendingUp size={12} className="text-accent" /> {p}
          </button>
        ))}
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-accent shrink-0 mt-1">
                <Bot size={16} />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-xl p-4 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-accent text-white font-medium rounded-tr-none'
                  : 'bg-card border border-border text-white rounded-tl-none shadow-sm space-y-1'
              }`}
            >
              {m.role === 'assistant' ? renderFormatted(m.content) : m.content}
            </div>
            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-border flex items-center justify-center text-white shrink-0 mt-1">
                <User size={16} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-accent shrink-0">
              <Bot size={16} />
            </div>
            <div className="bg-card border border-border rounded-xl px-4 py-3 text-xs text-wait flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
              Analyzing historical candles and running SMC backtest...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
        className="mt-4 pt-3 border-t border-border flex gap-2"
      >
        <input
          type="text"
          placeholder="Ask e.g.: If I enter 3 mins timeframe for last 1 week what is winning ratio?"
          className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-accent"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-accent hover:bg-accent/80 disabled:opacity-50 text-white px-5 rounded-xl flex items-center justify-center transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
