import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from './supabaseClient'
import StudentDashboard from './pages/StudentDashboard'
import QuizPlayer from './pages/QuizPlayer'
import Leaderboard from './pages/Leaderboard'
import Roadmap from './pages/Roadmap'
import HelperChat from './pages/HelperChat'
import TeacherUpload from './pages/TeacherUpload'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AppShell from './components/AppShell'

const API_BASE = import.meta.env.VITE_API_BASE

const STUDENT_NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: 'home' },
  { key: 'quiz', label: 'Quizzes', icon: 'quiz' },
  { key: 'roadmap', label: 'Learning Path', icon: 'route' },
  { key: 'leaderboard', label: 'Leaderboard', icon: 'leaderboard' },
  { key: 'assignments', label: 'Assignments', icon: 'assignment' },
  { key: 'helper', label: 'Study Guide', icon: 'school' },
]

const TEACHER_NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'assignments', label: 'Assignments', icon: 'assignment' },
  { key: 'profile', label: 'Profile', icon: 'person' },
]

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('dashboard')
  const [showSignup, setShowSignup] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (!session) setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) {
        setProfile(null)
        setLoading(false)
      }
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session || showSignup) return
    async function loadProfile() {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (!res.ok) {
          // 401 = invalid/expired token or no profile row in users table
          if (res.status === 401) {
            setProfile({ role: 'no-profile' })
          } else {
            // Other server errors (500, etc.) — backend is up but something else broke
            setProfile({ role: 'error' })
          }
          return
        }
        setProfile(await res.json())
      } catch {
        // Network error — backend is unreachable
        setProfile({ role: 'error' })
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [session, showSignup])


  if (showSignup) {
    return (
      <Signup
        onDone={() => { setShowSignup(false); window.location.reload() }}
        onBackToLogin={() => setShowSignup(false)}
      />
    )
  }
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Loading LearnTrack…</span>
      </div>
    </div>
  )
  if (!session) return <Login onShowSignup={() => setShowSignup(true)} />

  async function handleLogout() {
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
    setView('dashboard')
  }

  if (profile?.role === 'no-profile') {
    return (
      <Signup
        session={session}
        onDone={async () => {
          setLoading(true)
          try {
            const res = await fetch(`${API_BASE}/me`, {
              headers: { Authorization: `Bearer ${session.access_token}` },
            })
            if (res.ok) {
              setProfile(await res.json())
            }
          } finally {
            setLoading(false)
          }
        }}
        onBackToLogin={handleLogout}
      />
    )
  }

  if (profile?.role === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <div className="brand-mark mx-auto mb-2" style={{ background: 'var(--danger)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#fff' }}>cloud_off</span>
          </div>
          <h1 style={{ fontSize: 20, margin: '14px 0 6px' }}>Connection Error</h1>
          <p className="text-muted-foreground text-sm" style={{ marginBottom: 20 }}>
            Could not reach the LearnTrack server.<br />
            Please make sure the backend is running and try again.
          </p>
          <button
            className="btn btn-primary w-full"
            onClick={() => { setProfile(null); setLoading(true); window.location.reload() }}
          >
            Try Again
          </button>
          <button
            className="btn btn-ghost w-full"
            style={{ marginTop: 8 }}
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  const isTeacher = profile?.role === 'teacher'
  const navItems = isTeacher ? TEACHER_NAV : STUDENT_NAV
  const pageTitles = {
    dashboard: isTeacher ? 'Teacher Dashboard' : 'Dashboard',
    quiz: 'Quizzes',
    leaderboard: 'Leaderboard',
    roadmap: 'Learning Path',
    helper: 'Study Guide',
    profile: 'Profile',
    assignments: 'Assignments',
  }

  let content
  if (view === 'profile') {
    content = <Profile profile={profile} onProfileUpdate={setProfile} />
  } else if (isTeacher) {
    // Teacher-specific views
    content = <TeacherUpload />
  } else if (view === 'quiz') {
    content = <QuizPlayer onExit={() => setView('dashboard')} />
  } else if (view === 'leaderboard') {
    content = <Leaderboard />
  } else if (view === 'roadmap') {
    content = <Roadmap />
  } else if (view === 'helper') {
    content = <HelperChat />
  } else {
    content = <StudentDashboard onTakeQuiz={() => setView('quiz')} onNavChange={setView} />
  }

  return (
    <AppShell
      navItems={navItems}
      activeNav={view}
      onNavChange={setView}
      onGoHome={() => setView('dashboard')}
      profile={profile}
      onProfileUpdate={setProfile}
      onLogout={handleLogout}
      pageTitle={pageTitles[view] || 'Home'}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isTeacher ? 'teacher' : view}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  )
}
