import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../supabaseClient'
import { Card, Pill, Progress, Icon, Button } from '../components/ui'

const API_BASE = import.meta.env.VITE_API_BASE

function StatCard({ icon, iconColor, label, value, sub }) {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
        <Icon className="text-xl">{icon}</Icon>
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mt-1">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </Card>
  )
}

export default function StudentDashboard({ onTakeQuiz, onNavChange }) {
  const [dashboard, setDashboard] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [activity, setActivity] = useState([])
  const [roadmap, setRoadmap] = useState([])
  const [myId, setMyId] = useState(null)
  const [error, setError] = useState(false)

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
      if (!dashRes.ok) { setError(true); return }
      setDashboard(await dashRes.json())
      setLeaderboard(lbRes.ok ? await lbRes.json() : [])
      setActivity(actRes.ok ? await actRes.json() : [])
      setRoadmap(roadRes.ok ? await roadRes.json() : [])
    }
    load()
  }, [])

  if (!dashboard && !error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Loading dashboard…</span>
      </div>
    )
  }
  if (error) return <p className="p-6 text-danger text-sm">Couldn't load dashboard. Try logging out and back in.</p>

  const rank = leaderboard.findIndex((r) => r.student_id === myId) + 1 || null
  const quizzesAttempted = activity.length
  const quizzesPassed = activity.filter(a => (a.score || 0) >= 60).length
  const passRate = quizzesAttempted > 0 ? Math.round(quizzesPassed / quizzesAttempted * 100) : 0
  const nextQuest = roadmap.find(q => q.status === 'current') || roadmap.find(q => q.status !== 'completed') || null
  const completedCount = roadmap.filter(q => q.status === 'completed').length

  return (
    <div className="space-y-6">

      {/* ── Welcome Banner ─────────────────────────────────── */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {completedCount > 0
                ? `You've completed ${completedCount} assignment${completedCount !== 1 ? 's' : ''} so far. Keep going.`
                : 'Get started by taking your first quiz below.'}
            </p>
          </div>
          {nextQuest && (
            <Button onClick={onTakeQuiz} className="shrink-0">
              <Icon>play_circle</Icon> Start Next Quiz
            </Button>
          )}
        </div>
      </Card>

      {/* ── Stats Row ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="assignment_turned_in"
          iconColor="bg-primary/10 text-primary"
          label="Quizzes Taken"
          value={quizzesAttempted}
          sub="total attempts"
        />
        <StatCard
          icon="trending_up"
          iconColor="bg-emerald-500/10 text-emerald-600"
          label="Pass Rate"
          value={`${passRate}%`}
          sub={`${quizzesPassed} of ${quizzesAttempted} passed`}
        />
        <StatCard
          icon="military_tech"
          iconColor="bg-amber-500/10 text-amber-600"
          label="Badges Earned"
          value={dashboard.badges?.length ?? 0}
          sub="achievements unlocked"
        />
        <StatCard
          icon="leaderboard"
          iconColor="bg-violet-500/10 text-violet-600"
          label="Class Rank"
          value={rank ? `#${rank}` : '—'}
          sub={rank ? `of ${leaderboard.length} students` : 'not yet ranked'}
        />
      </div>

      {/* ── Main Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Score progress + Upcoming quizzes */}
        <div className="lg:col-span-2 space-y-6">

          {/* Score summary */}
          {activity.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-sm flex items-center gap-2">
                  <Icon className="text-primary">insights</Icon> Score Breakdown
                </h2>
                <span className="text-xs text-muted-foreground">{quizzesAttempted} quiz{quizzesAttempted !== 1 ? 'zes' : ''}</span>
              </div>
              <div className="space-y-3">
                {activity.slice(0, 5).map((a, i) => {
                  const score = a.score ?? 0
                  const pct = Math.min(score, 100)
                  const tone = score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-danger'
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground truncate w-36 shrink-0">{a.quizzes?.topic || 'Quiz'}</span>
                      <div className="flex-1">
                        <Progress value={pct} />
                      </div>
                      <span className={`text-xs font-bold w-10 text-right shrink-0 ${tone}`}>{score}%</span>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Upcoming assignments */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Icon className="text-primary">queue</Icon> Upcoming Assignments
              </h2>
              {onNavChange && (
                <button
                  onClick={() => onNavChange('roadmap')}
                  className="text-xs text-primary font-medium hover:underline border-0 bg-transparent cursor-pointer"
                >
                  View all →
                </button>
              )}
            </div>
            {roadmap.filter(q => q.status !== 'completed').length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon className="text-3xl mb-2 block">check_circle</Icon>
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs mt-1">No pending assignments.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {roadmap.filter(q => q.status !== 'completed').slice(0, 4).map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card hover:bg-secondary/30 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                        q.status === 'current' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        <Icon className="text-base">{q.status === 'current' ? 'play_arrow' : 'lock'}</Icon>
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${q.status === 'current' ? 'text-foreground' : 'text-muted-foreground'}`}>{q.title}</p>
                        <p className="text-xs text-muted-foreground">{q.domain}</p>
                      </div>
                    </div>
                    {q.status === 'current' && (
                      <Button size="sm" onClick={onTakeQuiz} className="ml-3 shrink-0">Start</Button>
                    )}
                    {q.status !== 'current' && (
                      <Pill tone="gray">Locked</Pill>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right: Leaderboard + Recent activity */}
        <div className="space-y-6">

          {/* Leaderboard top 5 */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Icon className="text-amber-500">emoji_events</Icon> Top Students
              </h2>
              {onNavChange && (
                <button
                  onClick={() => onNavChange('leaderboard')}
                  className="text-xs text-primary font-medium hover:underline border-0 bg-transparent cursor-pointer"
                >
                  See all
                </button>
              )}
            </div>
            {leaderboard.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No scores yet.</p>
            ) : (
              <div className="space-y-1.5">
                {leaderboard.slice(0, 5).map((row, i) => {
                  const isMe = row.student_id === myId
                  const medal = i === 0 ? 'bg-amber-400 text-slate-900' : i === 1 ? 'bg-slate-300 text-slate-800' : i === 2 ? 'bg-amber-700 text-white' : 'bg-muted text-muted-foreground'
                  return (
                    <div
                      key={row.student_id}
                      className={`flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium ${
                        isMe ? 'bg-primary/10 border border-primary/30 text-primary' : 'hover:bg-secondary/30'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${medal}`}>
                        {i + 1}
                      </span>
                      <span className="flex-1 truncate">{row.name}{isMe && ' (you)'}</span>
                      <span className="font-bold shrink-0">{row.total_xp} pts</span>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Recent activity */}
          <Card className="p-5">
            <h2 className="font-semibold text-sm flex items-center gap-2 mb-4">
              <Icon className="text-primary">history</Icon> Recent Activity
            </h2>
            {activity.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No completed quizzes yet.</p>
            ) : (
              <div className="space-y-2">
                {activity.slice(0, 5).map((a, i) => {
                  const score = a.score ?? 0
                  const pill = score >= 80 ? 'bg-emerald-50 text-emerald-700' : score >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                  return (
                    <div key={i} className="flex items-center justify-between gap-2 py-1.5 border-b border-border/40 last:border-0">
                      <span className="text-xs text-foreground truncate font-medium flex-1">{a.quizzes?.topic || 'Quiz'}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${pill}`}>{score}%</span>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

        </div>
      </div>
    </div>
  )
}
