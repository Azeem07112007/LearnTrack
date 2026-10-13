import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import Loading from '../components/Loading'
import { Card, Pill, Icon } from '../components/ui'

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

  const top3 = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Icon className="text-xl">emoji_events</Icon>
          </div>
          <div>
            <h2 className="text-xl font-bold">Class Leaderboard</h2>
            <p className="text-sm text-muted-foreground">Top academic performers in your cohort</p>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">No scores yet — complete a quiz to appear on the leaderboard.</p>
        ) : (
          <>
            {/* Top 3 Podium */}
            {top3.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-8 pt-4 items-end">
                {/* 2nd Place */}
                {top3[1] ? (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center border-2 border-slate-300 mb-2 shadow-sm text-lg">
                      2
                    </div>
                    <span className="text-xs font-semibold truncate max-w-full">{top3[1].name}</span>
                    <span className="text-xs text-muted-foreground font-bold">{top3[1].total_xp} XP</span>
                    <div className="w-full bg-secondary/60 h-24 rounded-t-xl mt-3 flex items-center justify-center text-xs font-bold text-muted-foreground">
                      2nd
                    </div>
                  </div>
                ) : <div />}

                {/* 1st Place */}
                {top3[0] ? (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-amber-400 text-slate-900 font-bold flex items-center justify-center border-4 border-amber-300 mb-2 shadow-md text-xl">
                      👑
                    </div>
                    <span className="text-sm font-bold text-primary truncate max-w-full">{top3[0].name}</span>
                    <span className="text-xs text-amber-600 font-extrabold">{top3[0].total_xp} XP</span>
                    <div className="w-full bg-primary/20 border-t-2 border-primary/40 h-32 rounded-t-xl mt-3 flex items-center justify-center text-sm font-extrabold text-primary">
                      1st
                    </div>
                  </div>
                ) : <div />}

                {/* 3rd Place */}
                {top3[2] ? (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-amber-700 text-white font-bold flex items-center justify-center border-2 border-amber-600 mb-2 shadow-sm text-lg">
                      3
                    </div>
                    <span className="text-xs font-semibold truncate max-w-full">{top3[2].name}</span>
                    <span className="text-xs text-muted-foreground font-bold">{top3[2].total_xp} XP</span>
                    <div className="w-full bg-secondary/40 h-20 rounded-t-xl mt-3 flex items-center justify-center text-xs font-bold text-muted-foreground">
                      3rd
                    </div>
                  </div>
                ) : <div />}
              </div>
            )}

            {/* Remaining Ranks List */}
            <div className="space-y-2">
              {leaderboard.map((row, i) => {
                const isMe = row.student_id === myId
                return (
                  <div
                    key={row.student_id}
                    className={`flex justify-between items-center p-3.5 rounded-xl font-medium text-sm transition-all ${
                      isMe
                        ? 'bg-primary/10 border border-primary/40 text-primary'
                        : 'bg-card border border-border/40 hover:bg-secondary/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0 ? 'bg-amber-400 text-slate-900' : i === 1 ? 'bg-slate-300 text-slate-900' : i === 2 ? 'bg-amber-700 text-white' : 'bg-muted text-muted-foreground'
                      }`}>
                        {i + 1}
                      </span>
                      <span>
                        {row.name}
                        {isMe && <Pill variant="primary" className="ml-2 py-0.5 text-[10px]">You</Pill>}
                      </span>
                    </div>
                    <span className="font-bold text-primary">{row.total_xp} XP</span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

