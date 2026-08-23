import { useRef, useState } from 'react'
import { supabase } from '../supabaseClient'

const API_BASE = import.meta.env.VITE_API_BASE

export default function HelperChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm your study companion 🧙 — ask me anything about what your teacher has posted, and I'll do my best to help." },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  async function send(e) {
    e.preventDefault()
    const question = input.trim()
    if (!question || loading) return

    setMessages((prev) => [...prev, { role: 'user', text: question }])
    setInput('')
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${API_BASE}/student/ask`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      })
      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: res.ok ? data.answer : "Something went wrong — try asking again." },
      ])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: "Couldn't reach the helper right now. Try again in a moment." }])
    } finally {
      setLoading(false)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }

  return (
    <div className="game-panel p-6 flex flex-col h-[70vh]">
      <p className="font-display text-2xl text-white mb-1">🧙 Ask your study companion</p>
      <p className="text-white/40 text-sm font-body mb-4">Answers only from what your teacher has uploaded for your class.</p>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm font-body ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-cyan to-violet text-white'
                  : 'bg-night2 border border-violet/40 text-white/85'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-night2 border border-violet/40 rounded-xl px-4 py-2.5 text-sm text-white/50 font-body">
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex gap-2 mt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your last quest..."
          className="flex-1 border border-violet/50 rounded-lg p-2.5 bg-night2 text-white placeholder-white/30 font-body"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-cyan to-violet disabled:opacity-40 text-white rounded-lg px-5 font-display"
        >
          Ask
        </button>
      </form>
    </div>
  )
}
