import React from 'react'
import { Icon, Pill } from './ui'

function initials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase()
}

export default function AppShell({ navItems, activeNav, onNavChange, onGoHome, profile, onLogout, children }) {
  const isTeacher = profile?.role === 'teacher'
  const userRoleDisplay = isTeacher ? 'Teacher' : 'Student'
  const userNameDisplay = profile?.name || 'User'
  const userSubDisplay = isTeacher
    ? (profile?.school_name || 'Faculty')
    : (profile?.class_name || profile?.school_name || 'Student')

  // Determine avatar display — emoji if short string, initials otherwise
  const avatarEmoji = profile?.avatar && profile.avatar.length <= 4 ? profile.avatar : null

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button onClick={onGoHome} className="brand bg-transparent border-0 cursor-pointer text-left w-full hover:bg-transparent">
          <span className="brand-mark"><Icon>menu_book</Icon></span>
          <strong>LearnTrack</strong>
        </button>
        <p className="side-kicker">Academic Workspace</p>

        <nav className="side-nav">
          {navItems.map((item) => (
            <button 
              key={item.key}
              onClick={() => onNavChange(item.key)}
              className={activeNav === item.key ? "active" : ""}
            >
              <Icon>{item.icon}</Icon>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div
          className="profile-mini mt-auto flex items-center gap-2 p-2 border-t border-border cursor-pointer"
          onClick={() => onNavChange('profile')}
          title="View profile"
        >
          <div className="w-8 h-8 rounded-full bg-surface-soft flex items-center justify-center text-lg shrink-0"
            style={{
              background: avatarEmoji ? 'var(--surface-soft)' : 'var(--primary)',
              color: avatarEmoji ? 'inherit' : 'var(--primary-foreground)',
              fontSize: avatarEmoji ? '18px' : '11px',
              fontWeight: avatarEmoji ? 'normal' : '700',
            }}
          >
            {avatarEmoji || initials(userNameDisplay)}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <b className="truncate">{userNameDisplay}</b>
            <small className="truncate">{userSubDisplay}</small>
          </div>
          <Pill tone="gray">{userRoleDisplay}</Pill>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="search">
            <Icon>search</Icon>
            <input type="text" placeholder="Search resources..." />
          </div>
          <div className="term">
            <span className="material-symbols-outlined text-muted-foreground mr-1">school</span>
            <b>Fall Semester</b>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onLogout} className="icon-btn hover:bg-surface-soft rounded-md" title="Logout">
              <Icon>logout</Icon>
            </button>
          </div>
        </header>

        <div className="content">
          {children}
        </div>
      </main>

      <nav className="mobile-nav">
        {navItems.map((item) => (
          <button 
            key={item.key}
            onClick={() => onNavChange(item.key)}
            className={activeNav === item.key ? "active" : ""}
          >
            <Icon>{item.icon}</Icon>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
