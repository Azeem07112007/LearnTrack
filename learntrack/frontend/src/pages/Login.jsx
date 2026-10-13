import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Icon, Button } from '../components/ui'

export default function Login({ onShowSignup }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleLogin}>
        <div className="brand-mark mx-auto mb-2">
          <Icon>menu_book</Icon>
        </div>
        <h1>LearnTrack</h1>
        <p className="text-muted-foreground text-sm">Sign in to your academic portal</p>
        
        {error && (
          <div className="p-2 bg-danger-soft text-danger rounded-md text-sm my-3">
            {error}
          </div>
        )}

        <label className="block text-left text-[10px] mt-6">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex.chen@university.edu"
            required
            className="flex w-full border-b border-border py-2.5 mt-1 outline-none bg-transparent"
          />
        </label>
        
        <label className="block text-left text-[10px] mt-6 relative">
          Password
          <button 
            type="button" 
            onClick={() => setError("Contact your administrator to reset your password.")}
            className="float-right text-primary bg-transparent border-0 cursor-pointer"
          >
            Forgot password?
          </button>
          <div className="password flex w-full border-b border-border py-2.5 mt-1 outline-none relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="flex-1 bg-transparent border-0 outline-none"
            />
            <button 
              type="button" 
              aria-label="Show password" 
              onClick={() => setShow(!show)}
              className="text-muted-foreground bg-transparent border-0"
            >
              <Icon>{show ? "visibility_off" : "visibility"}</Icon>
            </button>
          </div>
        </label>

        <Button type="submit" disabled={loading} className="w-full mt-6">
          {loading ? "Signing in..." : "Sign in"}
        </Button>
        
        <p className="signup mt-5 text-[10px] text-muted-foreground">
          Don't have an account? <button type="button" onClick={onShowSignup} className="text-primary font-bold bg-transparent border-0 cursor-pointer">Sign up</button>
        </p>
      </form>
    </main>
  )
}
