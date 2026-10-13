import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Card, Pill, Button, Icon } from '../components/ui'

const API_BASE = import.meta.env.VITE_API_BASE
const AVATAR_OPTIONS = ['🧙', '🦸', '🥷', '🧝', '🐉', '🦉', '🤖', '👑', '🐺', '🦁', '🐯', '🦊']

function initials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase()
}

export default function Profile({ profile, onProfileUpdate }) {
  const [pickingAvatar, setPickingAvatar] = useState(false)
  const [dashboard, setDashboard] = useState(null)

  const isTeacher = profile?.role === 'teacher'

  // Fetch dashboard data for students (XP, streak, badges)
  useEffect(() => {
    if (isTeacher) return
    async function loadDashboard() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) return
        const res = await fetch(`${API_BASE}/student/dashboard`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (res.ok) setDashboard(await res.json())
      } catch {
        // fail silently — profile still works without stats
      }
    }
    loadDashboard()
  }, [isTeacher])

  async function chooseAvatar(emoji) {
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(`${API_BASE}/me/avatar`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatar: emoji }),
    })
    if (res.ok) {
      onProfileUpdate({ ...profile, avatar: emoji })
      setPickingAvatar(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Profile Header Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary font-bold text-3xl shadow-sm">
              {profile?.avatar || initials(profile?.name)}
            </div>
            <button
              onClick={() => setPickingAvatar((v) => !v)}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background shadow hover:scale-110 transition-transform cursor-pointer"
              title="Change Avatar"
            >
              <Icon className="text-xs">edit</Icon>
            </button>
          </div>

          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-bold">{profile?.name}</h2>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
              <Pill variant="primary" className="capitalize">{profile?.role}</Pill>
              {profile?.school_id && <Pill variant="secondary">Institutional Member</Pill>}
            </div>
          </div>
        </div>

        {/* Avatar Picker Modal/Panel */}
        {pickingAvatar && (
          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Choose Avatar Symbol</span>
              <button onClick={() => setPickingAvatar(false)} className="text-xs text-muted-foreground hover:underline border-0 bg-transparent cursor-pointer">
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => chooseAvatar(emoji)}
                  className="text-2xl h-12 rounded-xl bg-secondary/30 hover:bg-primary/20 border border-border/50 hover:border-primary/50 flex items-center justify-center transition-all cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Account Details Card */}
      <Card className="p-6">
        <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
          <Icon className="text-primary">person</Icon> Account Information
        </h3>
        <div className="space-y-3">
          <Row label="Full Name" value={profile?.name} />
          <Row label="Role" value={profile?.role} capitalize />
          {!isTeacher && dashboard && (
            <>
              <Row label="Total Earned XP" value={`${dashboard.total_xp} XP`} />
              <Row label="Active Streak" value={`${dashboard.streak} day${dashboard.streak === 1 ? '' : 's'}`} />
              <Row label="Badges Unlocked" value={dashboard.badges?.length ?? 0} />
            </>
          )}
        </div>
      </Card>
    </div>
  )
}

function Row({ label, value, capitalize }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-border/40 last:border-0 text-sm">
      <span className="text-muted-foreground font-medium">{label}</span>
      <span className={`font-semibold text-foreground ${capitalize ? 'capitalize' : ''}`}>{value}</span>
    </div>
  )
}
