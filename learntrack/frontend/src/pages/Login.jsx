import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Login({ onShowSignup }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen flex items-center justify-center font-body px-4">
      <form onSubmit={handleLogin} className="game-panel p-6 w-full max-w-xs space-y-3">
        <h1 className="font-display text-3xl text-white text-center">⚔ LearnTrack</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-violet/50 rounded-lg p-2 bg-night2 text-white placeholder-white/30"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-violet/50 rounded-lg p-2 bg-night2 text-white placeholder-white/30"
        />
        {error && <p className="text-flame text-sm">{error}</p>}
        <button type="submit" className="w-full bg-gradient-to-r from-cyan to-violet text-white rounded-lg p-2 font-display text-lg">
          Enter
        </button>
        <button type="button" onClick={onShowSignup} className="text-sm text-white/50 underline w-full text-center">
          Need an account? Sign up
        </button>
      </form>
    </div>
  )
}
