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
import Loading from './components/Loading'

const API_BASE = import.meta.env.VITE_API_BASE

// 'Dashboard' is no longer its own tab — it's the home page, reached via the
// logo in the sidebar (like clicking a site's logo takes you home).
const STUDENT_NAV = [
  { key: 'roadmap', label: 'Quest Path', icon: '🗺' },
  { key: 'quiz', label: 'Quests', icon: '⚔' },
  { key: 'helper', label: 'Ask a Tutor', icon: '🧙' },
  { key: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
  { key: 'profile', label: 'Profile', icon: '🧑' },
]

const TEACHER_NAV = [
  { key: 'profile', label: 'Profile', icon: '🧑' },
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
          setProfile({ role: 'no-profile' })
          return
        }
        setProfile(await res.json())
      } catch {
        setProfile({ role: 'no-profile' })
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
  if (loading) return <Loading text="Loading LearnTrack..." />
  if (!session) return <Login onShowSignup={() => setShowSignup(true)} />

  async function handleLogout() {
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
    setView('dashboard')
  }

  if (profile?.role === 'no-profile') {
    return (
      <div className="p-6 text-center space-y-3 font-body min-h-screen flex flex-col items-center justify-center">
        <p className="font-display text-xl text-white">Your account was created, but no profile was set up for it.</p>
        <p className="text-sm text-white/60">This usually means signup was interrupted. Try signing up again, or contact whoever's managing the backend.</p>
        <button onClick={handleLogout} className="text-sm text-white/50 underline">
          Log out
        </button>
      </div>
    )
  }

  const isTeacher = profile?.role === 'teacher'
  const navItems = isTeacher ? TEACHER_NAV : STUDENT_NAV
  const pageTitles = {
    dashboard: isTeacher ? 'Post Quest' : 'Home',
    quiz: 'Quests',
    leaderboard: 'Leaderboard',
    roadmap: 'Quest Path',
    helper: 'Ask a Tutor',
    profile: 'Profile',
  }

  let content
  if (view === 'profile') {
    content = <Profile profile={profile} onProfileUpdate={setProfile} />
  } else if (isTeacher) {
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
    content = <StudentDashboard onTakeQuiz={() => setView('quiz')} />
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
