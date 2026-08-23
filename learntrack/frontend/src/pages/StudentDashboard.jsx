import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../supabaseClient'
import Loading from '../components/Loading'

const API_BASE = import.meta.env.VITE_API_BASE

export default function StudentDashboard({ onTakeQuiz }) {
  const [dashboard, setDashboard] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [activity, setActivity] = useState([])
  const [roadmap, setRoadmap] = useState([])
  const [myId, setMyId] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const headers = { Authorization: `Bearer ${token}` }
      setMyId(session?.user?.id)

      const [dashRes, lbRes, actRes, roadRes] = await Promise.all([
        fetch(`${API_BASE}/student/dashboard`, { headers }),
        fetch(`${API_BASE}/student/leaderboard`, { headers }),
        fetch(`${API_BASE}/student/activity`, { headers }),
        fetch(`${API_BASE}/student/roadmap`, { headers }),
      ])
      if (!dashRes.ok || !lbRes.ok) {
        setDashboard({ error: true })
        return
      }
      setDashboard(await dashRes.json())
      setLeaderboard(await lbRes.json())
      setActivity(actRes.ok ? await actRes.json() : [])
      setRoadmap(roadRes.ok ? await roadRes.json() : [])
    }
    load()
  }, [])

  if (!dashboard) return <Loading text="Loading quest log..." />
  if (dashboard.error) return <p className="font-body text-flame">Couldn't load your quest log. Try logging out and back in.</p>

  const level = Math.floor(dashboard.total_xp / 900) + 1
  const xpPercent = Math.min((dashboard.total_xp % 900) / 900 * 100, 100)
  const rank = leaderboard.findIndex((r) => r.student_id === myId) + 1 || null

  return (
    <div className="grid grid-cols-3 gap-6 font-body">

      {/* Main column */}
      <div className="col-span-2 space-y-6">

        {/* Hero */}
        <div className="game-panel p-6">
          <div className="flex items-center gap-5">
            <div className="xp-gem w-24 h-24 flex items-center justify-center shrink-0">
              <div className="text-center">
                <p className="font-stat text-2xl text-night font-bold leading-none">{dashboard.total_xp}</p>
                <p className="font-stat text-[10px] text-night/70 tracking-widest">XP</p>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-display text-2xl text-white">Level {level}</p>
              {rank && <p className="font-stat text-cyan hud-glow">Rank #{rank} in class</p>}
              <div className="h-3 bg-night rounded-full overflow-hidden mt-3 border border-violet/50">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan to-gold rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPercent}%` }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                />
              </div>
              <p className="text-xs text-white/40 mt-1">{Math.round(xpPercent)}% to Level {level + 1}</p>
            </div>
            <button
              onClick={onTakeQuiz}
              className="bg-gradient-to-r from-cyan to-violet text-white rounded-xl px-6 py-3 font-display text-lg shadow-lg shadow-cyan/20 active:scale-[0.98] transition shrink-0"
            >
              ⚔ Start a quest
            </button>
          </div>
        </div>

        {/* Stat HUD */}
        <div className="grid grid-cols-3 gap-4">
          <StatHud icon="🔥" label="streak" value={dashboard.streak} color="text-flame" />
          <StatHud icon="🎖" label="badges" value={dashboard.badges.length} color="text-cyan" />
          <StatHud icon="👑" label="rank" value={rank ?? '-'} color="text-gold" />
        </div>

        {/* Badges */}
        <div className="game-panel p-6">
          <p className="font-display text-white mb-4">Medallions earned</p>
          {dashboard.badges.length === 0 ? (
            <p className="text-sm text-white/40">Complete quests to start earning medallions.</p>
          ) : (
            <div className="flex flex-wrap gap-5">
              {dashboard.badges.map((badge) => (
                <div key={badge.badge_id} className="relative flex flex-col items-center medallion-ribbon">
                  <div className="medallion w-14 h-14 flex items-center justify-center">
                    <span className="text-xl">🎖</span>
                  </div>
                  <p className="text-[11px] text-white/70 mt-2 text-center max-w-[80px]">{badge.badges?.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Next up — ties back to the quest path */}
        <div className="game-panel p-6">
          <p className="font-display text-white mb-4">🗺 Next up on your path</p>
          {roadmap.filter((q) => q.status !== 'completed').length === 0 ? (
            <p className="text-sm text-white/40">You're all caught up — no quests left on your path!</p>
          ) : (
            <div className="space-y-2">
              {roadmap.filter((q) => q.status !== 'completed').slice(0, 3).map((q) => (
                <div key={q.id} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/[0.03]">
                  <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0 ${q.status === 'current' ? 'bg-gradient-to-br from-cyan to-violet' : 'bg-night2 border border-violet/30'
                    }`}>
                    {q.status === 'current' ? '⚔' : '🔒'}
                  </span>
                  <div>
                    <p className={`text-sm ${q.status === 'current' ? 'text-cyan font-semibold' : 'text-white/50'}`}>{q.title}</p>
                    <p className="text-xs text-white/30">{q.domain}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Side column — leaderboard preview + recent activity */}
      <div className="space-y-6">
        <div className="game-panel p-5">
          <p className="font-display text-white mb-3">🔥 Streak tracker</p>
          <div className="flex justify-between">
            {Array.from({ length: 7 }).map((_, i) => (
              <span
                key={i}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${i < Math.min(dashboard.streak, 7)
                    ? 'bg-gradient-to-br from-flame to-gold text-white'
                    : 'bg-night2 border border-violet/30 text-white/20'
                  }`}
              >
                🔥
              </span>
            ))}
          </div>
          <p className="text-xs text-white/40 mt-2">
            {dashboard.streak > 0 ? `${dashboard.streak}-day streak — keep it going!` : 'Complete a quest today to start a streak.'}
          </p>
        </div>

        <div className="game-panel p-5">
          <p className="font-display text-white mb-3">🏆 Top champions</p>
          {leaderboard.slice(0, 6).map((row, i) => {
            const isMe = row.student_id === myId
            return (
              <div
                key={row.student_id}
                className={`flex justify-between items-center py-2 px-2 text-sm rounded-lg ${isMe ? 'bg-cyan/10 border border-cyan/40' : ''
                  }`}
              >
                <span className="flex items-center gap-2">
                  <span className="font-stat w-6 text-center text-gold font-bold">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </span>
                  <span className={isMe ? 'text-cyan font-semibold' : 'text-white/80'}>{row.name}</span>
                </span>
                <span className="font-stat text-gold text-sm">{row.total_xp}</span>
              </div>
            )
          })}
        </div>

        <div className="game-panel p-5">
          <p className="font-display text-white mb-3">📖 Recent activity</p>
          {activity.length === 0 ? (
            <p className="text-sm text-white/40">No quests completed yet — go start one!</p>
          ) : (
            activity.map((a, i) => (
              <div key={i} className="flex justify-between items-center py-2 px-2 text-sm border-b border-violet/20 last:border-0">
                <span className="text-white/70 truncate">{a.quizzes?.topic || 'Quest'}</span>
                <span className="font-stat text-cyan shrink-0 ml-2">{a.score} pts</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function StatHud({ icon, label, value, color }) {
  return (
    <div className="game-panel text-center py-4">
      <p className="text-xl leading-none mb-1">{icon}</p>
      <p className={`font-stat text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-[11px] text-white/40 mt-0.5 uppercase tracking-wide">{label}</p>
    </div>
  )
}
