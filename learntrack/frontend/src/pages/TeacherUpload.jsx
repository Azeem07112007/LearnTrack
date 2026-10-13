import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import Loading from '../components/Loading'
import { Card, Pill, Button, Icon } from '../components/ui'

const API_BASE = import.meta.env.VITE_API_BASE

export default function TeacherUpload() {
  const [file, setFile] = useState(null)
  const [domain, setDomain] = useState('Science')
  const [classId, setClassId] = useState('')
  const [classes, setClasses] = useState([])
  const [classesLoading, setClassesLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [message, setMessage] = useState('')
  const [leaderboard, setLeaderboard] = useState([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)
  const [stats, setStats] = useState(null)

  // Create class modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [creatingClass, setCreatingClass] = useState(false)
  const [createClassError, setCreateClassError] = useState('')

  async function authHeaders() {
    const { data: { session } } = await supabase.auth.getSession()
    return { Authorization: `Bearer ${session?.access_token}` }
  }

  async function loadClasses() {
    try {
      const headers = await authHeaders()
      const res = await fetch(`${API_BASE}/teacher/classes`, { headers })
      if (!res.ok) throw new Error('Could not load classes')
      const data = await res.json()
      setClasses(data)
      if (data.length > 0) {
        setClassId((prev) => (prev && data.some((c) => c.id === prev) ? prev : data[0].id))
      } else {
        setClassId('')
      }
    } catch {
      // leave classes empty — form will show fallback
    } finally {
      setClassesLoading(false)
    }
  }

  async function loadStats() {
    try {
      const headers = await authHeaders()
      const res = await fetch(`${API_BASE}/teacher/stats`, { headers })
      if (res.ok) setStats(await res.json())
    } catch {
      // fail silently
    }
  }

  useEffect(() => {
    loadClasses()
    loadStats()
  }, [])

  useEffect(() => {
    if (!classId) {
      setLeaderboard([])
      return
    }
    async function loadLeaderboard() {
      setLeaderboardLoading(true)
      try {
        const headers = await authHeaders()
        const res = await fetch(`${API_BASE}/teacher/leaderboard/${classId}`, { headers })
        if (!res.ok) throw new Error()
        setLeaderboard(await res.json())
      } catch {
        setLeaderboard([])
      } finally {
        setLeaderboardLoading(false)
      }
    }
    loadLeaderboard()
  }, [classId])

  async function handleCreateClass(e) {
    e.preventDefault()
    const name = newClassName.trim()
    if (!name) {
      setCreateClassError('Class name is required.')
      return
    }

    setCreatingClass(true)
    setCreateClassError('')

    try {
      const headers = await authHeaders()
      const res = await fetch(`${API_BASE}/teacher/classes`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to create class')

      setNewClassName('')
      setShowCreateModal(false)

      // Refresh classes list and stats immediately
      await loadClasses()
      await loadStats()
      setClassId(data.id)
    } catch (err) {
      setCreateClassError(err.message)
    } finally {
      setCreatingClass(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file || !classId || !title) {
      setStatus('error')
      setMessage('File, class selection, and title are required.')
      return
    }

    setStatus('loading')
    setMessage('')

    const form = new FormData()
    form.append('file', file)
    form.append('domain', domain)
    form.append('class_id', classId)
    form.append('title', title)
    if (dueDate) form.append('due_date', dueDate)

    try {
      const headers = await authHeaders()
      const res = await fetch(`${API_BASE}/teacher/upload`, {
        method: 'POST',
        headers,
        body: form,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Upload failed')
      setStatus('success')
      setMessage(`Success! Generated ${data.questions_generated} AI questions.`)
      setFile(null)
      setTitle('')
      await loadStats()
    } catch (err) {
      setStatus('error')
      setMessage(err.message)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Icon className="text-2xl">school</Icon>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total_classes}</p>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Active Classes</p>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Icon className="text-2xl">groups</Icon>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total_students}</p>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Total Students</p>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Icon className="text-2xl">assignment</Icon>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total_quests}</p>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Quests Posted</p>
            </div>
          </Card>
        </div>
      )}

      {/* Onboarding Banner when 0 classes */}
      {stats && stats.total_classes === 0 && (
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
              <Icon className="text-xl">add_circle</Icon>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Welcome to your Academic Workspace</p>
              <p className="text-xs text-muted-foreground">Create your first class to start posting learning quests and AI-generated quizzes for students.</p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => { setCreateClassError(''); setShowCreateModal(true); }}
            className="text-xs shrink-0 flex items-center gap-1.5"
          >
            <Icon className="text-sm">add</Icon> Create Class
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Upload Form */}
        <Card className="p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Icon className="text-xl">upload_file</Icon>
              </div>
              <div>
                <h2 className="text-lg font-bold">Post New Learning Quest</h2>
                <p className="text-xs text-muted-foreground">Upload course material to generate AI questions</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setCreateClassError(''); setShowCreateModal(true); }}
              className="text-xs font-semibold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-xl transition-colors border border-primary/20 flex items-center gap-1 cursor-pointer bg-transparent"
            >
              <Icon className="text-sm">add</Icon> New Class
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">Curriculum File (PDF / Image)</label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-secondary/10 hover:border-primary/50 transition-all cursor-pointer relative">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center">
                  <Icon className="text-3xl text-muted-foreground mb-1">cloud_upload</Icon>
                  <p className="text-xs font-medium text-foreground">Click or drop curriculum document here</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Supports PDF and image formats</p>
                  {file && <Pill variant="primary" className="mt-3">{file.name}</Pill>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">Subject Domain</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary"
                >
                  <option>Science</option>
                  <option>Mathematics</option>
                  <option>Social studies</option>
                  <option>English</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-foreground">Target Class</label>
                  <button
                    type="button"
                    onClick={() => { setCreateClassError(''); setShowCreateModal(true); }}
                    className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-0.5 bg-transparent border-0 cursor-pointer p-0"
                  >
                    <Icon className="text-xs">add</Icon> Add
                  </button>
                </div>
                {classesLoading ? (
                  <div className="p-2"><Loading compact text="Loading..." /></div>
                ) : classes.length === 0 ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 rounded-xl border border-dashed border-primary/40 bg-primary/5">
                    <div>
                      <p className="text-xs font-medium text-foreground">No classes yet</p>
                      <p className="text-[10px] text-muted-foreground">Create your first class</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setCreateClassError(''); setShowCreateModal(true); }}
                      className="text-xs font-semibold text-primary hover:bg-primary/10 px-2.5 py-1 rounded-lg transition-colors border border-primary/30 cursor-pointer flex items-center gap-1 bg-background"
                    >
                      <Icon className="text-sm">add</Icon> Create
                    </button>
                  </div>
                ) : (
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">Quest Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Photosynthesis & Cellular Respiration"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">Due Date (Optional)</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>

            <Button
              type="submit"
              disabled={status === 'loading' || !classId}
              className="w-full"
            >
              <Icon>auto_awesome</Icon>
              {status === 'loading' ? 'Generating Quest Questions...' : 'Post Quest & Generate Quiz'}
            </Button>

            {status === 'success' && <p className="text-xs font-medium text-emerald-600 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">{message}</p>}
            {status === 'error' && <p className="text-xs font-medium text-danger bg-danger/10 p-2.5 rounded-lg border border-danger/20">{message}</p>}
          </form>
        </Card>

        {/* Class Leaderboard Preview */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Icon className="text-amber-500">emoji_events</Icon> Class Standings
            </h3>
            {classId && <Pill variant="secondary">{classes.find((c) => c.id === classId)?.name}</Pill>}
          </div>

          {leaderboardLoading ? (
            <Loading compact text="Loading leaderboard..." />
          ) : leaderboard.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No student scores recorded for this class yet.</p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((row, i) => (
                <div key={row.student_id} className="flex justify-between items-center p-2.5 rounded-lg bg-secondary/30 text-xs font-medium">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-5 text-center font-bold text-amber-500">#{i + 1}</span>
                    <span className="truncate">{row.name}</span>
                  </div>
                  <span className="font-bold shrink-0">{row.total_xp} XP</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border/50 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="text-lg">school</Icon>
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Create New Class</h3>
                  <p className="text-[11px] text-muted-foreground">Add a class for your school</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-muted-foreground hover:text-foreground bg-transparent border-0 cursor-pointer p-1 rounded-lg"
              >
                <Icon className="text-lg">close</Icon>
              </button>
            </div>

            {createClassError && (
              <div className="p-2.5 bg-danger/10 text-danger border border-danger/20 rounded-xl text-xs mb-4">
                {createClassError}
              </div>
            )}

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Class Name
                </label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g. 10-A, Science Grade 9, Physics 101"
                  autoFocus
                  required
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Students from your school will see and select this class when signing up.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary rounded-xl transition-colors cursor-pointer border-0"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  disabled={creatingClass || !newClassName.trim()}
                  className="text-xs py-2 px-4"
                >
                  {creatingClass ? 'Creating...' : 'Create Class'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


