import { useState } from 'react'
import { supabase } from '../supabaseClient'

const API_BASE = import.meta.env.VITE_API_BASE
const AVATAR_OPTIONS = ['🧙', '🦸', '🥷', '🧝', '🐉', '🦉', '🤖', '👑', '🐺', '🦁', '🐯', '🦊']

function initials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase()
}

export default function Profile({ profile, onProfileUpdate, dashboard }) {
  const [pickingAvatar, setPickingAvatar] = useState(false)

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

  const isTeacher = profile?.role === 'teacher'

  return (
    <div className="space-y-6 font-body max-w-2xl">
      <div className="game-panel p-8 flex items-center gap-6">
        <div className="relative">
          <span className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan to-violet flex items-center justify-center text-white font-stat font-bold text-4xl border-4 border-white/20">
            {profile?.avatar || initials(profile?.name)}
          </span>
        </div>
        <div>
          <p className="font-display text-2xl text-white">{profile?.name}</p>
          <p className="text-cyan/70 capitalize text-sm">{profile?.role}</p>
          <button
            onClick={() => setPickingAvatar((v) => !v)}
            className="text-xs text-white/50 underline mt-2"
          >
            {pickingAvatar ? 'Close' : 'Change avatar'}
          </button>
        </div>
      </div>

      {pickingAvatar && (
        <div className="game-panel p-5">
          <p className="text-sm text-white/50 mb-3">Pick your avatar</p>
          <div className="grid grid-cols-6 gap-2">
            {AVATAR_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => chooseAvatar(emoji)}
                className="text-2xl w-12 h-12 rounded-full hover:bg-cyan/15 flex items-center justify-center border border-transparent hover:border-cyan/40"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="game-panel p-6">
        <p className="font-display text-white mb-4">Account details</p>
        <div className="space-y-2 text-sm">
          <Row label="Name" value={profile?.name} />
          <Row label="Role" value={profile?.role} capitalize />
          {!isTeacher && dashboard && (
            <>
              <Row label="Total XP" value={dashboard.total_xp} />
              <Row label="Current streak" value={`${dashboard.streak} day${dashboard.streak === 1 ? '' : 's'}`} />
              <Row label="Badges earned" value={dashboard.badges?.length ?? 0} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, capitalize }) {
  return (
    <div className="flex justify-between py-2 border-b border-violet/20 last:border-0">
      <span className="text-white/50">{label}</span>
      <span className={`text-white/85 font-medium ${capitalize ? 'capitalize' : ''}`}>{value}</span>
    </div>
  )
}
