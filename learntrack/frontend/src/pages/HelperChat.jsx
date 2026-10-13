import React, { useRef, useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Card, Pill, Button, Icon } from '../components/ui'

const API_BASE = import.meta.env.VITE_API_BASE

export default function HelperChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm your AI Study Companion. Ask me anything based on the learning materials uploaded by your teacher!" },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [remainingQuota, setRemainingQuota] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) return
        const res = await fetch(`${API_BASE}/student/chat-history`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.history) && data.history.length > 0) {
            setMessages(data.history)
          }
          if (data.remaining !== undefined) {
            setRemainingQuota(data.remaining)
          }
        }
      } catch {
        // Fallback to initial message
      }
    }
    fetchHistory()
  }, [])

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
        { role: 'assistant', text: res.ok ? data.answer : (data.detail || "Something went wrong — try asking again.") },
      ])
      if (data.remaining !== undefined) {
        setRemainingQuota(data.remaining)
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: "Couldn't reach the helper right now. Try again in a moment." }])
    } finally {
      setLoading(false)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Card className="p-6 flex flex-col h-[calc(100vh-220px)] min-h-[500px]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Icon className="text-xl">auto_awesome</Icon>
            </div>
            <div>
              <h2 className="text-lg font-bold">Ask AI Tutor</h2>
              <p className="text-xs text-muted-foreground">Context-aware answers from your course syllabus</p>
            </div>
          </div>
          {remainingQuota !== null && (
            <Pill variant="secondary" className="text-xs">
              <Icon className="text-xs mr-1">bolt</Icon> {remainingQuota} questions left today
            </Pill>
          )}
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role !== 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-sm font-bold">
                  <Icon className="text-base">auto_awesome</Icon>
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm font-medium leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-xs'
                    : 'bg-secondary/40 text-foreground border border-border/40 rounded-bl-xs'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-sm font-bold animate-pulse">
                <Icon className="text-base">auto_awesome</Icon>
              </div>
              <div className="bg-secondary/40 border border-border/40 rounded-2xl rounded-bl-xs px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                Searching learning materials...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={send} className="flex gap-2 pt-4 border-t border-border/50">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your course..."
            className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-all text-foreground"
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            <Icon>send</Icon> Ask
          </Button>
        </form>
      </Card>
    </div>
  )
}

