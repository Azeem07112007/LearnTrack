import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import Loading from '../components/Loading'

const API_BASE = import.meta.env.VITE_API_BASE

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState(null)
  const [myId, setMyId] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      setMyId(session?.user?.id)
      const res = await fetch(`${API_BASE}/student/leaderboard`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      })
      setLeaderboard(res.ok ? await res.json() : [])
    }
    load()
  }, [])

  if (!leaderboard) return <Loading text="Loading leaderboard..." />

  return (
    <div className="game-panel p-6">
      <p className="font-display text-2xl text-white mb-5">🏆 Hall of Champions</p>
      {leaderboard.length === 0 ? (
        <p className="text-white/50 text-sm font-body">No one has earned XP yet — be the first!</p>
      ) : (
        leaderboard.map((row, i) => {
          const isMe = row.student_id === myId
          return (
            <div
              key={row.student_id}
              className={`flex justify-between items-center py-3 px-3 rounded-lg font-body ${
                isMe ? 'bg-cyan/10 border border-cyan/40' : i % 2 ? 'bg-white/[0.02]' : ''
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="font-stat w-8 text-center font-bold text-gold text-lg">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </span>
                <span className={isMe ? 'text-cyan font-semibold' : 'text-white/80'}>
                  {row.name}{isMe ? ' (you)' : ''}
                </span>
              </span>
              <span className="font-stat text-gold text-lg">{row.total_xp} XP</span>
            </div>
          )
        })
      )}
    </div>
  )
}
