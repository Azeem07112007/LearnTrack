import { useState } from 'react'
import { supabase } from '../supabaseClient'
import ParticleField from './ParticleField'

const API_BASE = import.meta.env.VITE_API_BASE
const AVATAR_OPTIONS = ['🧙', '🦸', '🥷', '🧝', '🐉', '🦉', '🤖', '👑', '🐺', '🦁', '🐯', '🦊']

function initials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase()
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
        active ? 'bg-cyan/15 text-cyan border border-cyan/30' : 'text-white/60 hover:bg-white/5 hover:text-white/90'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-body font-semibold">{label}</span>
    </button>
  )
}

export default function AppShell({ navItems, activeNav, onNavChange, onGoHome, profile, onProfileUpdate, onLogout, pageTitle, children }) {
  const [menuOpen, setMenuOpen] = useState(false)
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

  return (
    <div className="min-h-screen flex">
      <ParticleField />

      {/* Sidebar */}
      <aside className="w-60 shrink-0 game-panel !rounded-none border-t-0 border-b-0 border-l-0 flex flex-col p-4 gap-1">
        <button
          onClick={onGoHome}
          className="flex items-center gap-2 px-2 pb-5 text-left hover:opacity-80 transition"
        >
          <span className="text-2xl">⚔</span>
          <span className="font-display text-xl text-white">LearnTrack</span>
        </button>
        {navItems.map((item) => (
          <NavItem
            key={item.key}
            icon={item.icon}
            label={item.label}
            active={activeNav === item.key}
            onClick={() => onNavChange(item.key)}
          />
        ))}

        <div className="flex-1" />

        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-violet/30">
          <span className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan to-violet flex items-center justify-center text-white font-stat font-bold text-base border-2 border-white/20 shrink-0">
            {profile?.avatar || initials(profile?.name)}
          </span>
          <div className="min-w-0">
            <p className="text-sm text-white/90 font-semibold truncate">{profile?.name}</p>
            <p className="text-xs text-cyan/70 capitalize">{profile?.role}</p>
          </div>
        </div>
      </aside>

      {/* Right side: top bar + scrollable content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 flex items-center justify-between px-8 border-b border-violet/30">
          <p className="font-display text-lg text-white">{pageTitle}</p>

          <div className="relative">
            <button
              onClick={() => { setMenuOpen((v) => !v); setPickingAvatar(false) }}
              className="flex items-center gap-2"
            >
              <span className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan to-violet flex items-center justify-center text-white font-stat font-bold text-base border-2 border-white/20">
                {profile?.avatar || initials(profile?.name)}
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-11 w-56 game-panel p-2 z-10">
                {!pickingAvatar ? (
                  <>
                    <p className="px-3 py-2 text-sm text-white/90 font-semibold truncate">{profile?.name}</p>
                    <p className="px-3 pb-2 text-xs text-cyan/70 capitalize">{profile?.role}</p>
                    <button
                      onClick={() => setPickingAvatar(true)}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/5"
                    >
                      Change avatar
                    </button>
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-flame hover:bg-flame/10"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <p className="px-3 py-2 text-xs text-white/50">Pick your avatar</p>
                    <div className="grid grid-cols-4 gap-1 p-2">
                      {AVATAR_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => chooseAvatar(emoji)}
                          className="text-xl w-9 h-9 rounded-full hover:bg-cyan/15 flex items-center justify-center"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
