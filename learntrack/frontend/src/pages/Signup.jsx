import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Icon, Button } from '../components/ui'

const API_BASE = import.meta.env.VITE_API_BASE

export default function Signup({ onDone, onBackToLogin, session = null }) {
  const [role, setRole] = useState('student')
  const [step, setStep] = useState('account') // account | teacher-school | student-setup
  const [name, setName] = useState('')
  const [email, setEmail] = useState(session?.user?.email || '')
  const [password, setPassword] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [schoolFound, setSchoolFound] = useState(null)
  const [classes, setClasses] = useState([])
  const [classId, setClassId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [accessToken, setAccessToken] = useState(session?.access_token || null)

  function authHeaders() {
    return { Authorization: `Bearer ${accessToken}` }
  }

  async function createAccount(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      let token = accessToken
      if (!token) {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) {
          if (error.message?.toLowerCase().includes('already registered') || error.status === 422) {
            const signInRes = await supabase.auth.signInWithPassword({ email, password })
            if (signInRes.error) {
              throw new Error('That email is already registered. Please enter the correct password to complete your profile setup, or log in.')
            }
            token = signInRes.data.session?.access_token
          } else {
            throw error
          }
        } else {
          token = data.session?.access_token
          if (!token) {
            const signInRes = await supabase.auth.signInWithPassword({ email, password })
            if (signInRes.error) throw signInRes.error
            token = signInRes.data.session?.access_token
          }
        }
      }

      if (!token) throw new Error('Could not start a session after signup. Check Supabase settings.')
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

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="brand-mark mx-auto mb-2">
          <Icon>school</Icon>
        </div>
        <h1>LearnTrack</h1>
        <p className="text-muted-foreground text-sm">Create your institutional account</p>

        {error && (
          <div className="p-2 bg-danger-soft text-danger rounded-md text-sm my-3">
            {error}
          </div>
        )}

        {step === 'account' && (
          <form onSubmit={createAccount} className="w-full text-left">
            <div className="flex gap-2 my-4">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex-1 py-2 text-xs font-semibold rounded border transition-all ${
                  role === 'student'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-transparent text-muted-foreground border-border'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`flex-1 py-2 text-xs font-semibold rounded border transition-all ${
                  role === 'teacher'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-transparent text-muted-foreground border-border'
                }`}
              >
                Teacher
              </button>
            </div>

            <label className="block text-left text-[10px] mt-4">
              Full Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Chen"
                required
                className="flex w-full border-b border-border py-2 mt-1 outline-none bg-transparent"
              />
            </label>

            <label className="block text-left text-[10px] mt-4">
              School Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.chen@university.edu"
                required
                className="flex w-full border-b border-border py-2 mt-1 outline-none bg-transparent"
              />
            </label>

            <label className="block text-left text-[10px] mt-4 mb-6">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="flex w-full border-b border-border py-2 mt-1 outline-none bg-transparent"
              />
            </label>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating...' : 'Continue'}
            </Button>
          </form>
        )}

        {step === 'teacher-school' && (
          <form onSubmit={finishTeacherSignup} className="w-full text-left mt-4">
            {schoolFound ? (
              <p className="text-sm text-foreground my-4">
                Joining <strong className="text-primary">{schoolFound.name}</strong>
              </p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground my-2">
                  No school found for this email domain. You are the first! Please enter your school's name:
                </p>
                <label className="block text-left text-[10px] mt-4 mb-6">
                  School Name
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="St. Jude Academy"
                    required
                    className="flex w-full border-b border-border py-2 mt-1 outline-none bg-transparent"
                  />
                </label>
              </>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </form>
        )}

        {step === 'student-setup' && (
          <form onSubmit={finishStudentSignup} className="w-full text-left mt-4">
            <p className="text-sm text-foreground my-2">
              Joining <strong className="text-primary">{schoolFound?.name}</strong>
            </p>
            <label className="block text-left text-[10px] mt-4 mb-6">
              Select Class
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                required
                className="flex w-full border-b border-border py-2 mt-1 outline-none bg-transparent text-foreground"
              >
                <option value="" className="bg-card text-foreground">-- Choose a class --</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id} className="bg-card text-foreground">
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Finishing...' : 'Complete Registration'}
            </Button>
          </form>
        )}

        <p className="signup mt-5 text-[10px] text-muted-foreground">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-primary font-bold bg-transparent border-0 cursor-pointer"
          >
            Sign in
          </button>
        </p>
      </div>
    </main>
  )
}

