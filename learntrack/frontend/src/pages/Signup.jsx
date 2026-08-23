import { useState } from 'react'
import { supabase } from '../supabaseClient'

const API_BASE = import.meta.env.VITE_API_BASE
const DOMAIN_OPTIONS = ['Science', 'Mathematics', 'Social studies', 'English']

export default function Signup({ onDone, onBackToLogin }) {
  const [role, setRole] = useState('student')
  const [step, setStep] = useState('account') // account | teacher-school | student-setup
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [schoolFound, setSchoolFound] = useState(null)
  const [classes, setClasses] = useState([])
  const [classId, setClassId] = useState('')
  const [domains, setDomains] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [accessToken, setAccessToken] = useState(null)

  function authHeaders() {
    return { Authorization: `Bearer ${accessToken}` }
  }

  async function createAccount(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        if (error.message?.toLowerCase().includes('already registered') || error.status === 422) {
          throw new Error('That email is already registered. Use a different email, or go back and log in instead.')
        }
        throw error
      }

      let token = data.session?.access_token
      if (!token) {
        // Some Supabase configs don't return a session directly from signUp —
        // fall back to signing in immediately, which always returns one.
        const signInRes = await supabase.auth.signInWithPassword({ email, password })
        if (signInRes.error) throw signInRes.error
        token = signInRes.data.session?.access_token
      }
      if (!token) throw new Error('Could not start a session after signup. Check Supabase email-confirmation settings.')
      setAccessToken(token)

      const res = await fetch(`${API_BASE}/auth/school-check`, { headers: { Authorization: `Bearer ${token}` } })
      const resData = await res.json()
      setSchoolFound(resData.school)

      if (role === 'teacher') {
        setStep('teacher-school')
      } else {
        if (!resData.school) {
          setError('No school is registered for this email domain yet. Ask a teacher to sign up first.')
          setLoading(false)
          return
        }
        const clsRes = await fetch(`${API_BASE}/auth/classes-for-signup`, { headers: { Authorization: `Bearer ${token}` } })
        setClasses(await clsRes.json())
        setStep('student-setup')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function finishTeacherSignup(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/signup/teacher`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, school_name: schoolFound ? undefined : schoolName }),
      })
      if (!res.ok) throw new Error((await res.json()).detail)
      onDone()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function finishStudentSignup(e) {
    e.preventDefault()
    setError('')
    if (!classId) return setError('Pick a class.')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/signup/student`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, class_id: classId, domains: [] }),
      })
      if (!res.ok) throw new Error((await res.json()).detail)
      onDone()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function toggleDomain(d) {
    setDomains((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))
  }

  return (
    <div className="min-h-screen flex items-center justify-center font-body px-4">
      <div className="game-panel p-6 w-full max-w-xs space-y-3">
        <h1 className="font-display text-3xl text-white text-center">Create account</h1>

        {step === 'account' && (
          <form onSubmit={createAccount} className="space-y-3">
            <div className="flex gap-2">
              <button type="button" onClick={() => setRole('student')}
                className={`flex-1 rounded-lg p-2 text-sm ${role === 'student' ? 'bg-cyan text-night font-semibold' : 'border border-violet/50 text-white/70'}`}>
                Student
              </button>
              <button type="button" onClick={() => setRole('teacher')}
                className={`flex-1 rounded-lg p-2 text-sm ${role === 'teacher' ? 'bg-cyan text-night font-semibold' : 'border border-violet/50 text-white/70'}`}>
                Teacher
              </button>
            </div>
            <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-violet/50 rounded-lg p-2 bg-night2 text-white placeholder-white/30" />
            <input type="email" placeholder="School email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-violet/50 rounded-lg p-2 bg-night2 text-white placeholder-white/30" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-violet/50 rounded-lg p-2 bg-night2 text-white placeholder-white/30" />
            {error && <p className="text-flame text-sm">{error}</p>}
            <button disabled={loading} type="submit" className="w-full bg-gradient-to-r from-cyan to-violet disabled:opacity-40 text-white rounded-lg p-2 font-display text-lg">
              {loading ? 'Creating...' : 'Continue'}
            </button>
          </form>
        )}

        {step === 'teacher-school' && (
          <form onSubmit={finishTeacherSignup} className="space-y-3">
            {schoolFound ? (
              <p className="text-sm text-white/70">Joining <span className="font-semibold text-cyan">{schoolFound.name}</span></p>
            ) : (
              <>
                <p className="text-sm text-white/60">No school found for this email domain — you're the first. Name it:</p>
                <input type="text" placeholder="School name" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="w-full border border-violet/50 rounded-lg p-2 bg-night2 text-white placeholder-white/30" />
              </>
            )}
            {error && <p className="text-flame text-sm">{error}</p>}
            <button disabled={loading} type="submit" className="w-full bg-gradient-to-r from-cyan to-violet disabled:opacity-40 text-white rounded-lg p-2 font-display text-lg">
              {loading ? 'Setting up...' : 'Finish'}
            </button>
          </form>
        )}

        {step === 'student-setup' && (
          <form onSubmit={finishStudentSignup} className="space-y-3">
            <p className="text-sm text-white/70">Joining <span className="font-semibold text-cyan">{schoolFound?.name}</span></p>
            <div>
              <label className="text-sm text-white/60 block mb-1">Class</label>
              <select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-full border border-violet/50 rounded-lg p-2 bg-night2 text-white">
                <option value="">Select a class</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {error && <p className="text-flame text-sm">{error}</p>}
            <button disabled={loading} type="submit" className="w-full bg-gradient-to-r from-cyan to-violet disabled:opacity-40 text-white rounded-lg p-2 font-display text-lg">
              {loading ? 'Finishing...' : 'Finish'}
            </button>
          </form>
        )}

        <button onClick={onBackToLogin} className="text-sm text-white/50 underline w-full text-center">
          Back to login
        </button>
      </div>
    </div>
  )
}
